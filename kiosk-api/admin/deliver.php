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
$orderId = $data['orderId'] ?? null;

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['error' => 'Order Id is required.']);
}


// verify
if ($token) {
    // Verify JWT Token for logged-in users
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        if ($decoded && isset($decoded->sub)) {
            $userId = $decoded->sub;
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized user. Please log in.']);
            exit();
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token.']);
        exit();
    }
}


$qry = $conn->query("UPDATE orders SET status = 'delivered' WHERE order_id = '$orderId'");
if ($qry) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'order delivered successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => true,
        'message' => 'Failed to deliver order !'
    ]);
}

$conn->close();
