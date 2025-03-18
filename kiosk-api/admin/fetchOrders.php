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
$token = $data['token'] ?? null;
$for = $data['for'] ?? null;
$adminId = null;
if ($token) {
    // Verify JWT Token for logged-in users
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        if ($decoded && isset($decoded->sub)) {
            $adminId = $decoded->sub;
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
}

// Fetch orders based on user or guest ID
$orders = [];
if ($for == 'cook') {
    $qry = $conn->prepare("SELECT * FROM orders WHERE waiter_id IS NULL ORDER BY order_id DESC");
} else if ($for == 'waiter') {
    $qry = $conn->prepare("SELECT * FROM orders WHERE waiter_id = '$adminId' AND status = 'ready' ORDER BY order_id DESC");
} else {
    $qry = $conn->prepare("SELECT * FROM orders  ORDER BY order_id DESC");
}

$qry->execute();
$result = $qry->get_result();

// Check if any orders were found
if ($result->num_rows > 0) {
    // Fetch and store all orders in an array
    while ($order = $result->fetch_assoc()) {
        $orderId = $order['order_id'];
        $notifid = $order['waiter_id'];

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

        $orders[] = [
            'id' => $orderId,
            'orderNumber' => "B&M-order-" . $order['order_id'], 
            'timestamp' => $order['order_date'],  
            'items' => $orderItems,
            'notified' => $notifid,
            'total' => (float) $order['order_total'],
            'status' => $order['status'], 
        ];
    }

    // Return success response with orders data
    $waiter = $conn->query("SELECT admin_id id FROM admin WHERE admin_type ='waiter'");
    http_response_code(200);
    echo json_encode(['success' => true, 'orders' => $orders, 'waiters' => $waiter->fetch_all() ?? []]);
} else {
    // No orders found
    http_response_code(200);
    echo json_encode(['success' => true, 'orders' => []]);
}

$conn->close();  // Close the DB connection
