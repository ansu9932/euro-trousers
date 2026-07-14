#!/bin/sh
set -eu
STAMP=$(date +%Y-%m-%d_%H%M%S)
DEST=${BACKUP_DESTINATION:-./backups}
mkdir -p "$DEST"
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-customs}" "${POSTGRES_DB:-customsdb}" | gzip > "$DEST/postgres_$STAMP.sql.gz"
docker run --rm -v euro-trousers-customs_minio_data:/data -v "$DEST:/backup" alpine tar czf "/backup/minio_$STAMP.tar.gz" /data
find "$DEST" -type f -mtime +35 -delete
