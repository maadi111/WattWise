# WattWise™ Go API Server (`apps/api`)

Production-grade industrial SCADA and energy arbitrage API built with Go 1.22 and Gin.

## Quickstart

1. **Copy configuration:**
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your PostgreSQL, InfluxDB, and Redis connection strings.*

2. **Verify dependencies and build:**
   ```bash
   go mod verify
   go build ./...
   ```

3. **Run automated test suite:**
   ```bash
   go test -v -race ./...
   ```

4. **Start API server:**
   ```bash
   go run cmd/server/main.go
   ```

## Endpoints
* `GET /health` & `/healthz`: Liveness probe
* `GET /readiness` & `/readyz`: Readiness probe (verifies Postgres, Redis, InfluxDB, Kafka)
* `POST /v1/auth/login`: RS256 JWT login with Argon2id verification
* `GET /v1/factories`: Multi-tenant factory fleet list
