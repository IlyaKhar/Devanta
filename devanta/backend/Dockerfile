FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/migrate ./cmd/migrate

FROM alpine:3.20
WORKDIR /app
RUN adduser -D -g '' appuser && apk add --no-cache su-exec
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=builder /bin/server /usr/local/bin/server
COPY --from=builder /bin/migrate /usr/local/bin/migrate
COPY migrations ./migrations
RUN mkdir -p /app/uploads/avatars && chown -R appuser:appuser /app/uploads
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["server"]
