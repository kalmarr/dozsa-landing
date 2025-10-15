<?php
/**
 * Dózsa Apartman Szeged - Configuration
 * Email and general settings
 * ISPConfig 3.3.0p3 kompatibilis - PHP 7.4
 */

// Környezeti változók betöltése (ISPConfig vagy .env fájl)
function loadEnvironmentVariables() {
    // Először ISPConfig környezeti változókat próbáljuk
    $envVars = [
        'RECAPTCHA_SITE_KEY',
        'RECAPTCHA_SECRET_KEY',
        'ADMIN_EMAIL',
        'FROM_EMAIL',
        'FROM_NAME',
        'SITE_NAME',
        'SITE_URL'
    ];

    $loaded = true;
    foreach ($envVars as $var) {
        if (getenv($var) === false) {
            $loaded = false;
            break;
        }
    }

    // Ha nem találtuk az ISPConfig környezeti változókat, .env fájlt keresünk
    if (!$loaded) {
        // 1. ISPConfig VPS production: /var/www/clients/client[X]/web[Y]/web/php/config.php
        //    .env helye: /var/www/clients/client[X]/web[Y]/private/.env
        $envFile = __DIR__ . '/../../../private/.env';

        // 2. Ha nem létezik, helyi fejlesztési környezet (gyökér-szintű struktúra)
        //    Projekt: dozsa-landing/web/php/config.php
        //    .env: dozsa-landing/private/.env
        if (!file_exists($envFile)) {
            $envFile = __DIR__ . '/../../private/.env';
        }

        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                // Kommentek és üres sorok kihagyása
                if (strpos(trim($line), '#') === 0 || empty(trim($line))) {
                    continue;
                }

                // Környezeti változó parse-olása
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value);

                    // Idézőjelek eltávolítása
                    $value = trim($value, '"\'');

                    // Környezeti változó beállítása
                    if (!empty($name) && !getenv($name)) {
                        putenv("$name=$value");
                        $_ENV[$name] = $value;
                        $_SERVER[$name] = $value;
                    }
                }
            }
        }
    }
}

// Környezeti változók betöltése
loadEnvironmentVariables();

// Helper függvény környezeti változók biztonságos olvasásához
function env($key, $default = null) {
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }

    // Boolean értékek konvertálása
    if (strtolower($value) === 'true') {
        return true;
    }
    if (strtolower($value) === 'false') {
        return false;
    }

    return $value;
}

// Google reCAPTCHA Configuration
define('RECAPTCHA_SITE_KEY', env('RECAPTCHA_SITE_KEY', '6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm'));
define('RECAPTCHA_SECRET_KEY', env('RECAPTCHA_SECRET_KEY', ''));

// Email Configuration
define('ADMIN_EMAIL', env('ADMIN_EMAIL', 'info@dozsaszeged.hu'));
define('FROM_EMAIL', env('FROM_EMAIL', 'info@dozsaszeged.hu'));
define('FROM_NAME', env('FROM_NAME', 'Dózsa Apartman Szeged'));

// Backwards compatibility (send-booking.php használja)
define('CONTACT_TO_EMAIL', ADMIN_EMAIL);
define('CONTACT_FROM_EMAIL', FROM_EMAIL);

// Booking Configuration (send-booking.php használja)
define('RATE_LIMIT_SECONDS', 60);

// Site Configuration
define('SITE_NAME', env('SITE_NAME', 'Dózsa Apartman Szeged'));
define('SITE_URL', env('SITE_URL', 'https://dozsa-apartman-szeged.hu'));

// Form Settings
define('MAX_MESSAGE_LENGTH', (int)env('MAX_MESSAGE_LENGTH', 5000));
define('MIN_MESSAGE_LENGTH', (int)env('MIN_MESSAGE_LENGTH', 10));

// Security
define('ENABLE_HONEYPOT', env('ENABLE_HONEYPOT', true));
define('ENABLE_RATE_LIMIT', env('ENABLE_RATE_LIMIT', true));
define('MAX_REQUESTS_PER_HOUR', (int)env('MAX_REQUESTS_PER_HOUR', 5));

// Success/Error Messages
define('MSG_SUCCESS', 'Köszönjük üzenetét! Hamarosan felvesszük Önnel a kapcsolatot.');
define('MSG_ERROR', 'Hiba történt az üzenet küldése során. Kérjük, próbálja újra később.');
define('MSG_INVALID_EMAIL', 'Érvénytelen email cím.');
define('MSG_MISSING_FIELDS', 'Kérjük, töltse ki az összes kötelező mezőt.');
define('MSG_MESSAGE_TOO_SHORT', 'Az üzenet túl rövid.');
define('MSG_MESSAGE_TOO_LONG', 'Az üzenet túl hosszú.');
define('MSG_RATE_LIMIT', 'Túl sok kérést küldött. Kérjük, várjon egy kicsit.');
define('MSG_SPAM_DETECTED', 'Spamszerű tevékenység észlelve.');

// Timezone
date_default_timezone_set('Europe/Budapest');

// Biztonsági ellenőrzés - Ha nincs secret key, hibát logolunk
if (empty(RECAPTCHA_SECRET_KEY)) {
    error_log('CRITICAL: RECAPTCHA_SECRET_KEY is not configured! Please set it in .env or ISPConfig environment variables.');
}
