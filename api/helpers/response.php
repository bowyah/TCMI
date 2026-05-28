<?php
/**
 * JSON Response Helpers
 */

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): void {
    json_response(['error' => $message], $status);
}

function json_success(string $message = 'OK'): void {
    json_response(['message' => $message]);
}

/**
 * Get JSON body from POST/PUT request
 */
function get_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Get an uploaded file URL (builds full URL from filename)
 */
function file_url(string $filename): string {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $protocol . '://' . $host . UPLOAD_URL . $filename;
}

/**
 * Handle file upload. Returns [path, url] or null.
 */
function handle_upload(string $field): ?array {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $file = $_FILES[$field];

    // Check size
    $maxBytes = MAX_FILE_MB * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        json_error('File too large (max ' . MAX_FILE_MB . 'MB)', 413);
    }

    // Check extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'pptx', 'xlsx'];
    if (!in_array($ext, $allowed)) {
        json_error('File type not allowed', 400);
    }

    // Generate unique filename
    require_once __DIR__ . '/uuid.php';
    $newName = uuid4() . '.' . $ext;
    $destPath = UPLOAD_DIR . $newName;

    // Ensure upload dir exists
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        json_error('Failed to save uploaded file', 500);
    }

    return ['path' => $destPath, 'url' => file_url($newName)];
}
