<?php
require_once "../config/headers.php";
require_once "../config/db.php";
require_once "../vendor/autoload.php";  // Include Composer's autoloader for the JWT library
use \Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Get raw POST data
$inputData = file_get_contents("php://input");
$data = json_decode($inputData, true);

// Validation
$errors = [];
$token = $data['token'] ?? null;
$guest = $data['guestId'] ?? null;
$guestId = null;
$orderId = $data['orderId'] ?? null;
$userId = null;


// verify
if ($token) {
    try {
        // Decode the JWT token
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        if ($decoded && $decoded->sub) {
            $userId = $decoded->sub;
        } else {
            $errors[] = 'User must be logged in to reject order, please log in!';
        }
    } catch (Exception $e) {
        $errors[] = 'Invalid or expired token, please log in again!';
    }
} else if ($guest) {
    // For guest users, use guestId
    $guestId = $data['guestId'] ?? null;
    if (!$guestId) {
        http_response_code(400);
        echo json_encode(['error' => 'Guest ID is required for guest users.']);
        exit();
    }
} else {
    $errors[] = 'User must be logged in to update the cart, please log in!';
}

if(!empty($errors)){
    echo json_encode(['error' => $errors[0]]);
    exit();
}

$qry = $conn->query("UPDATE orders SET status = 'rejected' WHERE order_id = '$orderId' AND (user_id = '$userId' OR guest_id = '$guestId')");
if ($qry) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'order rejected successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => true,
        'message' => 'Failed to reject order !'
    ]);
}

$conn->close();
