FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o /support-bot ./cmd/server

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /support-bot /app/support-bot

EXPOSE 8090

CMD ["/app/support-bot"]

