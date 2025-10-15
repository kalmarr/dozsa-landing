<?php
/**
 * DEBUG - Test contact form
 */

header('Content-Type: text/plain');

echo "=== DEBUG TEST ===\n\n";

// Test 1: Check file paths
echo "1. Current directory: " . __DIR__ . "\n";
echo "2. PHP version: " . phpversion() . "\n";

// Test 2: Check if files exist
$configPath = __DIR__ . '/config.php';
$recaptchaPath = __DIR__ . '/recaptcha-validator.php';

echo "3. config.php exists: " . (file_exists($configPath) ? "YES" : "NO") . "\n";
echo "   Path: $configPath\n";

echo "4. recaptcha-validator.php exists: " . (file_exists($recaptchaPath) ? "YES" : "NO") . "\n";
echo "   Path: $recaptchaPath\n";

// Test 3: Try to include
try {
    require_once $configPath;
    echo "5. config.php loaded: YES\n";
    echo "   ADMIN_EMAIL: " . (defined('ADMIN_EMAIL') ? ADMIN_EMAIL : 'NOT DEFINED') . "\n";
} catch (Exception $e) {
    echo "5. config.php ERROR: " . $e->getMessage() . "\n";
}

try {
    require_once $recaptchaPath;
    echo "6. recaptcha-validator.php loaded: YES\n";
    echo "   verifyRecaptcha function exists: " . (function_exists('verifyRecaptcha') ? 'YES' : 'NO') . "\n";
} catch (Exception $e) {
    echo "6. recaptcha-validator.php ERROR: " . $e->getMessage() . "\n";
}

// Test 4: Check POST data
echo "\n7. REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "8. POST data: " . print_r($_POST, true) . "\n";

echo "\n=== END DEBUG ===\n";
