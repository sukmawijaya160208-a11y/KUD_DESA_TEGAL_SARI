#!/bin/sh
set -e

cd /app

chown -R www-data:www-data storage database
touch storage/logs/laravel.log
chown www-data:www-data storage/logs/laravel.log

# Copy new migration files into the persistent volume (Docker volume shadows /app/database)
cp -n /app-migrations/*.php /app/database/migrations/ 2>/dev/null || true

php artisan config:clear
php artisan route:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache

exec supervisord -c /etc/supervisord.conf -n
