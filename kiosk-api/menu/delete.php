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

$itemId = $data['id'] ?? null;

// Validation

$errors = [];

// Validate menu ID (must not be empty)
if (empty($itemId)) {
    $errors[] = 'Menu Item ID is required.';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

try {
    $adminId = 1;
    $qry = $conn->query("DELETE FROM menu_items WHERE item_id = '$itemId'");
    if ($qry && $conn->affected_rows) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'item delete',
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'error' => 'item not found or already deleted, please check your details and try again !',
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete menu item, please try again !']);
} finally {
    $conn->close();
}
