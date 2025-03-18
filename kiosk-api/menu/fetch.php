<?php

require_once "../config/headers.php";
require_once "../config/db.php";
require_once "../vendor/autoload.php"; // Include Composer's autoloader for the JWT library

use \Firebase\JWT\JWT;

try {

    $categories = [
        'starters' => 'Starters',
        'main-course' => 'Main Course',
        'breads' => 'Breads',
        'dessert' => 'Desserts',
        'beverages' => 'Beverages',
    ];

    $data = [];
    foreach ($categories as $id => $name) {
        $data[] = [
            'id' => $id,
            'name' => $name,
            'items' => []
        ];
    }
    $qry = $conn->query("SELECT item_id id, item_name name, item_des description, item_price price, item_category categoryId FROM menu_items");

    // Loop through the result and organize it by category
    while ($item = $qry->fetch_assoc()) {
        $categoryId = $item['categoryId'];

        if (array_key_exists($categoryId, $categories)) {
            foreach($data as $key => $d){
                if($data[$key]['id']==$categoryId){
                    $data[$key]['items'][] = $item;
                }
            }
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch menu items, please try again !']);
} finally {
    $conn->close();
}
