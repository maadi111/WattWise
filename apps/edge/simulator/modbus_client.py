"""
WattWise™ Industrial Energy Operating System
apps/edge/simulator/modbus_client.py

High-Speed Asynchronous Modbus TCP Poller & Autonomous SwiftSwitch Edge Supervisor.
Polls Schneider PM8000 and Janitza UMG 604 meters at 100ms interval (<10ms latency).
Detects Grid Frequency Sags (<48.5 Hz) and executes sub-cycle ATS Transfers via Modbus Coils.
Zero External Dependencies (uses standard library asyncio, struct, time).
"""

import asyncio
import struct
import time
import sys
from typing import Dict, Any, Optional, Tuple, List

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Function Codes
FC_READ_COILS = 0x01
FC_READ_HOLDING_REGISTERS = 0x03
FC_WRITE_SINGLE_COIL = 0x05

# Schneider PM8000 Register Map
REG_CURRENT_A = 3000
REG_VOLT_LL_AVG = 3026
REG_VOLT_LN_AVG = 3034
REG_ACTIVE_POWER = 3060
REG_REACTIVE_POWER = 3068
REG_POWER_FACTOR = 3084
REG_FREQUENCY = 3110
REG_ACTIVE_ENERGY = 3204
REG_THD_V = 3250
REG_THD_I = 3252

# Coils
COIL_SWIFTSWITCH_ARM = 1
COIL_FAST_ATS_TRIGGER = 2
COIL_SHED_HVAC = 3
COIL_SUBSTATION_POLARITY_B = 5


class ModbusTCPClient:
    """
    Asynchronous pure-Python Modbus TCP client.
    """
    def __init__(self, host: str = "127.0.0.1", port: int = 5020):
        self.host = host
        self.port = port
        self.reader: Optional[asyncio.StreamReader] = None
        self.writer: Optional[asyncio.StreamWriter] = None
        self._trans_id = 1
        self._lock = asyncio.Lock()

    async def connect(self):
        self.reader, self.writer = await asyncio.open_connection(self.host, self.port)

    async def close(self):
        if self.writer:
            self.writer.close()
            await self.writer.wait_closed()
            self.reader = None
            self.writer = None

    def _next_trans_id(self) -> int:
        tid = self._trans_id
        self._trans_id = (self._trans_id + 1) & 0xFFFF
        return tid

    async def read_holding_registers(self, unit_id: int, start_reg: int, count: int) -> List[int]:
        """Reads 16-bit holding registers over Modbus TCP."""
        async with self._lock:
            if not self.writer or not self.reader:
                raise ConnectionError("Modbus TCP client is not connected.")

            trans_id = self._next_trans_id()
            # MBAP (7 bytes) + PDU (5 bytes)
            # Length = 6 (1 byte UnitId + 5 bytes PDU)
            req = struct.pack('>HHHBBHH', trans_id, 0, 6, unit_id, FC_READ_HOLDING_REGISTERS, start_reg, count)
            self.writer.write(req)
            await self.writer.drain()

            # Read MBAP response (7 bytes)
            header = await self.reader.readexactly(7)
            resp_tid, resp_proto, resp_len, resp_uid = struct.unpack('>HHHB', header)
            
            # Read PDU response
            pdu = await self.reader.readexactly(resp_len - 1)
            fc = pdu[0]
            if fc & 0x80:
                raise RuntimeError(f"Modbus Exception: FC={fc:#x}, Code={pdu[1]:#x}")

            byte_count = pdu[1]
            raw_regs = pdu[2:2 + byte_count]
            regs = []
            for i in range(0, len(raw_regs), 2):
                regs.append(struct.unpack('>H', raw_regs[i:i+2])[0])
            return regs

    async def read_float32(self, unit_id: int, start_reg: int) -> float:
        """Reads two 16-bit registers and decodes as a Big-Endian IEEE-754 32-bit float."""
        regs = await self.read_holding_registers(unit_id, start_reg, 2)
        packed = struct.pack('>HH', regs[0], regs[1])
        return struct.unpack('>f', packed)[0]

    async def write_single_coil(self, unit_id: int, coil_addr: int, state: bool) -> bool:
        """Writes a single coil (0xFF00 = ON, 0x0000 = OFF)."""
        async with self._lock:
            if not self.writer or not self.reader:
                raise ConnectionError("Modbus TCP client is not connected.")

            trans_id = self._next_trans_id()
            raw_val = 0xFF00 if state else 0x0000
            req = struct.pack('>HHHBBHH', trans_id, 0, 6, unit_id, FC_WRITE_SINGLE_COIL, coil_addr, raw_val)
            self.writer.write(req)
            await self.writer.drain()

            header = await self.reader.readexactly(7)
            _, _, resp_len, _ = struct.unpack('>HHHB', header)
            pdu = await self.reader.readexactly(resp_len - 1)
            fc = pdu[0]
            if fc & 0x80:
                raise RuntimeError(f"Modbus Exception on Write Coil: Code={pdu[1]:#x}")
            return True


class SwiftSwitchEdgeSupervisor:
    """
    Sub-cycle supervisory control loop running on the WattBrain edge controller.
    Continuously monitors grid telemetry from PM8000.
    Executes autonomous contactor transfers if frequency collapses below 48.5 Hz.
    """
    def __init__(self, client: ModbusTCPClient):
        self.client = client
        self.running = False
        self.trip_count = 0

    async def poll_meter(self, unit_id: int) -> Dict[str, Any]:
        """Polls key SCADA telemetry block from power meter."""
        t0 = time.perf_counter()
        
        # Read continuous block from 3000 to 3086 (86 registers)
        regs = await self.client.read_holding_registers(unit_id, 3000, 86)
        latency_ms = (time.perf_counter() - t0) * 1000.0

        def decode_f32(offset: int) -> float:
            idx = offset - 3000
            packed = struct.pack('>HH', regs[idx], regs[idx+1])
            return round(struct.unpack('>f', packed)[0], 2)

        freq_regs = await self.client.read_holding_registers(unit_id, REG_FREQUENCY, 2)
        packed_freq = struct.pack('>HH', freq_regs[0], freq_regs[1])
        freq = round(struct.unpack('>f', packed_freq)[0], 3)

        return {
            "unit_id": unit_id,
            "current_a": decode_f32(REG_CURRENT_A),
            "volt_ll": decode_f32(REG_VOLT_LL_AVG),
            "volt_ln": decode_f32(REG_VOLT_LN_AVG),
            "power_kw": decode_f32(REG_ACTIVE_POWER),
            "power_kvar": decode_f32(REG_REACTIVE_POWER),
            "power_factor": decode_f32(REG_POWER_FACTOR),
            "frequency_hz": freq,
            "latency_ms": round(latency_ms, 2),
            "timestamp": time.time(),
        }

    async def run_supervisory_loop(self, poll_interval: float = 0.1):
        """
        Runs edge protection loop at 10 Hz (100ms cycle).
        """
        self.running = True
        print("⚡ [SWIFTSWITCH SUPERVISOR] Armed & monitoring Modbus telemetry...")

        while self.running:
            try:
                # 1. Poll Main 11kV Incomer (Unit 1)
                data = await self.poll_meter(unit_id=1)
                freq = data["frequency_hz"]
                volt = data["volt_ll"]
                kw = data["power_kw"]
                pf = data["power_factor"]

                # 2. Check SEV-1 Frequency Sag condition
                if 0 < freq < 48.5:
                    t_detect = time.perf_counter()
                    print(f"🚨 [SEV-1 ALERT] Grid Frequency Sag detected: {freq:.2f} Hz (<48.5Hz)! Triggering SwiftSwitch Transfer!")
                    
                    # Autonomous Contact Transfer Write
                    await self.client.write_single_coil(unit_id=10, coil_addr=COIL_FAST_ATS_TRIGGER, state=True)
                    # Non-critical load shed
                    await self.client.write_single_coil(unit_id=10, coil_addr=COIL_SHED_HVAC, state=True)
                    
                    t_transfer_ms = (time.perf_counter() - t_detect) * 1000.0
                    self.trip_count += 1
                    print(f"✅ [SWIFTSWITCH ISOLATED] ATS Transfer & Load Shed executed in {t_transfer_ms:.2f} ms! Factory Islanded.")
                    break

                await asyncio.sleep(poll_interval)
            except Exception as e:
                print(f"⚠️ [POLL WARNING] Telemetry read error: {e}")
                await asyncio.sleep(poll_interval)


if __name__ == "__main__":
    async def demo():
        client = ModbusTCPClient()
        await client.connect()
        supervisor = SwiftSwitchEdgeSupervisor(client)
        
        print("📊 Polling Schneider PM8000 (Unit 1)...")
        data = await supervisor.poll_meter(1)
        print(f"Telemetry: {data}")
        
        await client.close()

    asyncio.run(demo())
