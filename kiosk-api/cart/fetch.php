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
    echo json_encode(['error' => 'Invalid JSON data or missing token']);
    exit();
}

// Validation
$errors = [];

$token = $data['token'] ?? null;
$userId = null;

if ($token) {
    $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
    if ($decoded && $decoded->sub) {
        $userId = $decoded->sub;
    } else {
        $errors[] = 'user loged in required to fetch cart items, please try login in !';
    }
} else {
    $errors[] = 'user loged in required to fetch cart items, please try login in !';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

try {
    // Fetch the item details from the menu_items table
    $qry = $conn->query("SELECT item_id id, item_name name,CAST(item_price AS DECIMAL(10,2)) AS price, item_des description, item_category categoryId, cart_quantity quantity FROM cart_item JOIN menu_items ON menu_items.item_id = cart_item.cart_item_id WHERE cart_user_id = '$userId'");
    $items = $qry->fetch_all(MYSQLI_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'cart fetched successfully',
        'cart_items' => $items
    ]);
} catch (Exception $e) {
    echo $e->getMessage();
    // General error handling
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch cart items. Please try again.']);
} finally {
    $conn->close();
}
