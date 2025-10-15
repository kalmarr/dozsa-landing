<?php
/**
 * Google reCAPTCHA v2 Validator
 * Dózsa Apartman Szeged
 */

/**
 * Verify reCAPTCHA v2 token
 *
 * @param string $token The reCAPTCHA token from the client
 * @param string $secretKey The reCAPTCHA secret key (loaded from environment)
 * @return array Result with 'success' and 'message' keys
 */
function verifyRecaptcha($token, $secretKey = null) {
    // Ha nincs megadva secret key, config.php-ból töltjük
    if ($secretKey === null) {
        // Config betöltése, ha még nem történt meg
        if (!defined('RECAPTCHA_SECRET_KEY')) {
            require_once __DIR__ . '/config.php';
        }
        $secretKey = RECAPTCHA_SECRET_KEY;
    }

    // Biztonsági ellenőrzés
    if (empty($secretKey)) {
        error_log('CRITICAL: reCAPTCHA secret key is missing!');
        return [
            'success' => false,
            'message' => 'reCAPTCHA configuration error'
        ];
    }
    // Check if token is empty
    if (empty($token)) {
        return [
            'success' => false,
            'message' => 'reCAPTCHA token hiányzik'
        ];
    }

    // Prepare verification request
    $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $secretKey,
        'response' => $token,
        'remoteip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1'
    ];

    // Make POST request
    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
            'timeout' => 10
        ]
    ];

    $context  = stream_context_create($options);
    $result = @file_get_contents($verifyUrl, false, $context);

    // Check if request failed
    if ($result === false) {
        error_log('reCAPTCHA API error: Failed to connect');
        return [
            'success' => false,
            'message' => 'Failed to verify reCAPTCHA'
        ];
    }

    // Parse response
    $response = json_decode($result, true);

    // Check if verification was successful
    if (isset($response['success']) && $response['success'] === true) {
        return [
            'success' => true,
            'message' => 'reCAPTCHA verification successful'
        ];
    } else {
        $errorCodes = isset($response['error-codes']) ? implode(', ', $response['error-codes']) : 'Unknown error';
        error_log('reCAPTCHA validation failed: ' . $errorCodes);
        return [
            'success' => false,
            'message' => 'reCAPTCHA validation failed: ' . $errorCodes
        ];
    }
}
