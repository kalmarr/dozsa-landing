FROM php:8.2-apache

# Install required PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy website files to Apache document root
COPY src/ /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Configure PHP for email (optional - for testing)
RUN echo "sendmail_path = /usr/sbin/sendmail -t -i" >> /usr/local/etc/php/php.ini

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
