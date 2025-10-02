<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Load configuration
require_once __DIR__ . '/config.php';

// Get JSON data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
$required = ['guests', 'checkIn', 'checkOut', 'name', 'email', 'phone'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit();
    }
}

// Sanitize data
$guests = intval($data['guests']);
$checkIn = htmlspecialchars($data['checkIn'], ENT_QUOTES, 'UTF-8');
$checkOut = htmlspecialchars($data['checkOut'], ENT_QUOTES, 'UTF-8');
$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars($data['phone'], ENT_QUOTES, 'UTF-8');
$message = isset($data['message']) ? htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8') : '';

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Format dates
try {
    $checkInDate = new DateTime($checkIn);
    $checkOutDate = new DateTime($checkOut);
    $checkInFormatted = $checkInDate->format('Y. F d.');
    $checkOutFormatted = $checkOutDate->format('Y. F d.');
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid date format']);
    exit();
}

// Prepare email templates
$customerTemplate = file_get_contents(__DIR__ . '/templates/customer-email.html');
$adminTemplate = file_get_contents(__DIR__ . '/templates/admin-email.txt');

// Replace placeholders in customer email
$customerEmail = str_replace(
    ['{{name}}', '{{guests}}', '{{checkIn}}', '{{checkOut}}', '{{phone}}', '{{message}}'],
    [$name, $guests, $checkInFormatted, $checkOutFormatted, $phone, $message],
    $customerTemplate
);

// Replace placeholders in admin email
$adminEmail = str_replace(
    ['{{name}}', '{{email}}', '{{phone}}', '{{guests}}', '{{checkIn}}', '{{checkOut}}', '{{message}}'],
    [$name, $email, $phone, $guests, $checkInFormatted, $checkOutFormatted, $message],
    $adminTemplate
);

// Send emails using PHP mail()
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . ADMIN_EMAIL . "\r\n";
$headers .= "Reply-To: " . ADMIN_EMAIL . "\r\n";

$adminHeaders = "MIME-Version: 1.0\r\n";
$adminHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
$adminHeaders .= "From: " . ADMIN_EMAIL . "\r\n";
$adminHeaders .= "Reply-To: " . $email . "\r\n";

// Send to customer
$customerSubject = "Foglalás megerősítése - Dózsa Apartman Szeged";
$customerSent = mail($email, $customerSubject, $customerEmail, $headers);

// Send to admin
$adminSubject = "Új foglalás érkezett - Dózsa Apartman";
$adminSent = mail(ADMIN_EMAIL, $adminSubject, $adminEmail, $adminHeaders);

if ($customerSent && $adminSent) {
    echo json_encode(['success' => true, 'message' => 'Booking successful']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send emails']);
}
