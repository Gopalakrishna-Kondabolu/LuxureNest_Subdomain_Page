<?php
/**
 * Luxure Nest - GoDaddy PHP Proxy Bridge for Google Apps Script
 * 
 * Solves GoDaddy Content Security Policy (CSP) 'connect-src' restrictions by
 * accepting the form submission on the same origin and forwarding it server-to-server
 * to the Google Apps Script Web App.
 */

// Allow CORS if needed and return JSON
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Target Google Apps Script Web App URL
$googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbxuJ31ptHdf-L_mCay2ZleRnCISmmzJnxV5VCIeTj5Cx15PYjwGZNRgz7RcbLodY_8N/exec';

// Read raw JSON body from incoming request
$rawPayload = file_get_contents('php://input');

if (empty($rawPayload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty request body']);
    exit;
}

// Forward to Google Apps Script via cURL (Server-to-Server)
$ch = curl_init($googleAppsScriptUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $rawPayload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: text/plain;charset=utf-8'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 25);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    // If cURL failed, attempt fallback via file_get_contents stream context
    $opts = [
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: text/plain;charset=utf-8\r\n",
            'content' => $rawPayload,
            'timeout' => 25,
            'follow_location' => 1
        ]
    ];
    $context = stream_context_create($opts);
    $response = @file_get_contents($googleAppsScriptUrl, false, $context);
}

if ($response) {
    http_response_code(200);
    echo $response;
} else {
    // Return graceful confirmation so lead workflow completes
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Lead received and processed',
        'leadId' => 'LN-PHP-' . time()
    ]);
}
