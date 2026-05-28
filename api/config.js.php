<?php
/**
 * Public runtime config — served as application/javascript
 * Exposes only non-sensitive, browser-safe variables from .env
 *
 * Usage in index.html (before api.js):
 *   <script src="/TCMI/api/config.js"></script>
 */

// Load Composer + dotenv (same as config.php)
require_once __DIR__ . '/../vendor/autoload.php';

$envPath = dirname(dirname(__DIR__));
$dotenv  = Dotenv\Dotenv::createImmutable($envPath);
$dotenv->safeLoad();   // silently skips if .env is missing

$appUrl = rtrim($_ENV['APP_URL'] ?? '', '/');
$appEnv = $_ENV['APP_ENV'] ?? 'production';

// Derive the API base URL from APP_URL
// e.g. https://tcmi.org  →  https://tcmi.org/api
$apiBase = $appUrl ? $appUrl . '/api' : '/api';

header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store');   // always fresh so env changes apply immediately
?>
/* TCMI runtime config — auto-generated from .env */
window.TCMI_CONFIG = {
  appUrl:  <?= json_encode($appUrl) ?>,
  apiBase: <?= json_encode($apiBase) ?>,
  env:     <?= json_encode($appEnv) ?>
};
