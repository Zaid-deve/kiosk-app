<?php

// Include required files
require_once "../config/headers.php";
require_once "../config/db.php";
require_once "../vendor/autoload.php"; // For JWT library

use \Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Get raw POST data
$inputData = file_get_contents("php://input");

// Decode JSON data
$data = json_decode($inputData, true);

// Check if JSON is valid
if ($data === null) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid JSON data or missing token']);
    exit();
}

// Validate the token and user authentication
$errors = [];
$token = $data['token'] ?? null;
$userId = null;

if ($token) {
    try {
        // Decode the JWT token
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        if ($decoded && isset($decoded->sub)) {
            $userId = $decoded->sub;
        } else {
            $errors[] = 'User is not authenticated. Please login again.';
        }
    } catch (Exception $e) {
        $errors[] = 'Invalid token. Please login again.';
    }
} else {
    $errors[] = 'User login required to remove item from cart.';
}

// If there are any errors, return them
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

// Get item ID from the request
$itemId = $data['itemId'] ?? null;

if (!$itemId) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Missing item ID']);
    exit();
}

try {
    // Prepare the query to delete the item from the cart
    $query = $conn->query("DELETE FROM cart_item WHERE cart_user_id = '$userId' AND cart_item_id = '$itemId'");

    if (!$query || !$conn->affected_rows) {
        http_response_code(404);
        echo json_encode(['error' => 'Failed to remove item from cart, item already removed from cart or dosent exists.']);
    } else {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => "item removed from cart !"]);
    }
} catch (Exception $e) {
    // General error handling
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Failed to remove item from cart. Please try again.']);
} finally {
    // Close database connection
    $conn->close();
}
