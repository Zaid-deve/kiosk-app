<?php

header("Access-Control-Allow-Origin: *");  
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");  // Methods allowed
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");  // Headers allowed

// If it's a preflight request (OPTIONS method), you might want to handle it like this:
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Preflight request - return an empty response with CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    http_response_code(200);
    exit();
}
