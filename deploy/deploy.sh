#!/bin/bash
# ============================================
# KUD Desa Tegal Sari — Deploy Script
# ============================================
# Usage:
#   chmod +x deploy.sh
#   sudo ./deploy.sh
# ============================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

# --- Config ---
APP_DIR="/var/www/kud"
DOMAIN="${DOMAIN:-kud-tegal-sari.my.id}"
DB_NAME="${DB_NAME:-kud_desa_tegal_sari}"
DB_USER="${DB_USER:-kud_user}"
DB_PASS="${DB_PASS:-$(openssl rand -base64 24)}"
PHP_VERSION="8.2"
NODE_VERSION="20"

info "=========================================="
info "  KUD Desa Tegal Sari — Deploy"
info "  Domain : $DOMAIN"
info "  Dir    : $APP_DIR"
info "=========================================="
echo ""

# --- Prerequisites Check ---
command -v git    >/dev/null 2>&1 || err "Git belum terinstall"
command -v php    >/dev/null 2>&1 || err "PHP belum terinstall"
command -v node   >/dev/null 2>&1 || err "Node.js belum terinstall"
command -v npm    >/dev/null 2>&1 || err "npm belum terinstall"
command -v mysql  >/dev/null 2>&1 || err "MySQL belum terinstall"
command -v nginx  >/dev/null 2>&1 || err "Nginx belum terinstall"
command -v composer >/dev/null 2>&1 || err "Composer belum terinstall"

PHP_VER=$(php -v | head -1 | grep -oP '\d+\.\d+')
if (( $(echo "$PHP_VER < 8.2" | bc -l) )); then
    err "PHP minimal 8.2 (sekarang: $PHP_VER)"
fi
log "Semua prerequisites terpenuhi"

# --- Clone / Pull Repo ---
if [ -d "$APP_DIR/.git" ]; then
    info "Repository sudah ada, pull update..."
    cd "$APP_DIR"
    git pull origin main
else
    info "Clone repository..."
    git clone https://github.com/username/kud-desa-tegal-sari.git "$APP_DIR"
    cd "$APP_DIR"
fi

# --- Setup Backend ---
info ""
info "--- Backend Setup ---"

cd "$APP_DIR/backend"

# Environment
if [ ! -f .env ]; then
    cp .env.example .env
    sed -i "s|APP_URL=.*|APP_URL=https://$DOMAIN|" .env
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
    sed -i "s|SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=$DOMAIN|" .env
    sed -i "s|DB_DATABASE=.*|DB_DATABASE=$DB_NAME|" .env
    sed -i "s|DB_USERNAME=.*|DB_USERNAME=$DB_USER|" .env
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" .env
    sed -i "s|SESSION_DOMAIN=.*|SESSION_DOMAIN=.$DOMAIN|" .env
    sed -i "s|SESSION_SECURE_COOKIE=.*|SESSION_SECURE_COOKIE=true|" .env
    log ".env berhasil dibuat"
else
    warn ".env sudah ada — lewati"
fi

# Database
info "Setup database MySQL..."
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
SQL
log "Database $DB_NAME siap"

# Composer
composer install --no-dev --optimize-autoloader --no-interaction
log "Composer install selesai"

# Generate key
php artisan key:generate --force
log "APP_KEY generated"

# Migrate
php artisan migrate --force
log "Migrasi database selesai"

# Storage link
php artisan storage:link --force
log "Storage link created"

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
log "Cache dioptimalkan"

# Vite build
npm install --no-audit --no-fund
npm run build
log "Vite build selesai"

# --- Setup Frontend ---
info ""
info "--- Frontend Setup ---"

cd "$APP_DIR/frontend"

# Environment
if [ ! -f .env ]; then
    cat > .env <<EOF
BACKEND_URL=http://127.0.0.1:8000
PROD_DOMAIN=$DOMAIN
NEXT_PUBLIC_API_URL=/api
NEXT_TELEMETRY_DISABLED=1
EOF
    log ".env frontend berhasil dibuat"
else
    warn ".env frontend sudah ada — lewati"
fi

npm install --no-audit --no-fund
npm run build
log "Next.js build selesai"

# --- Setup Services ---
info ""
info "--- Service Setup ---"

# Copy systemd services
cp "$APP_DIR/deploy/kud-nextjs.service" /etc/systemd/system/
cp "$APP_DIR/deploy/kud-queue.service" /etc/systemd/system/
systemctl daemon-reload

# Enable & start
systemctl enable --now kud-queue
systemctl enable --now kud-nextjs
log "Systemd services aktif"

# --- Setup Nginx ---
info ""
info "--- Nginx Setup ---"

ln -sf "$APP_DIR/deploy/nginx-kud.conf" /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
log "Nginx configured & reloaded"

# --- Output ---
info ""
info "=========================================="
info "  DEPLOY SELESAI!"
info "=========================================="
echo ""
info "Domain   : https://$DOMAIN"
info "Database : $DB_NAME"
info "DB User  : $DB_USER"
info "DB Pass  : $DB_PASS"
echo ""
warn "Jangan lupa setup SSL:"
warn "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
warn "Jangan lupa konfigurasi SMTP di backend/.env"
echo ""
info "Cek status service:"
info "  systemctl status kud-nextjs"
info "  systemctl status kud-queue"
echo ""
