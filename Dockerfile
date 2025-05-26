FROM php:7.4-apache

# ติดตั้ง PHP extension ที่จำเป็น
RUN docker-php-ext-install pdo pdo_mysql

# เปิด mod_rewrite
RUN a2enmod rewrite

# ติดตั้ง git, zip, unzip สำหรับ composer
RUN apt update && apt install -y git zip unzip

# ติดตั้ง Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ตั้ง DocumentRoot ไปที่ frontend/web
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/frontend/web|g' /etc/apache2/sites-enabled/000-default.conf

# เพิ่ม Directory config
RUN echo '<Directory /var/www/html/frontend/web>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# คัดลอกโค้ดเข้า container
COPY . /var/www/html

# ให้สิทธิ์ไฟล์กับ apache
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# เปิดพอร์ต
EXPOSE 80
