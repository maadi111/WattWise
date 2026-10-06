# Stage 1: Build Go binary
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o wattwise-api ./cmd/server

# Stage 2: Minimal Distroless runtime (12MB final image)
FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/wattwise-api /wattwise-api
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/wattwise-api"]
