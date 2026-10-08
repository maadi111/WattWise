# Stage 1: Build Go binary
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o wattwise-api ./cmd/server

# Stage 2: Minimal hardened Alpine runtime
FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata curl && \
    addgroup -S wattwise && adduser -S wattwise -G wattwise
WORKDIR /app
COPY --from=builder /app/wattwise-api /app/wattwise-api
USER wattwise:wattwise
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/healthz || exit 1
ENTRYPOINT ["/app/wattwise-api"]
