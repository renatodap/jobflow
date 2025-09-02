#!/bin/bash
set -euo pipefail

# n8n Production Deployment Script for Ubuntu 22.04
# This script is idempotent - safe to run multiple times

echo "======================================"
echo "n8n Production Deployment Script"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Get domain name from user
read -p "Enter your domain for n8n (e.g., n8n.agency.com): " N8N_DOMAIN
read -p "Enter your email for Let's Encrypt SSL: " LETSENCRYPT_EMAIL
read -sp "Enter password for n8n admin user: " N8N_PASSWORD
echo
read -sp "Enter password for PostgreSQL database: " DB_PASSWORD
echo

# Validate inputs
if [[ -z "$N8N_DOMAIN" ]] || [[ -z "$LETSENCRYPT_EMAIL" ]] || [[ -z "$N8N_PASSWORD" ]] || [[ -z "$DB_PASSWORD" ]]; then
    echo -e "${RED}All inputs are required!${NC}"
    exit 1
fi

echo -e "${GREEN}Starting deployment...${NC}"

# Update system
echo "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install required packages
echo "Installing required packages..."
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw \
    cron

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
else
    echo "Docker already installed"
fi

# Install Docker Compose v2 if not present
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose v2..."
    apt-get install -y -qq docker-compose-plugin
else
    echo "Docker Compose already installed"
fi

# Create deployment directory
DEPLOY_DIR="/opt/n8n-deployment"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Create required directories
mkdir -p ./n8n-data
mkdir -p ./postgres-data
mkdir -p ./letsencrypt
mkdir -p /backups

# Generate random encryption key for n8n
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Create .env file with sensitive variables
cat > .env << EOF
# n8n Configuration
N8N_DOMAIN=${N8N_DOMAIN}
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}

# Database Configuration
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_USER=n8n
POSTGRES_DB=n8n

# Let's Encrypt
LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL}

# Webhook URL
WEBHOOK_URL=https://${N8N_DOMAIN}/
N8N_HOST=${N8N_DOMAIN}
N8N_PROTOCOL=https
N8N_PORT=5678

# Security
N8N_BASIC_AUTH_ACTIVE=true
N8N_SECURE_COOKIE=true
EOF

# Set proper permissions for .env file
chmod 600 .env

# Create docker-compose.yml
cat > docker-compose.yml << 'EOFDOCKER'
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      # API and Dashboard
      - --api.dashboard=false
      # Docker provider
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      # Entry points
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      # HTTP to HTTPS redirect
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
      # Let's Encrypt
      - --certificatesresolvers.letsencrypt.acme.email=${LETSENCRYPT_EMAIL}
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
      # Logging
      - --log.level=INFO
      - --accesslog=true
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "traefik", "healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  n8n:
    image: n8nio/n8n:1.65.0
    container_name: n8n
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      # General
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: 5678
      N8N_PROTOCOL: ${N8N_PROTOCOL}
      WEBHOOK_URL: ${WEBHOOK_URL}
      
      # Authentication
      N8N_BASIC_AUTH_ACTIVE: ${N8N_BASIC_AUTH_ACTIVE}
      N8N_BASIC_AUTH_USER: ${N8N_BASIC_AUTH_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_BASIC_AUTH_PASSWORD}
      
      # Database
      DB_TYPE: ${DB_TYPE}
      DB_POSTGRESDB_HOST: ${DB_POSTGRESDB_HOST}
      DB_POSTGRESDB_PORT: ${DB_POSTGRESDB_PORT}
      DB_POSTGRESDB_DATABASE: ${DB_POSTGRESDB_DATABASE}
      DB_POSTGRESDB_USER: ${DB_POSTGRESDB_USER}
      DB_POSTGRESDB_PASSWORD: ${DB_POSTGRESDB_PASSWORD}
      
      # Security
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      N8N_SECURE_COOKIE: ${N8N_SECURE_COOKIE}
      
      # Performance
      EXECUTIONS_PROCESS: main
      N8N_METRICS: true
      
      # Timezone
      GENERIC_TIMEZONE: America/New_York
      TZ: America/New_York
    volumes:
      - ./n8n-data:/home/node/.n8n
    networks:
      - n8n-network
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`${N8N_DOMAIN}`)
      - traefik.http.routers.n8n.entrypoints=websecure
      - traefik.http.routers.n8n.tls=true
      - traefik.http.routers.n8n.tls.certresolver=letsencrypt
      - traefik.http.services.n8n.loadbalancer.server.port=5678
      - traefik.http.middlewares.n8n-headers.headers.stseconds=31536000
      - traefik.http.middlewares.n8n-headers.headers.stsincludesubdomains=true
      - traefik.http.middlewares.n8n-headers.headers.stspreload=true
      - traefik.http.routers.n8n.middlewares=n8n-headers
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  n8n-network:
    driver: bridge

volumes:
  n8n-data:
  postgres-data:
  letsencrypt:
EOFDOCKER

# Configure UFW firewall
echo "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
echo "y" | ufw enable

# Create backup script
cat > /backups/backup.sh << 'EOFBACKUP'
#!/bin/bash
set -euo pipefail

# n8n Database Backup Script
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/n8n-${TIMESTAMP}.sql.gz"
DAYS_TO_KEEP=7

# Load environment variables
source /opt/n8n-deployment/.env

echo "[$(date)] Starting database backup..."

# Perform backup
docker exec n8n-postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: ${BACKUP_FILE}"
    
    # Remove old backups
    find ${BACKUP_DIR} -name "n8n-*.sql.gz" -type f -mtime +${DAYS_TO_KEEP} -delete
    echo "[$(date)] Cleaned up backups older than ${DAYS_TO_KEEP} days"
else
    echo "[$(date)] Backup failed!"
    exit 1
fi

# List current backups
echo "[$(date)] Current backups:"
ls -lh ${BACKUP_DIR}/n8n-*.sql.gz 2>/dev/null || echo "No backups found"
EOFBACKUP

chmod +x /backups/backup.sh

# Add cron job for daily backup at 2 AM
CRON_JOB="0 2 * * * /backups/backup.sh >> /backups/backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "/backups/backup.sh" ; echo "$CRON_JOB") | crontab -

# Create health check endpoint script
cat > /usr/local/bin/n8n-health-check.sh << 'EOFHEALTH'
#!/bin/bash
# Simple health check script for monitoring services

# Check if n8n is responding
N8N_STATUS=$(docker exec n8n wget --spider -q http://localhost:5678/healthz && echo "UP" || echo "DOWN")

# Check if PostgreSQL is healthy
DB_STATUS=$(docker exec n8n-postgres pg_isready -U n8n -d n8n > /dev/null 2>&1 && echo "UP" || echo "DOWN")

# Check if Traefik is running
TRAEFIK_STATUS=$(docker ps | grep -q traefik && echo "UP" || echo "DOWN")

echo "Health Check Report - $(date)"
echo "========================="
echo "n8n Status: $N8N_STATUS"
echo "Database Status: $DB_STATUS"
echo "Traefik Status: $TRAEFIK_STATUS"

# Return non-zero exit code if any service is down
if [[ "$N8N_STATUS" == "DOWN" ]] || [[ "$DB_STATUS" == "DOWN" ]] || [[ "$TRAEFIK_STATUS" == "DOWN" ]]; then
    exit 1
fi
EOFHEALTH

chmod +x /usr/local/bin/n8n-health-check.sh

# Create systemd service for auto-start
cat > /etc/systemd/system/n8n-deployment.service << 'EOFSYSTEMD'
[Unit]
Description=n8n Deployment Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/n8n-deployment
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
StandardOutput=journal

[Install]
WantedBy=multi-user.target
EOFSYSTEMD

# Enable the service
systemctl daemon-reload
systemctl enable n8n-deployment.service

# Start the stack
echo -e "${YELLOW}Starting n8n stack...${NC}"
docker compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run health check
if /usr/local/bin/n8n-health-check.sh; then
    echo -e "${GREEN}======================================"
    echo "Deployment completed successfully!"
    echo "======================================"
    echo ""
    echo "Access n8n at: https://${N8N_DOMAIN}"
    echo "Username: admin"
    echo "Password: [the password you provided]"
    echo ""
    echo "Important files:"
    echo "  Config: /opt/n8n-deployment/docker-compose.yml"
    echo "  Env vars: /opt/n8n-deployment/.env"
    echo "  Backups: /backups/"
    echo "  Health check: /usr/local/bin/n8n-health-check.sh"
    echo ""
    echo "Commands:"
    echo "  View logs: docker compose -f /opt/n8n-deployment/docker-compose.yml logs -f"
    echo "  Restart stack: docker compose -f /opt/n8n-deployment/docker-compose.yml restart"
    echo "  Manual backup: /backups/backup.sh"
    echo "  Health check: /usr/local/bin/n8n-health-check.sh"
    echo "======================================"
    echo -e "${NC}"
else
    echo -e "${RED}Services not healthy yet. Check logs with: docker compose logs${NC}"
fi