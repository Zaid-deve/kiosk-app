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
$id = $data['id'] ?? null;

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


try {
    $qry = $conn->query("INSERT INTO admin (admin_username, admin_pass, admin_type) VALUES ('$username', '$password', '$id')");
    if($qry){
        http_response_code(200);
        echo json_encode(['success'=>'true']);
    }
    else {
        throw new Exception("Failed to create " . $id);
    }
} catch(Exception $e){
    http_response_code(500);
    if($e->getCode()==1062){
        echo json_encode(['error' => 'username already exists !']);
    } else {
        echo json_encode(['error' => "Failed to create " . $id]);
    }
}finally{
    $conn->close();
}