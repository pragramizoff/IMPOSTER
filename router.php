<?php
// Route all requests properly for PHP built-in server
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Route API calls
if (str_starts_with($uri, '/api.php')) {
    require __DIR__ . '/api.php';
    exit;
}

// Serve static files as-is
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false; // Let built-in server handle it
}

// Default: serve index.html
require __DIR__ . '/index.html';
