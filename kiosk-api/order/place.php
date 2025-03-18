<?php
require_once "../config/headers.php";
require_once "../config/db.php";
require_once "../vendor/autoload.php";  // Include Composer's autoloader for the JWT library
use \Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Get raw POST data
$inputData = file_get_contents("php://input");
$data = json_decode($inputData, true);

// Validation: Check if the required data is present
if (!isset($data['orderItems']) || empty($data['orderItems'])) {
    http_response_code(400);  // Bad Request
    echo json_encode(['error' => 'Order items are required.']);
    exit();
}

// Authentication: Check if user is logged in and handle token or guest ID
$userId = null;
$guestId = null;
$token = $data['token'] ?? null;
if ($token) {
    // Verify JWT Token for logged-in users
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        if ($decoded && isset($decoded->sub)) {
            $userId = $decoded->sub;
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized user. Please log in.']);
            exit();
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token.']);
        exit();
    }
} else {
    // For guest users, use guestId
    $guestId = $data['guestId'] ?? null;
    if (!$guestId) {
        http_response_code(400);
        echo json_encode(['error' => 'Guest ID is required for guest users.']);
        exit();
    }
}

// Calculate the total order price based on the items and quantities
$orderTotal = 0;
foreach ($data['orderItems'] as $item) {
    $itemId = $item['id'];
    $quantity = $item['quantity'];

    $qry = $conn->query("SELECT item_price FROM menu_items WHERE item_id = '$itemId'");
    if ($qry->num_rows > 0) {
        $itemData = $qry->fetch_assoc();
        $orderTotal += (float)$itemData['item_price'] * $quantity;  // Add item price * quantity to total
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid item ID: ' . $itemId]);
        exit();
    }
}

// Begin transaction
$conn->begin_transaction();

try {
    // Insert the order into the orders table
    $orderStmt = $conn->prepare("INSERT INTO orders (user_id, guest_id, order_total,status) VALUES (?, ?, ?, ?)");
    
    $orderStmt->execute([$userId, $guestId, $orderTotal, "pending"]);
    $orderId = $orderStmt->insert_id;  // Get the ID of the newly created order

    // Insert order items into the order_items table
    foreach ($data['orderItems'] as $item) {
        $itemId = $item['id'];
        $quantity = $item['quantity'];

        $itemStmt = $conn->query("SELECT item_price FROM menu_items WHERE item_id = '$itemId'");
        $itemData = $itemStmt->fetch_assoc();
        $price = (float) $itemData['item_price'];
        
        $insertItemQuery = "INSERT INTO order_items (order_id, item_id, quantity, price) 
                            VALUES ('$orderId', '$itemId', '$quantity', '$price')";
        if (!$conn->query($insertItemQuery)) {
            throw new Exception("Error placing order items: " . $conn->error);
        }
    }

    // remove cart items
    $qry = $conn->query("DELETE FROM cart_item WHERE cart_user_id = '$userId'");
    if(!$qry){
        throw new Exception("Error placing order items: " . $conn->error);
    }

    // Commit transaction
    $conn->commit();

    // Return success response
    http_response_code(200);
    echo json_encode(['ok' => true, 'orderId' => $orderId, 'message' => 'Order placed successfully.']);

} catch (Exception $e) {
    // Rollback in case of error
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to place order. Please try again later.']);
} finally {
    $conn->close();  // Close the DB connection
}
