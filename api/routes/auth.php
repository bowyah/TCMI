<?php
/**
 * Auth Routes — Login, me, logout, change-password
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/uuid.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleAuth(string $method, string $path, array $segments): bool {

    // POST /api/auth/login
    if ($method === 'POST' && $path === 'auth/login') {
        $body = get_json_body();
        $email = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            json_error('Email and password required', 400);
        }

        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            json_error('Invalid credentials', 401);
        }

        $payload = [
            'id'      => $user['id'],
            'email'   => $user['email'],
            'name'    => $user['name'],
            'role'    => $user['role'],
            'tcmi_id' => $user['tcmi_id'],
            'exp'     => time() + JWT_EXPIRES,
        ];

        $token = jwt_encode($payload, JWT_SECRET);

        // Remove password from response
        unset($user['password']);
        json_response(['token' => $token, 'user' => $user]);
        return true;
    }

    // GET /api/auth/me
    if ($method === 'GET' && $path === 'auth/me') {
        $authUser = authenticate();
        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$authUser['id']]);
        $user = $stmt->fetch();

        if (!$user) json_error('User not found', 404);
        unset($user['password']);
        json_response($user);
        return true;
    }

    // POST /api/auth/logout
    if ($method === 'POST' && $path === 'auth/logout') {
        authenticate();
        json_success('Logged out');
        return true;
    }

    // POST /api/auth/change-password
    if ($method === 'POST' && $path === 'auth/change-password') {
        $authUser = authenticate();
        $body = get_json_body();
        $current = $body['current_password'] ?? '';
        $new = $body['new_password'] ?? '';

        if (!$current || !$new) json_error('Both passwords required', 400);
        if (strlen($new) < 6) json_error('New password must be at least 6 characters', 400);

        $db = getDB();
        $stmt = $db->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$authUser['id']]);
        $row = $stmt->fetch();

        if (!password_verify($current, $row['password'])) {
            json_error('Current password incorrect', 401);
        }

        $hashed = password_hash($new, PASSWORD_BCRYPT, ['cost' => 10]);
        $db->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([$hashed, $authUser['id']]);
        json_success('Password updated successfully');
        return true;
    }

    return false;
}
