#!/bin/sh
set -e

cd /app

chown -R www-data:www-data storage database
touch storage/logs/laravel.log
chown www-data:www-data storage/logs/laravel.log

php artisan config:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache

exec supervisord -c /etc/supervisord.conf -n
