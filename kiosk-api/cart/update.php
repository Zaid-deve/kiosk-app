<?php

require_once "../config/headers.php";
require_once "../config/db.php"; // Including the database connection file
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
    echo json_encode(['error' => 'Invalid JSON data or missing fields']);
    exit();
}

// Validation
$errors = [];
$token = $data['token'] ?? null;
$itemId = $data['itemId'] ?? null;
$newQuantity = $data['newQuantity'] ?? null;
$userId = null;

if ($token) {
    try {
        // Decode the JWT token
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        if ($decoded && $decoded->sub) {
            $userId = $decoded->sub;
        } else {
            $errors[] = 'User must be logged in to update the cart, please log in!';
        }
    } catch (Exception $e) {
        $errors[] = 'Invalid or expired token, please log in again!';
    }
} else {
    $errors[] = 'User must be logged in to update the cart, please log in!';
}

// Ensure the itemId and newQuantity are provided and valid
if (empty($itemId) || empty($newQuantity) || $newQuantity < 1) {
    $errors[] = 'Valid itemId and newQuantity are required';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

try {
    // Sanitize the variables to prevent SQL injection
    $itemId = $conn->real_escape_string($itemId);  // Escape the item ID
    $newQuantity = (int)$newQuantity;
    $userId = (int)$userId;

    $query = "UPDATE cart_item SET cart_quantity = $newQuantity WHERE cart_user_id = $userId AND cart_item_id = $itemId";
    
    // Execute the query
    if ($conn->query($query)) {
        // If the update was successful
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Cart item quantity updated successfully',
            'itemId' => $itemId,
            'newQuantity' => $newQuantity
        ]);
    } else {
        // If the query fails
        throw new Exception("Failed to update the cart item quantity");
    }

} catch (Exception $e) {
    // General error handling
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update the cart item quantity. Please try again.']);
} finally {
    // Close the connection if it is open
    if (isset($conn)) {
        $conn->close();
    }
}
