# WattWise™ ML Intelligence Engine (`apps/ml`)

AI-powered outage prediction (GOP), counterfactual energy baseline estimation (IPMVP Option C), and nightly continuous retraining pipeline.

## Quickstart

1. **Copy configuration:**
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `FACTORY_ID`, and `FEEDER_CODE`.*

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Backtesting and Validation Suite:**
   ```bash
   pytest tests -v
   ```

4. **Execute Nightly Continuous Retraining Pipeline:**
   ```bash
   python pipeline/continuous_retrain.py
   ```
