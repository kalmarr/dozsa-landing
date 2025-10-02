<?php
/**
 * Dózsa Apartman Szeged - Contact Form Handler
 * Processes contact form submissions with validation and spam protection
 */

require_once 'config.php';

// Set JSON response header
header('Content-Type: application/json');

// Start session for rate limiting
session_start();

/**
 * Send JSON response and exit
 */
function sendResponse($success, $message, $data = []) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Validate email address
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Sanitize input
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Check rate limiting
 */
function checkRateLimit() {
    if (!ENABLE_RATE_LIMIT) {
        return true;
    }

    $now = time();
    $hour = 3600;

    if (!isset($_SESSION['form_submissions'])) {
        $_SESSION['form_submissions'] = [];
    }

    // Remove old submissions
    $_SESSION['form_submissions'] = array_filter(
        $_SESSION['form_submissions'],
        function($timestamp) use ($now, $hour) {
            return ($now - $timestamp) < $hour;
        }
    );

    // Check if rate limit exceeded
    if (count($_SESSION['form_submissions']) >= MAX_REQUESTS_PER_HOUR) {
        return false;
    }

    // Add current submission
    $_SESSION['form_submissions'][] = $now;
    return true;
}

/**
 * Check honeypot (spam protection)
 */
function checkHoneypot() {
    if (!ENABLE_HONEYPOT) {
        return true;
    }

    // Check for honeypot field (should be empty)
    if (isset($_POST['website']) && !empty($_POST['website'])) {
        return false;
    }

    return true;
}

/**
 * Main form processing
 */
try {
    // Check request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Invalid request method.');
    }

    // Check rate limiting
    if (!checkRateLimit()) {
        sendResponse(false, MSG_RATE_LIMIT);
    }

    // Check honeypot
    if (!checkHoneypot()) {
        sendResponse(false, MSG_SPAM_DETECTED);
    }

    // Get and sanitize form data
    $name = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
    $email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : '';
    $subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : 'Kapcsolatfelvétel';
    $message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';

    // Validation
    if (empty($name) || empty($email) || empty($message)) {
        sendResponse(false, MSG_MISSING_FIELDS);
    }

    if (!validateEmail($email)) {
        sendResponse(false, MSG_INVALID_EMAIL);
    }

    if (strlen($message) < MIN_MESSAGE_LENGTH) {
        sendResponse(false, MSG_MESSAGE_TOO_SHORT);
    }

    if (strlen($message) > MAX_MESSAGE_LENGTH) {
        sendResponse(false, MSG_MESSAGE_TOO_LONG);
    }

    // Prepare email
    $to = ADMIN_EMAIL;
    $emailSubject = '[' . SITE_NAME . '] ' . $subject;

    // Email body
    $emailBody = "Új üzenet érkezett a weboldalról\n\n";
    $emailBody .= "Név: " . $name . "\n";
    $emailBody .= "Email: " . $email . "\n";
    $emailBody .= "Telefon: " . ($phone ?: 'Nincs megadva') . "\n";
    $emailBody .= "Tárgy: " . $subject . "\n\n";
    $emailBody .= "Üzenet:\n" . $message . "\n\n";
    $emailBody .= "---\n";
    $emailBody .= "Időpont: " . date('Y-m-d H:i:s') . "\n";
    $emailBody .= "IP cím: " . $_SERVER['REMOTE_ADDR'] . "\n";

    // Email headers
    $headers = [];
    $headers[] = 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>';
    $headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
    $headers[] = 'X-Mailer: PHP/' . phpversion();
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';

    // Send email
    $mailSent = mail($to, $emailSubject, $emailBody, implode("\r\n", $headers));

    if ($mailSent) {
        // Optional: Send confirmation email to user
        $confirmationSubject = 'Köszönjük üzenetét - ' . SITE_NAME;
        $confirmationBody = "Kedves " . $name . "!\n\n";
        $confirmationBody .= "Köszönjük, hogy felkereste a " . SITE_NAME . "-t!\n\n";
        $confirmationBody .= "Üzenetét megkaptuk, és hamarosan felvesszük Önnel a kapcsolatot.\n\n";
        $confirmationBody .= "Üdvözlettel,\n";
        $confirmationBody .= "Mónika & Róbert\n";
        $confirmationBody .= SITE_NAME;

        $confirmationHeaders = [];
        $confirmationHeaders[] = 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>';
        $confirmationHeaders[] = 'Content-Type: text/plain; charset=UTF-8';

        mail($email, $confirmationSubject, $confirmationBody, implode("\r\n", $confirmationHeaders));

        sendResponse(true, MSG_SUCCESS);
    } else {
        sendResponse(false, MSG_ERROR);
    }

} catch (Exception $e) {
    // Log error (in production, log to file instead of displaying)
    error_log('Contact form error: ' . $e->getMessage());
    sendResponse(false, MSG_ERROR);
}
