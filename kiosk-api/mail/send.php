<?php

require_once "../config/headers.php";
require_once "../config/db.php";
require_once "../vendor/autoload.php"; // Include Composer's autoloader for the JWT library

use \Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Read raw POST data from the request body
$inputData = file_get_contents("php://input");

// Decode the JSON data to an associative array
$data = json_decode($inputData, true);

// Check if JSON is valid and contains required fields
if ($data === null) {
    // Handle invalid JSON or missing data
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid JSON data or missing itemId']);
    exit();
}

// Validation
$errors = [];

$token = $data['token'] ?? null;
$orderId = $data['orderId'] ?? null;
$userId = null;

if ($token) {
    $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
    if ($decoded && $decoded->sub) {
        $userId = $decoded->sub;
    } else {
        $errors[] = 'User login required to get mail receipt, please log in!';
    }
} else {
    $errors[] = 'User login required to get mail receipt, please log in!';
}

if (!$orderId) {
    $errors[] = 'Order ID is required';
}

if (!empty($errors)) {
    die(json_encode(['error' => $errors[0]]));
}

// Fetch user and order information from the database
$user = $conn->query("SELECT user_email FROM users WHERE user_id = '$userId'");
$order = $conn->query("SELECT * FROM orders WHERE order_id = '$orderId'");

if ($user->num_rows === 0) {
    die(json_encode(['error' => 'User not found']));
}

if ($order->num_rows === 0) {
    die(json_encode(['error' => 'Order not found']));
}

$userResult = $user->fetch_assoc();
$orderData = $order->fetch_assoc(); // Get the order data

// Initialize the array for order items
$orderItems = [];

// Prepare the query to fetch order items for the specific order_id
$itemQry = $conn->prepare("SELECT oi.item_id, oi.quantity, oi.price, mi.item_name 
                           FROM order_items oi 
                           JOIN menu_items mi ON oi.item_id = mi.item_id 
                           WHERE oi.order_id = ?");
$itemQry->bind_param("i", $orderId); // Bind the order_id to the prepared statement
$itemQry->execute();
$itemResult = $itemQry->get_result(); // Get the result of the query

// Fetch all order items
while ($item = $itemResult->fetch_assoc()) {
    $orderItems[] = $item; // Store each item in the orderItems array
}

// Prepare email content
$to = $userResult['user_email'];
$subject = "Order Receipt - Order #B&M-order-" . $orderId;

// Create the HTML content for the email
$htmlContent = '
<html>
<head>
  <title>Order Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    h1 { color: #333; }
    p { color: #555; }
    .order-details { border-top: 2px solid #ccc; margin-top: 20px; padding-top: 10px; }
    .order-details p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Receipt for Your Order</h1>
    <p>Thank you for your order! Here are the details:</p>
    <div class="order-details">
      <p><strong>Order Id:</strong> Order #B&M-order-' . $orderId . '</p>
      <p><strong>Order Date:</strong> ' . date('F j, Y', strtotime($orderData['order_date'])) . '</p>
      <p><strong>Status:</strong> ' . ucfirst($orderData['status']) . '</p>
      
      <h3>Items Ordered:</h3>
      <ul>';

foreach ($orderItems as $item) {
    $htmlContent .= "<li>{$item['item_name']} x {$item['quantity']} - {$item['price']}</li>";
}

$htmlContent .= '</ul>
    </div>
    <p>If you have any questions, feel free to contact us at smtpmailer06@gmail.com.</p>
    <p>Thank you for your business!</p>
  </div>
</body>
</html>';


// Set content-type header for HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8" . "\r\n";

// Additional headers
$headers .= "From: B&M <smtpmailer06@gmail.com>" . "\r\n";
$headers .= "Reply-To: smtpmailer06@gmail.com" . "\r\n";
$headers .= 'Return-Path: smtpmailer06@gmail.com' . "\r\n";
$headers .= "To: " . $to . "\r\n";

// Send the email
if (mail($to, $subject, $htmlContent, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully!']);
} else {
    echo json_encode(['error' => 'Email sending failed!']);
}
