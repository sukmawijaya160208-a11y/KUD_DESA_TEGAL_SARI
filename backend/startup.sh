#!/bin/sh
set -e

cd /app

php artisan config:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache

exec supervisord -c /etc/supervisord.conf -n
