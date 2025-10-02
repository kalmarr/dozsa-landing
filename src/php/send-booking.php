<?php
/**
 * Dózsa Apartman Szeged - Booking Form Handler
 * Processes booking requests and sends email notifications
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Start session for rate limiting
session_start();

// CORS headers (if needed)
header('Content-Type: application/json; charset=utf-8');

// Configuration
require_once 'config.php';

/**
 * Send JSON response
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
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate date format and minimum booking time
 */
function validateDate($date, $minDaysAhead = 2) {
    $dateObj = DateTime::createFromFormat('Y-m-d', $date);
    if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
        return false;
    }

    $today = new DateTime();
    $minDate = $today->modify("+{$minDaysAhead} days");

    return $dateObj >= $minDate;
}

// Rate limiting check
$rateLimitKey = 'booking_form_' . $_SERVER['REMOTE_ADDR'];
if (isset($_SESSION[$rateLimitKey])) {
    $lastSubmission = $_SESSION[$rateLimitKey];
    if (time() - $lastSubmission < RATE_LIMIT_SECONDS) {
        sendResponse(false, 'Kérjük várjon ' . RATE_LIMIT_SECONDS . ' másodpercet két űrlap beküldése között.');
    }
}

// Check if POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Érvénytelen kérés.');
}

// Collect and sanitize form data
$checkin = isset($_POST['checkin']) ? sanitizeInput($_POST['checkin']) : '';
$checkout = isset($_POST['checkout']) ? sanitizeInput($_POST['checkout']) : '';
$guests = isset($_POST['guests']) ? sanitizeInput($_POST['guests']) : '';
$name = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : '';
$message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';

// Validation
$errors = [];

// Validate required fields
if (empty($checkin)) {
    $errors[] = 'Az érkezés dátuma kötelező.';
}

if (empty($checkout)) {
    $errors[] = 'A távozás dátuma kötelező.';
}

if (empty($guests)) {
    $errors[] = 'A vendégek száma kötelező.';
}

if (empty($name) || strlen($name) < 3) {
    $errors[] = 'Érvényes név megadása kötelező (min. 3 karakter).';
}

if (empty($email) || !validateEmail($email)) {
    $errors[] = 'Érvényes email cím megadása kötelező.';
}

if (empty($phone) || strlen($phone) < 9) {
    $errors[] = 'Érvényes telefonszám megadása kötelező.';
}

// Validate dates
if (!validateDate($checkin, 2)) {
    $errors[] = 'Az érkezés dátumának legalább 2 nappal későbbinek kell lennie.';
}

if (!empty($checkin) && !empty($checkout)) {
    $checkinDate = new DateTime($checkin);
    $checkoutDate = new DateTime($checkout);

    if ($checkoutDate <= $checkinDate) {
        $errors[] = 'A távozás dátumának későbbinek kell lennie az érkezésnél.';
    }
}

// If there are errors, return them
if (!empty($errors)) {
    sendResponse(false, implode(' ', $errors));
}

// Calculate number of nights
$checkinDate = new DateTime($checkin);
$checkoutDate = new DateTime($checkout);
$interval = $checkinDate->diff($checkoutDate);
$nights = $interval->days;

// Prepare email content
$emailSubject = 'Új ajánlatkérés - Dózsa Apartman Szeged';

$emailBody = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid #8B4513; }
        .label { font-weight: bold; color: #8B4513; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Új Ajánlatkérés</h2>
            <p>Dózsa Apartman Szeged</p>
        </div>

        <div class='content'>
            <div class='info-row'>
                <span class='label'>Érkezés:</span> " . date('Y. m. d.', strtotime($checkin)) . "
            </div>

            <div class='info-row'>
                <span class='label'>Távozás:</span> " . date('Y. m. d.', strtotime($checkout)) . "
            </div>

            <div class='info-row'>
                <span class='label'>Éjszakák száma:</span> {$nights}
            </div>

            <div class='info-row'>
                <span class='label'>Vendégek száma:</span> {$guests} fő
            </div>

            <hr style='margin: 20px 0; border: none; border-top: 1px solid #ddd;'>

            <div class='info-row'>
                <span class='label'>Név:</span> {$name}
            </div>

            <div class='info-row'>
                <span class='label'>Email:</span> <a href='mailto:{$email}'>{$email}</a>
            </div>

            <div class='info-row'>
                <span class='label'>Telefon:</span> <a href='tel:{$phone}'>{$phone}</a>
            </div>

            " . (!empty($message) ? "
            <div class='info-row'>
                <span class='label'>Üzenet:</span><br>
                <p style='margin-top: 10px;'>{$message}</p>
            </div>
            " : "") . "
        </div>

        <div class='footer'>
            <p>Ez az email automatikusan lett generálva a dozsa-apartman-szeged.hu weboldalról.</p>
            <p>Beküldés ideje: " . date('Y. m. d. H:i:s') . "</p>
        </div>
    </div>
</body>
</html>
";

// Email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . CONTACT_FROM_EMAIL . "\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
$mailSent = mail(CONTACT_TO_EMAIL, $emailSubject, $emailBody, $headers);

if ($mailSent) {
    // Update rate limiting
    $_SESSION[$rateLimitKey] = time();

    // Send confirmation email to customer
    $confirmationSubject = 'Ajánlatkérés visszaigazolása - Dózsa Apartman Szeged';
    $confirmationBody = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Köszönjük ajánlatkérését!</h2>
            </div>

            <div class='content'>
                <p>Kedves {$name}!</p>

                <p>Köszönjük, hogy érdeklődik Dózsa Apartman Szeged iránt!</p>

                <p>Ajánlatkérését megkaptuk és hamarosan felvesszük Önnel a kapcsolatot az alábbi időszakra vonatkozóan:</p>

                <p><strong>Érkezés:</strong> " . date('Y. m. d.', strtotime($checkin)) . "<br>
                <strong>Távozás:</strong> " . date('Y. m. d.', strtotime($checkout)) . "<br>
                <strong>Éjszakák száma:</strong> {$nights}<br>
                <strong>Vendégek:</strong> {$guests} fő</p>

                <p>Amennyiben kérdése van, keressen minket bizalommal!</p>

                <p>Üdvözlettel,<br>
                <strong>Mónika & Róbert</strong><br>
                Dózsa Apartman Szeged</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $confirmationHeaders = "MIME-Version: 1.0\r\n";
    $confirmationHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
    $confirmationHeaders .= "From: " . CONTACT_FROM_EMAIL . "\r\n";
    $confirmationHeaders .= "Reply-To: " . CONTACT_FROM_EMAIL . "\r\n";

    mail($email, $confirmationSubject, $confirmationBody, $confirmationHeaders);

    sendResponse(true, 'Köszönjük ajánlatkérését! Hamarosan felvesszük Önnel a kapcsolatot.');
} else {
    sendResponse(false, 'Hiba történt az ajánlatkérés elküldése során. Kérjük próbálja újra később.');
}
