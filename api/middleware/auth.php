<?php
/**
 * JWT Authentication Middleware
 */

require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../config.php';

/**
 * Authenticate the request. Returns user payload or sends 401.
 */
function authenticate(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (strpos($header, 'Bearer ') !== 0) {
        json_error('No token provided', 401);
    }

    $token = substr($header, 7);
    $user = jwt_decode($token, JWT_SECRET);

    if (!$user) {
        json_error('Invalid or expired token', 401);
    }

    return $user;
}

/**
 * Require admin role
 */
function requireAdmin(array $user): void {
    if (($user['role'] ?? '') !== 'admin') {
        json_error('Admin access required', 403);
    }
}

/**
 * Require admin or faculty role
 */
function requireAdminOrFaculty(array $user): void {
    $role = $user['role'] ?? '';
    if (!in_array($role, ['admin', 'faculty'])) {
        json_error('Faculty or admin access required', 403);
    }
}
