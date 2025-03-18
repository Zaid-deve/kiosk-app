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

$username = $data['username'] ?? null;
$password = $data['password'] ?? null;
$route = $data['route'] ?? null;

// Validation

$errors = [];

// Validate username 
if (empty($username)) {
    $errors[] = 'Username is required.';
}

// Validate password (should not be empty)
if (empty($password)) {
    $errors[] = 'Password is required.';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

// Check if the admin exists in the database
try {
    $qry = $conn->query("SELECT admin_id,admin_pass FROM admin WHERE admin_username = '$username' AND admin_type = '$route'");

    // If no user found
    if ($qry->num_rows === 0) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => "$route Account Not Found !"]);
        exit();
    }

    // Get user data
    $admin = $qry->fetch_assoc();

    // Verify password
    if (!password_verify($password, $admin['admin_pass']) && $password != $admin['admin_pass']) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Wrong Password !']);
        exit();
    }

    // JWT Payload: data to encode
    $payload = [
        'iat' => time(), // Issued at: time when the token was generated
        'sub' => $admin['admin_id'], // Subject: user ID
    ];

    // Generate the JWT token
    $jwt = JWT::encode($payload, JWT_SECRET_KEY, 'HS256');

    // Return a success response with the JWT token
    http_response_code(200); // OK
    echo json_encode([
        'success' => 1,
        'message' => 'Login successful.',
        'token' => $jwt
    ]);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error occurred: ' . $e->getMessage()]);
} finally {
    // Close the connection
    $conn->close();
}
