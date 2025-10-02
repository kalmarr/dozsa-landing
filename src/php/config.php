<?php
/**
 * Dózsa Apartman Szeged - Configuration
 * Email and general settings
 */

// Email Configuration
define('ADMIN_EMAIL', 'info@dozsa-apartman-szeged.hu'); // Change this to actual email
define('FROM_EMAIL', 'noreply@dozsa-apartman-szeged.hu');
define('FROM_NAME', 'Dózsa Apartman Szeged');

// Site Configuration
define('SITE_NAME', 'Dózsa Apartman Szeged');
define('SITE_URL', 'https://dozsa-apartman-szeged.hu');

// Form Settings
define('MAX_MESSAGE_LENGTH', 5000);
define('MIN_MESSAGE_LENGTH', 10);

// Security
define('ENABLE_HONEYPOT', true);
define('ENABLE_RATE_LIMIT', true);
define('MAX_REQUESTS_PER_HOUR', 5);

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
