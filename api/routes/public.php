<?php
/**
 * Public Routes — No authentication required
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/uuid.php';

function handlePublic(string $method, string $path, array $segments): bool {

    $db = getDB();

    // GET /api/team
    if ($method === 'GET' && $path === 'team') {
        $rows = $db->query('SELECT * FROM team ORDER BY sort_order ASC')->fetchAll();
        foreach ($rows as &$r) {
            $r['tags'] = $r['tags'] ? json_decode($r['tags'], true) : [];
            $r['pic'] = $r['pic_url'] ?? '';
        }
        json_response($rows);
        return true;
    }

    // GET /api/cofounder
    if ($method === 'GET' && $path === 'cofounder') {
        $row = $db->query('SELECT * FROM cofounder WHERE id = 1')->fetch();
        json_response($row ?: new \stdClass());
        return true;
    }

    // GET /api/events
    if ($method === 'GET' && $path === 'events') {
        $rows = $db->query('SELECT * FROM events ORDER BY year ASC, mon ASC, day ASC')->fetchAll();
        json_response($rows);
        return true;
    }

    // GET /api/events/{id}
    if ($method === 'GET' && count($segments) === 2 && $segments[0] === 'events') {
        $stmt = $db->prepare('SELECT * FROM events WHERE id = ?');
        $stmt->execute([$segments[1]]);
        $event = $stmt->fetch();
        if (!$event) json_error('Event not found', 404);

        $regs = $db->prepare('SELECT * FROM event_registrations WHERE event_id = ?');
        $regs->execute([$segments[1]]);
        $event['registrations'] = $regs->fetchAll();
        json_response($event);
        return true;
    }

    // POST /api/events/{id}/register
    if ($method === 'POST' && count($segments) === 3 && $segments[0] === 'events' && $segments[2] === 'register') {
        $body = get_json_body();
        $name = $body['name'] ?? '';
        $email = $body['email'] ?? '';
        if (!$name || !$email) json_error('Name and email required', 400);

        $stmt = $db->prepare('SELECT id FROM events WHERE id = ?');
        $stmt->execute([$segments[1]]);
        if (!$stmt->fetch()) json_error('Event not found', 404);

        $id = uuid4();
        $db->prepare('INSERT INTO event_registrations (id, event_id, name, email, phone, count, message) VALUES (?,?,?,?,?,?,?)')
           ->execute([$id, $segments[1], $name, $email, $body['phone'] ?? '', $body['count'] ?? '1', $body['message'] ?? '']);
        json_success('Registration confirmed!');
        return true;
    }

    // GET /api/gallery
    if ($method === 'GET' && $path === 'gallery') {
        json_response($db->query('SELECT * FROM gallery ORDER BY created_at DESC')->fetchAll());
        return true;
    }

    // GET /api/testimonials
    if ($method === 'GET' && $path === 'testimonials') {
        json_response($db->query('SELECT * FROM testimonials ORDER BY created_at DESC')->fetchAll());
        return true;
    }

    // GET /api/sponsors
    if ($method === 'GET' && $path === 'sponsors') {
        json_response($db->query('SELECT * FROM sponsors ORDER BY created_at ASC')->fetchAll());
        return true;
    }

    // GET /api/books
    if ($method === 'GET' && $path === 'books') {
        $q = $_GET['q'] ?? '';
        $cat = $_GET['category'] ?? '';
        $sql = 'SELECT * FROM books WHERE 1=1';
        $params = [];
        if ($q) { $sql .= ' AND (title LIKE ? OR author LIKE ?)'; $params[] = "%$q%"; $params[] = "%$q%"; }
        if ($cat) { $sql .= ' AND category = ?'; $params[] = $cat; }
        $sql .= ' ORDER BY created_at DESC';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        json_response($stmt->fetchAll());
        return true;
    }

    // GET /api/books/{id}
    if ($method === 'GET' && count($segments) === 2 && $segments[0] === 'books') {
        $stmt = $db->prepare('SELECT * FROM books WHERE id = ?');
        $stmt->execute([$segments[1]]);
        $book = $stmt->fetch();
        if (!$book) json_error('Book not found', 404);
        json_response($book);
        return true;
    }

    // GET /api/media
    if ($method === 'GET' && $path === 'media') {
        json_response($db->query('SELECT * FROM media_items ORDER BY created_at DESC')->fetchAll());
        return true;
    }

    // GET /api/courses
    if ($method === 'GET' && $path === 'courses') {
        json_response($db->query("SELECT * FROM courses WHERE status = 'published' ORDER BY created_at DESC")->fetchAll());
        return true;
    }

    // GET /api/settings
    if ($method === 'GET' && $path === 'settings') {
        $rows = $db->query('SELECT key_name, value FROM settings')->fetchAll();
        $settings = [];
        foreach ($rows as $r) { $settings[$r['key_name']] = $r['value']; }
        json_response($settings);
        return true;
    }

    // GET /api/verify/{tcmi_id}
    if ($method === 'GET' && count($segments) === 2 && $segments[0] === 'verify') {
        $id = strtoupper($segments[1]);
        $stmt = $db->prepare('SELECT name, role, position, tcmi_id FROM users WHERE UPPER(tcmi_id) = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if ($user) {
            json_response([
                'found'   => true,
                'name'    => $user['name'],
                'role'    => $user['position'] ?: $user['role'],
                'type'    => $user['role'] === 'faculty' ? 'Faculty Member' : 'Enrolled Student',
                'tcmi_id' => $user['tcmi_id'],
            ]);
        } else {
            json_response(['found' => false]);
        }
        return true;
    }

    // POST /api/applications
    if ($method === 'POST' && $path === 'applications') {
        $body = get_json_body();
        if (empty($body['full_name'])) json_error('Full name required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO applications (id, full_name, email, phone, country_birth, country_origin, nationality, personal_statement) VALUES (?,?,?,?,?,?,?,?)')
           ->execute([$id, $body['full_name'], $body['email'] ?? '', $body['phone'] ?? '', $body['country_birth'] ?? '', $body['country_origin'] ?? '', $body['nationality'] ?? '', $body['personal_statement'] ?? '']);
        json_success('Application submitted successfully!');
        return true;
    }

    // POST /api/mentee-registrations
    if ($method === 'POST' && $path === 'mentee-registrations') {
        $body = get_json_body();
        $id = uuid4();
        $db->prepare('INSERT INTO mentee_registrations (id, name, email, phone, message) VALUES (?,?,?,?,?)')
           ->execute([$id, $body['name'] ?? '', $body['email'] ?? '', $body['phone'] ?? '', $body['message'] ?? '']);
        json_success('Mentee registration received!');
        return true;
    }

    // POST /api/mentor-registrations
    if ($method === 'POST' && $path === 'mentor-registrations') {
        $body = get_json_body();
        $id = uuid4();
        $db->prepare('INSERT INTO mentor_registrations (id, name, email, phone, occupation, message) VALUES (?,?,?,?,?,?)')
           ->execute([$id, $body['name'] ?? '', $body['email'] ?? '', $body['phone'] ?? '', $body['occupation'] ?? '', $body['message'] ?? '']);
        json_success('Mentor registration received!');
        return true;
    }

    // POST /api/orders (public bookstore checkout)
    if ($method === 'POST' && $path === 'orders') {
        $body = get_json_body();
        if (empty($body['customer_name']) || empty($body['customer_email']) || empty($body['items'])) {
            json_error('Required fields missing', 400);
        }
        $id = 'ORD-' . strtoupper(base_convert(time(), 10, 36));
        $db->prepare('INSERT INTO bookstore_orders (id, customer_name, customer_email, items, total, payment_ref) VALUES (?,?,?,?,?,?)')
           ->execute([$id, $body['customer_name'], $body['customer_email'], json_encode($body['items']), floatval($body['total'] ?? 0), $body['payment_ref'] ?? '']);
        json_response(['id' => $id, 'message' => 'Order placed successfully. We will verify payment and confirm shortly.']);
        return true;
    }

    return false;
}
