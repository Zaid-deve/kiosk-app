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

$name = $data['name'] ?? null;
$email = $data['email'] ?? null;
$phone = $data['phone'] ?? null;
$password = $data['password'] ?? null;

// Validation

$errors = [];

// Validate name (should not be empty)
if (empty($name)) {
    $errors[] = 'Name is required.';
}

// Validate email (should be a valid email format)
if (empty($email)) {
    $errors[] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format.';
}

// Validate phone (should be a valid phone number, assuming Indian phone numbers for example)
if (empty($phone)) {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match("/^\+?[0-9]{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/", $phone)) {
    $errors[] = 'Invalid phone number format.';
}

// Validate password (minimum length, at least 8 characters)
if (empty($password)) {
    $errors[] = 'Password is required.';
} elseif (strlen($password) < 8) {
    $errors[] = 'Password must be at least 8 characters long.';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    // Insert the user into the database
    $qry = $conn->query("INSERT INTO users (user_name, user_email, user_phone, user_pass) VALUES ('$name', '$email', '$phone', '$hash')");

    // Get the user ID after insertion
    $userId = $conn->insert_id;

    // JWT Payload: data to encode
    $payload = [
        'iat' => time(),
        'sub' => $userId, // Subject: user ID
    ];

    // Generate the JWT token
    $jwt = JWT::encode($payload, JWT_SECRET_KEY, 'HS256');

    // Return a success response with the JWT token
    http_response_code(201); // Created
    echo json_encode([
        'success' => 1,
        'message' => 'User registered successfully.',
        'token' => $jwt
    ]);
    
} catch (Exception $e) {
    if ($e->getCode() === 1062) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Email or phone number already exists.']);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Error occurred: ' . $e->getMessage()]);
    }
} finally {
    // Close the connection
    $conn->close();
}

?>
