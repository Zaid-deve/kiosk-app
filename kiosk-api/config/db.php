<?php

// jwt secret
define("JWT_SECRET_KEY", 'secretkey');

// db credentials
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "kiosk-app";

// connection
try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
} catch (Exception $e) {
    http_response_code(500);
    json_encode(["message" => "Something went wrong !"]);
}
