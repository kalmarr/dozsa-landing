<?php
/**
 * Quote Request API Endpoint
 * Dózsa Apartman Szeged
 */

require_once __DIR__ . '/../php/recaptcha-validator.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Verify reCAPTCHA
$recaptchaToken = isset($data['g-recaptcha-response']) ? $data['g-recaptcha-response'] : '';
$recaptchaResult = verifyRecaptcha($recaptchaToken);

if (!$recaptchaResult['success']) {
    error_log('reCAPTCHA validation failed for quote request: ' . $recaptchaResult['message']);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Biztonsági ellenőrzés sikertelen']);
    exit();
}

// Validate required fields
$requiredFields = ['adults', 'checkIn', 'checkOut', 'nights', 'lastName', 'firstName', 'phone', 'email'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit();
    }
}

// Sanitize inputs
$adults = intval($data['adults']);
$extraBed = intval($data['extraBed'] ?? 0);
$child3to4 = intval($data['child3to4'] ?? 0);
$child0to2 = intval($data['child0to2'] ?? 0);
$checkIn = htmlspecialchars($data['checkIn']);
$checkOut = htmlspecialchars($data['checkOut']);
$nights = intval($data['nights']);
$lastName = htmlspecialchars($data['lastName']);
$firstName = htmlspecialchars($data['firstName']);
$phone = htmlspecialchars($data['phone']);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$message = htmlspecialchars($data['message'] ?? '');

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Calculate total guests
$guestsTotal = $adults + $extraBed + $child3to4 + $child0to2;

// Format dates for email
$checkInFormatted = formatDateHungarian($checkIn);
$checkOutFormatted = formatDateHungarian($checkOut);

// Load email templates
$customerTemplate = file_get_contents(__DIR__ . '/templates/customer-quote-email.html');
$adminTemplate = file_get_contents(__DIR__ . '/templates/admin-quote-email.txt');

// Replace placeholders in customer email
$customerEmail = str_replace(
    [
        '{{LAST_NAME}}',
        '{{FIRST_NAME}}',
        '{{GUESTS_TOTAL}}',
        '{{ADULTS}}',
        '{{EXTRA_BED}}',
        '{{CHILD_3TO4}}',
        '{{CHILD_0TO2}}',
        '{{CHECK_IN_FORMATTED}}',
        '{{CHECK_OUT_FORMATTED}}',
        '{{NIGHTS}}',
        '{{PHONE}}',
        '{{EMAIL}}',
        '{{MESSAGE}}'
    ],
    [
        $lastName,
        $firstName,
        $guestsTotal,
        $adults,
        $extraBed,
        $child3to4,
        $child0to2,
        $checkInFormatted,
        $checkOutFormatted,
        $nights,
        $phone,
        $email,
        $message ?: '—'
    ],
    $customerTemplate
);

// Handle message conditional
if ($message) {
    $customerEmail = str_replace('{{#IF_MESSAGE}}', '', $customerEmail);
    $customerEmail = str_replace('{{/IF_MESSAGE}}', '', $customerEmail);
} else {
    $customerEmail = preg_replace('/{{#IF_MESSAGE}}.*?{{\/IF_MESSAGE}}/s', '', $customerEmail);
}

// Replace placeholders in admin email
$adminEmail = str_replace(
    [
        '{{LAST_NAME}}',
        '{{FIRST_NAME}}',
        '{{GUESTS_TOTAL}}',
        '{{ADULTS}}',
        '{{EXTRA_BED}}',
        '{{CHILD_3TO4}}',
        '{{CHILD_0TO2}}',
        '{{CHECK_IN_FORMATTED}}',
        '{{CHECK_OUT_FORMATTED}}',
        '{{NIGHTS}}',
        '{{PHONE}}',
        '{{EMAIL}}',
        '{{MESSAGE_OR_NONE}}'
    ],
    [
        $lastName,
        $firstName,
        $guestsTotal,
        $adults,
        $extraBed,
        $child3to4,
        $child0to2,
        $checkInFormatted,
        $checkOutFormatted,
        $nights,
        $phone,
        $email,
        $message ?: '(Nincs üzenet)'
    ],
    $adminTemplate
);

// Email settings
$adminEmailAddress = 'info@dozsaszeged.hu';
$fromEmail = 'info@dozsaszeged.hu';
$fromName = 'Dózsa Apartman Szeged';

// Send email to customer
$customerSubject = 'Ajánlatkérés fogadva – Dózsa Apartman Szeged';
$customerHeaders = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    "From: $fromName <$fromEmail>",
    "Reply-To: $adminEmailAddress",
    'X-Mailer: PHP/' . phpversion(),
    'X-Priority: 3',
    'Message-ID: <' . time() . '-' . md5($email) . '@dozsa-apartman-szeged.hu>'
];

$customerSent = mail(
    $email,
    $customerSubject,
    $customerEmail,
    implode("\r\n", $customerHeaders)
);

// Log customer email result
error_log('Quote request - Customer email sent to ' . $email . ': ' . ($customerSent ? 'SUCCESS' : 'FAILED'));

// Send email to admin
$adminSubject = "ÚJ AJÁNLATKÉRÉS: $lastName $firstName - $checkInFormatted";
$adminHeaders = [
    'MIME-Version: 1.0',
    'Content-type: text/plain; charset=UTF-8',
    "From: $fromName <$fromEmail>",
    "Reply-To: $email",
    'X-Mailer: PHP/' . phpversion(),
    'X-Priority: 1',
    'Message-ID: <' . time() . '-admin-' . md5($email) . '@dozsa-apartman-szeged.hu>'
];

$adminSent = mail(
    $adminEmailAddress,
    $adminSubject,
    $adminEmail,
    implode("\r\n", $adminHeaders)
);

// Log admin email result
error_log('Quote request - Admin email sent to ' . $adminEmailAddress . ': ' . ($adminSent ? 'SUCCESS' : 'FAILED'));

// Check if emails were sent successfully
if ($customerSent && $adminSent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Quote request sent successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send emails'
    ]);
}

/**
 * Format date to Hungarian format
 */
function formatDateHungarian($dateString) {
    $months = [
        1 => 'január', 2 => 'február', 3 => 'március', 4 => 'április',
        5 => 'május', 6 => 'június', 7 => 'július', 8 => 'augusztus',
        9 => 'szeptember', 10 => 'október', 11 => 'november', 12 => 'december'
    ];

    $date = new DateTime($dateString);
    $year = $date->format('Y');
    $month = $months[(int)$date->format('n')];
    $day = $date->format('j');

    return "$year. $month $day.";
}
