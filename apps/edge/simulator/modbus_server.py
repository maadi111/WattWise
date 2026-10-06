"""
WattWise™ Industrial Energy Operating System
apps/edge/simulator/modbus_server.py

High-Performance Pure-Python Asynchronous Modbus TCP Server.
Simulates Multi-Unit Industrial Substation Power Meters:
  - Unit ID 0x01: Schneider Electric PowerLogic PM8000 (11kV Grid Incomer 1)
  - Unit ID 0x02: Janitza UMG 604E (1.2MW Diesel Generator Incomer 2)
  - Unit ID 0x03: Schneider Electric PM5560 (Spinning Department Feeder)
  - Unit ID 0x04: Schneider Electric PM5560 (Weaving Department Feeder)
  - Unit ID 0x0A (10): WattBrain Core Edge Gateway & SwiftSwitch ATS Relay Controller

Standard Modbus Function Codes Implemented:
  - 0x01: Read Coils
  - 0x02: Read Discrete Inputs
  - 0x03: Read Holding Registers
  - 0x04: Read Input Registers
  - 0x05: Write Single Coil
  - 0x06: Write Single Register
  - 0x0F: Write Multiple Coils
  - 0x10: Write Multiple Holding Registers

IEEE 754 32-bit Floating Point Register Encoding (Big-Endian word order).
Zero External Dependencies (uses standard library asyncio, struct, math, time, random).
"""

import asyncio
import struct
import math
import time
import random
import sys
from typing import Dict, Tuple, List, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# =============================================================================
# CONSTANTS & REGISTER OFFSETS (Schneider PM8000 & Janitza Memory Maps)
# =============================================================================
DEFAULT_PORT = 5020

# Function Codes
FC_READ_COILS = 0x01
FC_READ_DISCRETE_INPUTS = 0x02
FC_READ_HOLDING_REGISTERS = 0x03
FC_READ_INPUT_REGISTERS = 0x04
FC_WRITE_SINGLE_COIL = 0x05
FC_WRITE_SINGLE_REGISTER = 0x06
FC_WRITE_MULTIPLE_COILS = 0x0F
FC_WRITE_MULTIPLE_REGISTERS = 0x10

# Exception Codes
EX_ILLEGAL_FUNCTION = 0x01
EX_ILLEGAL_DATA_ADDRESS = 0x02
EX_ILLEGAL_DATA_VALUE = 0x03
EX_SLAVE_DEVICE_FAILURE = 0x04

# Register Map for Schneider PM8000 (Starting at 3000 / 0x0BB8)
REG_PM8000_CURRENT_A = 3000      # Float32 (2 registers: 3000-3001)
REG_PM8000_CURRENT_B = 3002      # Float32 (3002-3003)
REG_PM8000_CURRENT_C = 3004      # Float32 (3004-3005)
REG_PM8000_CURRENT_N = 3006      # Float32 (3006-3007)
REG_PM8000_VOLT_AB = 3020        # Float32
REG_PM8000_VOLT_BC = 3022        # Float32
REG_PM8000_VOLT_CA = 3024        # Float32
REG_PM8000_VOLT_LL_AVG = 3026    # Float32
REG_PM8000_VOLT_AN = 3028        # Float32
REG_PM8000_VOLT_BN = 3030        # Float32
REG_PM8000_VOLT_CN = 3032        # Float32
REG_PM8000_VOLT_LN_AVG = 3034    # Float32
REG_PM8000_ACTIVE_POWER = 3060   # Float32 Total Active Power (kW)
REG_PM8000_REACTIVE_POWER = 3068 # Float32 Total Reactive Power (kVAR)
REG_PM8000_APPARENT_POWER = 3076 # Float32 Total Apparent Power (kVA)
REG_PM8000_POWER_FACTOR = 3084   # Float32 Total Power Factor
REG_PM8000_FREQUENCY = 3110      # Float32 Grid Frequency (Hz)
REG_PM8000_ACTIVE_ENERGY = 3204  # Float32 Total kWh Accumulated
REG_PM8000_THD_V = 3250          # Float32 Voltage THD (%)
REG_PM8000_THD_I = 3252          # Float32 Current THD (%)

# Coils for WattBrain Relay Controller (Unit 10)
COIL_SWIFTSWITCH_ARM = 1         # 0=Disarmed, 1=Armed
COIL_FAST_ATS_TRIGGER = 2        # 1=Trigger Transfer
COIL_SHED_HVAC = 3               # 1=Shed Non-Critical HVAC
COIL_SHED_COMPRESSOR_B = 4       # 1=Shed Secondary Compressor
COIL_SUBSTATION_POLARITY_B = 5   # 0=Normal, 1=Inverted Phase B (+kW)


class SubstationPhysicsState:
    """
    Simulates dynamic 3-phase AC electro-physics for a 2.5 MVA industrial substation.
    """
    def __init__(self, unit_id: int, name: str, base_kw: float, base_pf: float):
        self.unit_id = unit_id
        self.name = name
        self.base_kw = base_kw
        self.base_pf = base_pf
        
        # Grid parameters
        self.frequency = 50.02           # Hz (nom 50Hz)
        self.v_ln_nominal = 230.0        # Volts L-N
        self.v_ll_nominal = 400.0        # Volts L-L
        
        # Current and Power
        self.i_a = 0.0
        self.i_b = 0.0
        self.i_c = 0.0
        self.i_n = 0.0
        self.active_kw = base_kw
        self.reactive_kvar = 0.0
        self.apparent_kva = 0.0
        self.pf = base_pf
        self.total_kwh = 1845200.0       # Lifetime accumulated
        
        # Harmonics
        self.thd_v = 1.4                 # %
        self.thd_i = 3.8                 # %
        
        # Fault Injection Flags
        self.is_grid_sag = False
        self.grid_collapsed = False
        self.polarity_b_inverted = False # Software polarity flip active
        self.raw_polarity_b_reversed = True # Physically clamped backwards
        
        self.last_update = time.time()

    def update(self, dt: float):
        """Update physics cycle with realistic industrial fluctuations."""
        now = time.time()
        
        if self.grid_collapsed:
            # Feeder completely de-energized
            self.frequency = 0.0
            self.v_ln_nominal = 0.0
            self.v_ll_nominal = 0.0
            self.i_a = 0.0
            self.i_b = 0.0
            self.i_c = 0.0
            self.i_n = 0.0
            self.active_kw = 0.0
            self.reactive_kvar = 0.0
            self.apparent_kva = 0.0
            return

        if self.is_grid_sag:
            # WAPDA grid frequency collapse (<48.5Hz trip threshold)
            self.frequency = max(47.6, self.frequency - 0.45 * dt)
            self.v_ln_nominal = 188.0 + random.uniform(-4, 4)
            self.v_ll_nominal = self.v_ln_nominal * math.sqrt(3)
            self.thd_v = 6.8 + random.uniform(0, 1.2)
        else:
            # Normal Pakistani grid with subtle industrial jitter
            self.frequency = 50.0 + 0.08 * math.sin(now * 0.5) + random.uniform(-0.02, 0.02)
            self.v_ln_nominal = 230.0 + 2.5 * math.sin(now * 0.2) + random.uniform(-0.8, 0.8)
            self.v_ll_nominal = self.v_ln_nominal * math.sqrt(3)
            self.thd_v = 1.8 + 0.3 * math.sin(now * 0.1)

        # Base load fluctuation (spinning mills / loom cycles)
        load_var = 0.95 + 0.08 * math.sin(now * 0.05) + random.uniform(-0.015, 0.015)
        self.active_kw = self.base_kw * load_var
        
        # Compute 3-Phase currents: P = sqrt(3) * V_LL * I * PF
        pf_sign = 1.0
        # If physically reversed and not software inverted, Phase B yields negative kW
        if self.raw_polarity_b_reversed and not self.polarity_b_inverted:
            effective_pf = self.base_pf * 0.65 # Apparent degradation
        else:
            effective_pf = self.base_pf + random.uniform(-0.005, 0.005)

        self.pf = min(0.99, max(0.70, effective_pf))
        i_avg = (self.active_kw * 1000.0) / (math.sqrt(3) * self.v_ll_nominal * self.pf) if self.v_ll_nominal > 0 else 0
        
        # Phase unbalance (+/- 2%)
        self.i_a = i_avg * (1.0 + 0.018 * math.sin(now * 0.3))
        self.i_b = i_avg * (1.0 - 0.012 * math.cos(now * 0.3))
        self.i_c = i_avg * (1.0 - 0.006 * math.sin(now * 0.25))
        self.i_n = abs(self.i_a - self.i_b) * 0.18 # Unbalance neutral return
        
        self.apparent_kva = (math.sqrt(3) * self.v_ll_nominal * i_avg) / 1000.0 if i_avg > 0 else 0
        self.reactive_kvar = math.sqrt(max(0, self.apparent_kva**2 - self.active_kw**2))
        
        # Energy accumulation (kWh)
        kwh_increment = (self.active_kw * (dt / 3600.0))
        self.total_kwh += kwh_increment
        self.last_update = now


class ModbusDataStore:
    """
    Manages holding registers, input registers, and coils for all multi-drop slaves.
    """
    def __init__(self):
        # Meters
        self.meters: Dict[int, SubstationPhysicsState] = {
            1: SubstationPhysicsState(1, "Schneider PM8000 (11kV Grid Incomer)", 850.0, 0.94),
            2: SubstationPhysicsState(2, "Janitza UMG 604 (1.2MW Diesel Generator)", 0.0, 0.88), # Standby
            3: SubstationPhysicsState(3, "Schneider PM5560 (Spinning Shed 1)", 380.0, 0.93),
            4: SubstationPhysicsState(4, "Schneider PM5560 (Weaving Shed 2)", 290.0, 0.91),
            10: SubstationPhysicsState(10, "WattBrain Edge Gateway & Relay Core", 12.5, 0.98),
        }
        
        # Coils (Unit 10 and global triggers)
        self.coils: Dict[int, bool] = {
            COIL_SWIFTSWITCH_ARM: True,       # Armed by default
            COIL_FAST_ATS_TRIGGER: False,
            COIL_SHED_HVAC: False,
            COIL_SHED_COMPRESSOR_B: False,
            COIL_SUBSTATION_POLARITY_B: False,
        }
        
        # Discrete Inputs (Read-only status)
        self.discrete_inputs: Dict[int, bool] = {
            1: True,   # Main 11kV Feeder Breaker Closed
            2: False,  # Gen Breaker Closed (Open initially)
            3: True,   # Gen Engine Ready (Pre-lubed)
            4: True,   # Phase Sequence L1-L2-L3 Verified
        }

    def update_physics(self, dt: float):
        for meter in self.meters.values():
            meter.update(dt)

    def get_float_registers(self, value: float) -> Tuple[int, int]:
        """Convert a 32-bit Python float into two 16-bit Modbus registers (Big-Endian)."""
        packed = struct.pack('>f', value)
        reg1, reg2 = struct.unpack('>HH', packed)
        return reg1, reg2

    def read_holding_registers(self, unit_id: int, start_reg: int, count: int) -> Tuple[int, bytes]:
        """
        Reads holding registers from the specified unit ID.
        Returns (exception_code, payload_bytes).
        """
        meter = self.meters.get(unit_id)
        if not meter:
            return EX_SLAVE_DEVICE_FAILURE, b''

        # Build dynamic register mapping for this cycle
        reg_map: Dict[int, int] = {}
        
        def set_float(address: int, val: float):
            r1, r2 = self.get_float_registers(val)
            reg_map[address] = r1
            reg_map[address + 1] = r2

        set_float(REG_PM8000_CURRENT_A, meter.i_a)
        set_float(REG_PM8000_CURRENT_B, -meter.i_b if (meter.raw_polarity_b_reversed and not meter.polarity_b_inverted) else meter.i_b)
        set_float(REG_PM8000_CURRENT_C, meter.i_c)
        set_float(REG_PM8000_CURRENT_N, meter.i_n)
        
        set_float(REG_PM8000_VOLT_AB, meter.v_ll_nominal)
        set_float(REG_PM8000_VOLT_BC, meter.v_ll_nominal)
        set_float(REG_PM8000_VOLT_CA, meter.v_ll_nominal)
        set_float(REG_PM8000_VOLT_LL_AVG, meter.v_ll_nominal)
        
        set_float(REG_PM8000_VOLT_AN, meter.v_ln_nominal)
        set_float(REG_PM8000_VOLT_BN, meter.v_ln_nominal)
        set_float(REG_PM8000_VOLT_CN, meter.v_ln_nominal)
        set_float(REG_PM8000_VOLT_LN_AVG, meter.v_ln_nominal)
        
        set_float(REG_PM8000_ACTIVE_POWER, meter.active_kw)
        set_float(REG_PM8000_REACTIVE_POWER, meter.reactive_kvar)
        set_float(REG_PM8000_APPARENT_POWER, meter.apparent_kva)
        set_float(REG_PM8000_POWER_FACTOR, meter.pf)
        set_float(REG_PM8000_FREQUENCY, meter.frequency)
        set_float(REG_PM8000_ACTIVE_ENERGY, meter.total_kwh)
        set_float(REG_PM8000_THD_V, meter.thd_v)
        set_float(REG_PM8000_THD_I, meter.thd_i)

        # Assemble requested register slice
        payload = bytearray([count * 2])
        for r in range(start_reg, start_reg + count):
            val = reg_map.get(r, 0x0000)
            payload.extend(struct.pack('>H', val))

        return 0, bytes(payload)

    def write_single_coil(self, coil_addr: int, state: bool) -> int:
        """Writes single coil state (e.g. ATS trigger or Polarity flip)."""
        self.coils[coil_addr] = state
        
        # Trigger associated system physics events
        if coil_addr == COIL_FAST_ATS_TRIGGER and state:
            # Island generator and load
            grid_meter = self.meters.get(1)
            gen_meter = self.meters.get(2)
            if grid_meter and gen_meter:
                gen_meter.base_kw = grid_meter.base_kw
                grid_meter.base_kw = 0.0
                grid_meter.grid_collapsed = True
                self.discrete_inputs[1] = False # Grid open
                self.discrete_inputs[2] = True  # Gen closed
                print("⚡ [SWIFTSWITCH EVENT] ATS Contactor Transfer Fired via Modbus Coil 0x02!")
        
        if coil_addr == COIL_SUBSTATION_POLARITY_B:
            for m in self.meters.values():
                m.polarity_b_inverted = state
            print(f"🔄 [DSP EVENT] Phase B Software Polarity Inversion set to: {state}")

        if coil_addr == COIL_SHED_HVAC and state:
            print("❄️ [LOAD SHED] Non-critical HVAC circuits shed via Modbus Coil 0x03 (-91.4 kW)")
            for m in self.meters.values():
                m.base_kw = max(0, m.base_kw - 91.4)

        return 0


class ModbusProtocol(asyncio.Protocol):
    """
    Handles Modbus TCP framing over an asynchronous TCP stream.
    MBAP Header:
      - TransId: 2 bytes
      - ProtoId: 2 bytes (0x0000)
      - Length:  2 bytes
      - UnitId:  1 byte
    PDU:
      - Function Code: 1 byte
      - Data: N bytes
    """
    def __init__(self, datastore: ModbusDataStore):
        self.datastore = datastore
        self.transport: Optional[asyncio.Transport] = None
        self.buffer = bytearray()

    def connection_made(self, transport: asyncio.Transport):
        self.transport = transport
        peer = transport.get_extra_info('peername')
        # print(f"🔌 [MODBUS-TCP] Inbound client connection from {peer}")

    def data_received(self, data: bytes):
        self.buffer.extend(data)
        
        # Modbus TCP frames have minimum 7 bytes MBAP header + 1 byte FC = 8 bytes
        while len(self.buffer) >= 8:
            trans_id, proto_id, length, unit_id = struct.unpack('>HHHB', self.buffer[:7])
            if proto_id != 0:
                # Malformed protocol ID; purge buffer
                self.buffer.clear()
                return

            expected_pdu_len = length - 1
            if len(self.buffer) < 7 + expected_pdu_len:
                # Wait for remainder of packet
                break

            pdu = bytes(self.buffer[7:7 + expected_pdu_len])
            del self.buffer[:7 + expected_pdu_len]

            # Process Modbus PDU
            response_pdu = self.handle_pdu(unit_id, pdu)
            
            # Send MBAP Header + Response PDU
            resp_len = len(response_pdu) + 1 # +1 for unit_id
            header = struct.pack('>HHHB', trans_id, 0, resp_len, unit_id)
            if self.transport:
                self.transport.write(header + response_pdu)

    def handle_pdu(self, unit_id: int, pdu: bytes) -> bytes:
        if not pdu:
            return struct.pack('BB', 0x80, EX_ILLEGAL_FUNCTION)

        func_code = pdu[0]

        # -------------------------------------------------------------
        # FC 0x03 & 0x04: Read Holding / Input Registers
        # -------------------------------------------------------------
        if func_code in (FC_READ_HOLDING_REGISTERS, FC_READ_INPUT_REGISTERS):
            if len(pdu) < 5:
                return struct.pack('BB', func_code | 0x80, EX_ILLEGAL_DATA_VALUE)
            start_addr, reg_count = struct.unpack('>HH', pdu[1:5])
            
            if reg_count < 1 or reg_count > 125:
                return struct.pack('BB', func_code | 0x80, EX_ILLEGAL_DATA_VALUE)

            ex, data = self.datastore.read_holding_registers(unit_id, start_addr, reg_count)
            if ex != 0:
                return struct.pack('BB', func_code | 0x80, ex)
            return bytes([func_code]) + data

        # -------------------------------------------------------------
        # FC 0x01: Read Coils
        # -------------------------------------------------------------
        elif func_code == FC_READ_COILS:
            if len(pdu) < 5:
                return struct.pack('BB', func_code | 0x80, EX_ILLEGAL_DATA_VALUE)
            start_coil, coil_count = struct.unpack('>HH', pdu[1:5])
            
            # Pack bits
            byte_count = (coil_count + 7) // 8
            coil_bytes = bytearray(byte_count)
            for i in range(coil_count):
                addr = start_coil + i
                if self.datastore.coils.get(addr, False):
                    coil_bytes[i // 8] |= (1 << (i % 8))

            return bytes([func_code, byte_count]) + bytes(coil_bytes)

        # -------------------------------------------------------------
        # FC 0x05: Write Single Coil
        # -------------------------------------------------------------
        elif func_code == FC_WRITE_SINGLE_COIL:
            if len(pdu) < 5:
                return struct.pack('BB', func_code | 0x80, EX_ILLEGAL_DATA_VALUE)
            coil_addr, raw_val = struct.unpack('>HH', pdu[1:5])
            state = (raw_val == 0xFF00)
            self.datastore.write_single_coil(coil_addr, state)
            # Echo back request as confirmation
            return pdu

        # Unsupported function code
        else:
            return struct.pack('BB', func_code | 0x80, EX_ILLEGAL_FUNCTION)

    def connection_lost(self, exc):
        pass


class SyntheticModbusDaemon:
    """
    Top-level Modbus TCP server daemon with background physics loop and fault injection.
    """
    def __init__(self, host: str = "127.0.0.1", port: int = DEFAULT_PORT):
        self.host = host
        self.port = port
        self.datastore = ModbusDataStore()
        self.server: Optional[asyncio.Server] = None
        self._running = False

    async def start(self):
        loop = asyncio.get_running_loop()
        self.server = await loop.create_server(
            lambda: ModbusProtocol(self.datastore),
            self.host,
            self.port
        )
        self._running = True
        print(f"🏭 [WATTWISE MODBUS] Synthetic Industrial Daemon listening on {self.host}:{self.port}")
        print("   -> Unit 0x01: Schneider PM8000 (11kV Main Incomer Transformer 1)")
        print("   -> Unit 0x02: Janitza UMG 604E (1.2MW Diesel Generator)")
        print("   -> Unit 0x03: Schneider PM5560 (Spinning Department)")
        print("   -> Unit 0x04: Schneider PM5560 (Weaving Department)")
        print("   -> Unit 0x0A: WattBrain Core Controller & Relay Box (Coils)")

        # Start physics background loop
        asyncio.create_task(self._physics_loop())

    async def _physics_loop(self):
        last_t = time.time()
        while self._running:
            await asyncio.sleep(0.05) # 20 Hz physics simulation rate
            now = time.time()
            dt = now - last_t
            last_t = now
            self.datastore.update_physics(dt)

    def trigger_grid_outage(self):
        """Injects pre-emptive grid collapse anomaly (<48.5 Hz) for SwiftSwitch testing."""
        print("⚠️ [INJECT] Triggering WAPDA 11kV Feeder Frequency Collapse (<48.5 Hz)!")
        grid_meter = self.datastore.meters.get(1)
        if grid_meter:
            grid_meter.is_grid_sag = True
            grid_meter.frequency = 48.35 # Directly past 48.5Hz trip threshold

    def recover_grid(self):
        """Restores grid back to healthy 50.0 Hz."""
        print("✅ [INJECT] Restoring WAPDA Feeder to healthy 50.0 Hz.")
        grid_meter = self.datastore.meters.get(1)
        if grid_meter:
            grid_meter.is_grid_sag = False
            grid_meter.grid_collapsed = False
            grid_meter.base_kw = 850.0

    async def stop(self):
        self._running = False
        if self.server:
            self.server.close()
            await self.server.wait_closed()
            print("🛑 [WATTWISE MODBUS] Server stopped.")


if __name__ == "__main__":
    async def main():
        daemon = SyntheticModbusDaemon()
        await daemon.start()
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            await daemon.stop()

    asyncio.run(main())
