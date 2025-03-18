<?php

require_once "../config/headers.php";
require_once "../config/db.php";
require_once "../vendor/autoload.php"; // Include Composer's autoloader for the JWT library

use \Firebase\JWT\JWT;

// Read raw POST data from the request body
$inputData = file_get_contents("php://input");

// Decode the JSON data to an associative array
$data = json_decode($inputData, true);

// Check if JSON is valid and contains required fields
if ($data === null) {
    // Handle invalid JSON or missing data
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

$categoryId = $data['categoryId'] ?? null;
$des = $data['description'] ?? null;
$name = $data['name'] ?? null;
$price = $data['price'] ?? null;
$itemId = $data['id'] ?? null;

// Validation

$errors = [];

// Validate menu ID (must not be empty)
if (empty($itemId)) {
    $errors[] = 'Menu Item ID is required.';
}

// Validate Category ID (must not be empty)
if (empty($categoryId)) {
    $errors[] = 'Category ID is required.';
}

// Validate Name (should not be empty and at least 3 characters long)
if (empty($name)) {
    $errors[] = 'Item name is required.';
} elseif (strlen($name) < 3) {
    $errors[] = 'Item name must be at least 3 characters long.';
}

// Validate Price (must be a valid number and greater than zero)
if (empty($price)) {
    $errors[] = 'Price is required.';
} elseif (!is_numeric($price) || $price <= 0) {
    $errors[] = 'Price must be a valid positive number.';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

try {
    $adminId = 1;
    $qry = $conn->query("UPDATE menu_items 
                         SET item_name = '$name', item_des = '$des', item_category = '$categoryId', item_price = '$price' 
                         WHERE item_id = '$itemId'");
    if ($qry && $conn->affected_rows) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'item updated',
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'error' => 'item not found, please check your details and try again !',
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to edit menu item, please try again !']);
} finally {
    $conn->close();
}
