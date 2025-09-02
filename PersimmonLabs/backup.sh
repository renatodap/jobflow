#!/bin/bash
set -euo pipefail

# n8n Database Backup Script with Rotation
# This script creates compressed PostgreSQL backups and maintains a 7-day retention policy

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/n8n-${TIMESTAMP}.sql.gz"
DAYS_TO_KEEP=7

# Ensure backup directory exists
mkdir -p ${BACKUP_DIR}

# Load environment variables
if [ -f /opt/n8n-deployment/.env ]; then
    source /opt/n8n-deployment/.env
else
    echo "[ERROR] Environment file not found at /opt/n8n-deployment/.env"
    exit 1
fi

echo "======================================"
echo "n8n Database Backup"
echo "Started at: $(date)"
echo "======================================"

# Check if PostgreSQL container is running
if ! docker ps | grep -q n8n-postgres; then
    echo "[ERROR] PostgreSQL container is not running!"
    exit 1
fi

# Perform database backup
echo "[INFO] Creating backup: ${BACKUP_FILE}"
if docker exec n8n-postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > "${BACKUP_FILE}"; then
    # Verify backup file was created and has content
    if [ -s "${BACKUP_FILE}" ]; then
        BACKUP_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
        echo "[SUCCESS] Backup created successfully (Size: ${BACKUP_SIZE})"
        
        # Calculate and display backup statistics
        BACKUP_COUNT=$(find ${BACKUP_DIR} -name "n8n-*.sql.gz" -type f | wc -l)
        TOTAL_SIZE=$(du -sh ${BACKUP_DIR} | awk '{print $1}')
        echo "[INFO] Total backups: ${BACKUP_COUNT}, Total size: ${TOTAL_SIZE}"
    else
        echo "[ERROR] Backup file is empty!"
        rm -f "${BACKUP_FILE}"
        exit 1
    fi
else
    echo "[ERROR] Backup failed!"
    exit 1
fi

# Remove old backups
echo "[INFO] Cleaning up backups older than ${DAYS_TO_KEEP} days..."
DELETED_COUNT=0
while IFS= read -r old_backup; do
    echo "[INFO] Deleting old backup: $(basename "$old_backup")"
    rm -f "$old_backup"
    ((DELETED_COUNT++))
done < <(find ${BACKUP_DIR} -name "n8n-*.sql.gz" -type f -mtime +${DAYS_TO_KEEP})

if [ ${DELETED_COUNT} -gt 0 ]; then
    echo "[INFO] Deleted ${DELETED_COUNT} old backup(s)"
else
    echo "[INFO] No old backups to delete"
fi

# List current backups
echo ""
echo "Current backups in ${BACKUP_DIR}:"
echo "--------------------------------"
ls -lht ${BACKUP_DIR}/n8n-*.sql.gz 2>/dev/null | head -10 || echo "No backups found"

echo ""
echo "======================================"
echo "Backup completed at: $(date)"
echo "======================================"

# Optional: Send notification (uncomment and configure as needed)
# You can integrate with services like:
# - Slack webhook
# - Email via sendmail/postfix
# - Discord webhook
# - Custom monitoring endpoint

# Example health check ping (replace with your monitoring service)
# curl -fsS --retry 3 https://your-monitoring-service.com/ping/backup-success > /dev/null 2>&1

exit 0