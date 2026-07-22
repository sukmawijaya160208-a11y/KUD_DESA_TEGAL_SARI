FROM php:8.2-fpm-alpine AS base

RUN apk add --no-cache \
    curl \
    zip \
    unzip \
    libzip-dev \
    oniguruma-dev \
    sqlite-dev \
    nginx \
    supervisor \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    zip \
    bcmath

COPY docker-php.ini /usr/local/etc/php/conf.d/99-upload.ini
COPY docker-nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --no-scripts

COPY . .

RUN mkdir -p storage/app/public public/storage && \
    php artisan package:discover --ansi && \
    php artisan storage:link --force || true

RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["/startup.sh"]
