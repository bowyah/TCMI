<?php
/**
 * TCMI Backend Configuration
 * 
 * LOCAL (XAMPP):  Use these defaults
 * PRODUCTION:    Update DB_HOST, DB_NAME, DB_USER, DB_PASS, JWT_SECRET, UPLOAD_URL
 */

// ── Database ──────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'tcmi_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// ── JWT ───────────────────────────────────────────────────────────
define('JWT_SECRET', 'tcmi_super_secret_change_this_in_production_2026');
define('JWT_EXPIRES', 7 * 24 * 60 * 60); // 7 days

// ── Uploads ───────────────────────────────────────────────────────
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', '/api/uploads/');   // relative — works for both local & prod
define('MAX_FILE_MB', 10);

// ── Seed Admin ────────────────────────────────────────────────────
define('SEED_ADMIN_EMAIL', 'bowyah26@gmail.com');
define('SEED_ADMIN_PASSWORD', 'admin@tcmi');
define('SEED_ADMIN_NAME', 'Administrator');

// ── CORS ──────────────────────────────────────────────────────────
define('CORS_ORIGIN', '*');  // restrict to your domain in production

// ── PDO Connection ────────────────────────────────────────────────
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}
