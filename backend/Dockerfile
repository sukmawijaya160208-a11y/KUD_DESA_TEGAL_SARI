FROM php:8.2-cli-alpine AS base

RUN apk add --no-cache \
    curl \
    zip \
    unzip \
    libzip-dev \
    oniguruma-dev \
    sqlite-dev \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    zip \
    bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --no-scripts

COPY . .

RUN php artisan package:discover --ansi && \
    php artisan storage:link && \
    php artisan config:cache && \
    php artisan route:cache

RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
