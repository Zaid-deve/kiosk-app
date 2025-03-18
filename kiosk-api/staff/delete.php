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
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Validation

$errors = [];

$token = $data['token'] ?? null;
$adminId = null;
$staffId = $data['id'];

if (!$staffId) {
    $errors[] = "staff id is required !";
}

if ($token) {
    try {
        // Decode the JWT token
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        if ($decoded && $decoded->sub) {
            $adminId = $decoded->sub;
        } else {
            $errors[] = 'User must be logged in to delete staff member, please log in!';
        }
    } catch (Exception $e) {
        $errors[] = 'Invalid or expired token, please log in again!';
    }
} else {
    $errors[] = 'User must be logged in to get staff, please log in!';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}


try {
    $qry = $conn->query("DELETE FROM admin WHERE admin_id = '$staffId'");
    if ($qry) {
        http_response_code(200);
        echo json_encode(['success' => 'true']);
    } else {
        throw new Exception("Failed to delete staff ");
    }
} catch (Exception $e) {
    echo json_encode(['error' => "Failed to delete staff "]);
} finally {
    $conn->close();
}
