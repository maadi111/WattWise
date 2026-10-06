#!/usr/bin/env bash
# WattBrain Production Edge OS Provisioning Script
# Runs on Ubuntu 22.04 LTS (ARM64) on Raspberry Pi CM4
set -euo pipefail

echo "=========================================================="
echo "⚡ WattWise WattBrain™ Edge Controller Provisioning v1.0 ⚡"
echo "=========================================================="

echo "[1/5] Updating APT package repositories..."
sudo apt-get update -y
sudo apt-get install -y python3.11 python3-pip mosquitto-clients sqlite3 watchdog

echo "[2/5] Installing Python edge dependencies..."
pip3 install --no-cache-dir onnxruntime paho-mqtt pyserial

echo "[3/5] Configuring BCM2835 Hardware Watchdog..."
sudo modprobe bcm2835_wdt || true
echo "watchdog-device = /dev/watchdog" | sudo tee -a /etc/watchdog.conf
echo "watchdog-timeout = 30" | sudo tee -a /etc/watchdog.conf
sudo systemctl enable watchdog

echo "[4/5] Installing WattBrain Systemd Daemon..."
sudo tee /etc/systemd/system/wattbrain.service > /dev/null <<EOF
[Unit]
Description=WattBrain Edge Process Manager
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/wattbrain
ExecStart=/usr/bin/python3 /opt/wattbrain/wattbrain/main.py
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

echo "[5/5] Provisioning Complete. WattBrain is armed and ready."
