<?php
/**
 * TCMI Backend Configuration
 *
 * Reads all settings from the project-root .env file via vlucas/phpdotenv.
 * Run `composer install` inside the api/ folder before first use.
 *
 * LOCAL : values in .env (git-ignored)
 * PROD  : create .env on the server with production credentials
 */

// ── Load Composer autoloader ──────────────────────────────────────────
$autoload = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Composer dependencies not installed. Run: composer install inside api/',
    ]));
}
require_once $autoload;

// ── Load .env from project root (one level above api/) ───────────────
$envPath = dirname(__DIR__);   // c:/xampp/htdocs/TCMI/  (or /home/user/public_html/TCMI/)

$dotenv = Dotenv\Dotenv::createImmutable($envPath);
$dotenv->load();

// Required keys — will throw if missing in .env
$dotenv->required([
    'DB_HOST', 'DB_NAME', 'DB_USER',
    'JWT_SECRET',
])->notEmpty();

// ── Database ──────────────────────────────────────────────────────────
define('DB_HOST',    $_ENV['DB_HOST']);
define('DB_NAME',    $_ENV['DB_NAME']);
define('DB_USER',    $_ENV['DB_USER']);
define('DB_PASS',    $_ENV['DB_PASS']    ?? '');
define('DB_CHARSET', $_ENV['DB_CHARSET'] ?? 'utf8mb4');

// ── JWT ───────────────────────────────────────────────────────────────
define('JWT_SECRET',  $_ENV['JWT_SECRET']);
define('JWT_EXPIRES', (int)($_ENV['JWT_EXPIRES_DAYS'] ?? 7) * 24 * 60 * 60);

// ── Uploads ───────────────────────────────────────────────────────────
define('UPLOAD_DIR',  __DIR__ . '/uploads/');
define('UPLOAD_URL',  $_ENV['UPLOAD_URL']   ?? '/api/uploads/');
define('MAX_FILE_MB', (int)($_ENV['MAX_FILE_MB'] ?? 10));

// ── Seed Admin ────────────────────────────────────────────────────────
define('SEED_ADMIN_EMAIL',    $_ENV['SEED_ADMIN_EMAIL']    ?? '');
define('SEED_ADMIN_PASSWORD', $_ENV['SEED_ADMIN_PASSWORD'] ?? '');
define('SEED_ADMIN_NAME',     $_ENV['SEED_ADMIN_NAME']     ?? 'Administrator');

// ── CORS ──────────────────────────────────────────────────────────────
define('CORS_ORIGIN', $_ENV['CORS_ORIGIN'] ?? '*');

// ── App ───────────────────────────────────────────────────────────────
define('APP_ENV', $_ENV['APP_ENV'] ?? 'production');
define('APP_URL', $_ENV['APP_URL'] ?? '');

// ── PDO Connection ────────────────────────────────────────────────────
function getDB(): PDO {
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
