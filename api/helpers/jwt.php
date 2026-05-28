<?php
/**
 * Minimal JWT encode/decode using HMAC-SHA256 (pure PHP)
 */

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Create a JWT token
 */
function jwt_encode(array $payload, string $secret): string {
    $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url_encode(json_encode($payload));
    $signature = base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    return "$header.$payload.$signature";
}

/**
 * Decode and verify a JWT token. Returns payload array or null on failure.
 */
function jwt_decode(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $signature] = $parts;

    // Verify signature
    $expected = base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($expected, $signature)) return null;

    $data = json_decode(base64url_decode($payload), true);
    if (!$data) return null;

    // Check expiry
    if (isset($data['exp']) && $data['exp'] < time()) return null;

    return $data;
}
