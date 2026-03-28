#!/bin/sh
set -e
mkdir -p /app/uploads/avatars
# Том docker на /app/uploads часто root:root — без chown appuser не пишет и не читает стабильно.
chown -R appuser:appuser /app/uploads
case "$1" in
server)
	exec su-exec appuser /usr/local/bin/server
	;;
migrate)
	shift
	exec su-exec appuser /usr/local/bin/migrate "$@"
	;;
*)
	exec su-exec appuser "$@"
	;;
esac
