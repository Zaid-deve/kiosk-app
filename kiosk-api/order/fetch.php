<?php
require_once "../config/headers.php";
require_once "../config/db.php";
require_once "../vendor/autoload.php";  // Include Composer's autoloader for the JWT library
use \Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Get raw POST data
$inputData = file_get_contents("php://input");
$data = json_decode($inputData, true);

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

// Fetch orders based on user or guest ID
$orders = [];
if ($userId) {
    // Fetch orders for logged-in user
    $qry = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY order_id DESC");
    $qry->bind_param("i", $userId);
} else {
    // Fetch orders for guest user
    $qry = $conn->prepare("SELECT * FROM orders WHERE guest_id = ? ORDER BY order_id DESC");
    $qry->bind_param("s", $guestId);
}

$qry->execute();
$result = $qry->get_result();

// Check if any orders were found
if ($result->num_rows > 0) {
    // Fetch and store all orders in an array
    while ($order = $result->fetch_assoc()) {
        $orderId = $order['order_id'];
        
        // Fetch order items for each order
        $orderItems = [];
        $itemQry = $conn->prepare("SELECT oi.item_id, oi.quantity, oi.price, mi.item_name FROM order_items oi 
                                    JOIN menu_items mi ON oi.item_id = mi.item_id WHERE oi.order_id = ?");
        $itemQry->bind_param("i", $orderId);
        $itemQry->execute();
        $itemResult = $itemQry->get_result();

        while ($item = $itemResult->fetch_assoc()) {
            $orderItems[] = [
                'id' => $item['item_id'],
                'name' => $item['item_name'],
                'quantity' => (int) $item['quantity'],
                'price' => (float) $item['price']
            ];
        }
        
        // Add order with its items to the orders array, formatted according to the Order interface
        $orders[] = [
            'id' => $orderId,
            'orderNumber' => "B&M-order-".$order['order_id'],  // Assuming 'order_number' exists in DB
            'timestamp' => $order['order_date'],  // Assuming 'created_at' exists in DB
            'items' => $orderItems,
            'total' => (float) $order['order_total'],
            'status' => $order['status'],  // Assuming status is a string like "pending", "completed", etc.
        ];
    }

    // Return success response with orders data
    http_response_code(200);
    echo json_encode(['success' => true, 'orders' => $orders]);
} else {
    // No orders found
    http_response_code(200);
    echo json_encode(['success' => true, 'orders' => []]);
}

$conn->close();  // Close the DB connection
