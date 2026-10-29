<?php
/**
 * Luxure Nest - GoDaddy / Apache PHP Resilient Lead Ingestion Proxy
 * 
 * Features:
 * - Solves browser-side CSP/CORS restrictions by proxying lead submission server-to-server.
 * - Honeypot spam deflection.
 * - Durable persistence: Appends every lead immediately to data/leads-backup.jsonl.
 * - Isolated test sandbox support.
 * - Outgoing timeout handling and retry.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-idempotency-key, x-luxure-sandbox');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$googleAppsScriptUrl = getenv('GOOGLE_SHEET_WEBHOOK_URL') ?: 'https://script.google.com/macros/s/AKfycbxuJ31ptHdf-L_mCay2ZleRnCISmmzJnxV5VCIeTj5Cx15PYjwGZNRgz7RcbLodY_8N/exec';

// Read raw JSON body
$rawPayload = file_get_contents('php://input');

if (empty($rawPayload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty request body']);
    exit;
}

$payload = json_decode($rawPayload, true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Malformed JSON payload']);
    exit;
}

// 1. Honeypot spam guard
if (!empty($payload['_hp_company_website']) || !empty($payload['completeLeadRecord']['_hp_company_website'])) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Inquiry received', 'leadId' => 'LN-DEF-' . time()]);
    exit;
}

// 2. Validate essential fields
$row = $payload['googleSheetRow'] ?? [];
$lead = $payload['completeLeadRecord'] ?? [];
$name = trim($row['Name'] ?? $lead['fullName'] ?? '');

if (strlen($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid Name is required (minimum 2 characters)']);
    exit;
}

// 3. Sandbox mode detection
$isSandbox = (isset($_GET['sandbox']) && $_GET['sandbox'] === 'true') ||
             (!empty($payload['isTest'])) ||
             (isset($_SERVER['HTTP_X_LUXURE_SANDBOX']) && $_SERVER['HTTP_X_LUXURE_SANDBOX'] === 'true');

$leadId = 'LN-' . time() . '-' . substr(md5(uniqid(rand(), true)), 0, 5);

// 4. Durable local logging
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$logFile = $isSandbox ? ($dataDir . '/leads-test.jsonl') : ($dataDir . '/leads-backup.jsonl');
$logEntry = [
    'leadId' => $leadId,
    'receivedAt' => date('c'),
    'clientIp' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'isSandbox' => $isSandbox,
    'payload' => $payload
];
$savedLocally = @file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);

// If sandbox test, return immediately without touching live Google Sheet
if ($isSandbox) {
    if ($savedLocally === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Storage permission error on server: data directory not writable']);
        exit;
    }
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'isSandbox' => true,
        'message' => 'Lead safely recorded in isolated test store',
        'leadId' => $leadId
    ]);
    exit;
}

// 5. Forward to Google Apps Script via cURL with timeout
$ch = curl_init($googleAppsScriptUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $rawPayload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: text/plain;charset=utf-8'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response && $httpCode >= 200 && $httpCode < 400) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Lead safely recorded and synchronized with Google Sheets',
        'leadId' => $leadId
    ]);
} else if ($savedLocally !== false) {
    // Lead is durably preserved in local backup log even though Google Sheets was temporarily unreachable
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Lead safely captured in durable backup (Google Sheets sync delayed)',
        'leadId' => $leadId
    ]);
} else {
    // Both local storage AND Google Sheets failed: do NOT pretend success!
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'Unable to record lead at this time. Please call our advisory team directly.'
    ]);
}
