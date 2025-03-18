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
    echo json_encode(['error' => 'Invalid JSON data or missing itemId']);
    exit();
}

// Validation
$errors = [];

$itemId = $data['itemId'] ?? null;
$token = $data['token'] ?? null;
$userId = null;

if ($token) {
    $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
    if ($decoded && $decoded->sub) {
        $userId = $decoded->sub;
    } else {
        $errors[] = 'User login required to add item to cart, please log in!';
    }
} else {
    $errors[] = 'User login required to add item to cart, please log in!';
}

// Ensure that itemId is provided and is valid
if (empty($itemId)) {
    $errors[] = 'Item ID is required.';
}

// If there are any errors, return them to the client
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $errors[0]]);
    exit();
}

try {
    // Fetch the item details from the menu_items table
    $qry = $conn->query("SELECT * FROM menu_items WHERE item_id = '$itemId'");

    // Check if the item exists in the database
    if ($qry->num_rows > 0) {
        $item = $qry->fetch_assoc();
        
        // Check if the item already exists in the user's cart
        $cartQry = $conn->query("SELECT * FROM cart_item WHERE cart_user_id = '$userId' AND cart_item_id = '$itemId'");

        if ($cartQry->num_rows > 0) {
            // Item exists in the cart, update the quantity and price
            $cartItem = $cartQry->fetch_assoc();
            $newQuantity = $cartItem['cart_quantity'] + 1;  // Increase the quantity by 1
            $newPrice = $item['item_price'] * $newQuantity; // Update the price based on the new quantity

            // Update the cart item with the new quantity and price
            $updateQry = $conn->query("UPDATE cart_item SET cart_quantity = '$newQuantity' WHERE cart_user_id = '$userId' AND cart_item_id = '$itemId'");

            if ($updateQry) {
                http_response_code(200);  // OK
                echo json_encode([
                    'success' => true,
                    'message' => 'Item quantity updated successfully',
                    'itemId' => $itemId,
                    'newQuantity' => $newQuantity,
                    'newPrice' => $newPrice
                ]);
            } else {
                // Error updating cart item
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update the cart item. Please try again.']);
            }
        } else {
            // Item does not exist in the cart, add it
            $cartQryInsert = $conn->query("INSERT INTO cart_item (cart_user_id, cart_item_id, cart_quantity) VALUES ('$userId', '$itemId', 1)");

            if ($cartQryInsert) {
                http_response_code(201);  // Created
                echo json_encode([
                    'success' => true,
                    'message' => 'Item successfully added to cart',
                    'itemId' => $itemId
                ]);
            } else {
                // Error adding item to the cart
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add item to the cart. Please try again.']);
            }
        }
    } else {
        // Item not found in the menu_items table
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'Item not found']);
    }
} catch (Exception $e) {
    // General error handling
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred. Please try again later.']);
} finally {
    $conn->close();
}
?>
