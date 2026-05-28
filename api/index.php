<?php
/**
 * TCMI Backend API — Main Router (Single Entry Point)
 */

// ── CORS Headers ──────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Load dependencies ─────────────────────────────────────────────
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/uuid.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/public.php';
require_once __DIR__ . '/routes/admin.php';

// ── Parse route ───────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];

// Get the path after /api/
$requestUri = $_SERVER['REQUEST_URI'];
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove the script directory prefix
if ($scriptDir !== '/' && strpos($path, $scriptDir) === 0) {
    $path = substr($path, strlen($scriptDir));
}
$path = trim($path, '/');

// Remove 'api/' prefix if present
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Split into segments
$segments = $path ? explode('/', $path) : [];

// ── Health check ──────────────────────────────────────────────────
if ($path === 'health' || $path === '') {
    json_response([
        'status'    => 'ok',
        'service'   => 'TCMI API',
        'timestamp' => date('c'),
        'php'       => phpversion(),
    ]);
}

// ── Route to handlers ─────────────────────────────────────────────
// Auth routes (auth/login, auth/me, etc.)
if (handleAuth($method, $path, $segments)) exit;

// Public routes (team, events, gallery, etc.)
if (handlePublic($method, $path, $segments)) exit;

// Admin routes (authenticated CRUD)
if (handleAdmin($method, $path, $segments)) exit;

// ── 404 ───────────────────────────────────────────────────────────
json_error("Route $method /$path not found", 404);
