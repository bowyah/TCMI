<?php
/**
 * Admin/Faculty Routes — All CRUD management endpoints (JWT required)
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/uuid.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleAdmin(string $method, string $path, array $segments): bool {
    $db = getDB();

    // ─── TEAM ──────────────────────────────────────────────────────
    if ($method === 'POST' && $path === 'team') {
        $user = authenticate(); requireAdmin($user);
        $name = $_POST['name'] ?? ''; $role = $_POST['role'] ?? '';
        if (!$name || !$role) json_error('Name and role required', 400);
        $initials = strtoupper(substr($name, 0, 1) . substr(strstr($name, ' ') ?: '', 1, 1));
        $count = $db->query('SELECT COUNT(*) FROM team')->fetchColumn();
        $id = uuid4();
        $pic = handle_upload('pic');
        $db->prepare('INSERT INTO team (id,name,role,initials,whatsapp,facebook,bio,quote,tags,pic_url,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
           ->execute([$id, $name, $role, $initials, $_POST['whatsapp'] ?? '', $_POST['facebook'] ?? '', $_POST['bio'] ?? '', $_POST['quote'] ?? '', $_POST['tags'] ?? '[]', $pic ? $pic['url'] : null, $count]);
        $stmt = $db->prepare('SELECT * FROM team WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'PUT' && count($segments) === 2 && $segments[0] === 'team') {
        $user = authenticate(); requireAdmin($user);
        $stmt = $db->prepare('SELECT * FROM team WHERE id = ?'); $stmt->execute([$segments[1]]);
        $member = $stmt->fetch();
        if (!$member) json_error('Member not found', 404);
        // For PUT with file uploads, parse both $_POST and files
        $name = $_POST['name'] ?? $member['name'];
        $role = $_POST['role'] ?? $member['role'];
        $pic = handle_upload('pic');
        $db->prepare('UPDATE team SET name=?,role=?,whatsapp=?,facebook=?,bio=?,quote=?,tags=?,pic_url=COALESCE(?,pic_url) WHERE id=?')
           ->execute([$name, $role, $_POST['whatsapp'] ?? $member['whatsapp'], $_POST['facebook'] ?? $member['facebook'], $_POST['bio'] ?? $member['bio'], $_POST['quote'] ?? $member['quote'], $_POST['tags'] ?? $member['tags'], $pic ? $pic['url'] : null, $segments[1]]);
        $stmt = $db->prepare('SELECT * FROM team WHERE id = ?'); $stmt->execute([$segments[1]]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'team') {
        $user = authenticate(); requireAdmin($user);
        $db->prepare('DELETE FROM team WHERE id = ?')->execute([$segments[1]]);
        json_success('Team member removed');
        return true;
    }

    // ─── CO-FOUNDER ──────────────────────────────────────────────
    if ($method === 'PUT' && $path === 'cofounder') {
        $user = authenticate(); requireAdmin($user);
        $pic = handle_upload('pic');
        $current = $db->query('SELECT * FROM cofounder WHERE id = 1')->fetch();
        if ($current) {
            $db->prepare('UPDATE cofounder SET name=COALESCE(?,name),title=COALESCE(?,title),roles=COALESCE(?,roles),bio1=COALESCE(?,bio1),bio2=COALESCE(?,bio2),quote=COALESCE(?,quote),facebook=COALESCE(?,facebook),whatsapp=COALESCE(?,whatsapp),pic_url=COALESCE(?,pic_url) WHERE id=1')
               ->execute([$_POST['name'] ?? null, $_POST['title'] ?? null, $_POST['roles'] ?? null, $_POST['bio1'] ?? null, $_POST['bio2'] ?? null, $_POST['quote'] ?? null, $_POST['facebook'] ?? null, $_POST['whatsapp'] ?? null, $pic ? $pic['url'] : null]);
        } else {
            $db->prepare('INSERT INTO cofounder (id,name,title,roles,bio1,bio2,quote,facebook,whatsapp,pic_url) VALUES (1,?,?,?,?,?,?,?,?,?)')
               ->execute([$_POST['name'] ?? null, $_POST['title'] ?? null, $_POST['roles'] ?? null, $_POST['bio1'] ?? null, $_POST['bio2'] ?? null, $_POST['quote'] ?? null, $_POST['facebook'] ?? null, $_POST['whatsapp'] ?? null, $pic ? $pic['url'] : null]);
        }
        json_response($db->query('SELECT * FROM cofounder WHERE id = 1')->fetch());
        return true;
    }

    // ─── EVENTS ──────────────────────────────────────────────────
    if ($method === 'POST' && $path === 'events') {
        $user = authenticate(); requireAdmin($user);
        $body = get_json_body();
        if (empty($body['title'])) json_error('Title required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO events (id,title,day,mon,year,time,location,meta,type,description) VALUES (?,?,?,?,?,?,?,?,?,?)')
           ->execute([$id, $body['title'], $body['day'] ?? '', $body['mon'] ?? '', $body['year'] ?? '', $body['time'] ?? '', $body['location'] ?? '', $body['location'] ?? '', $body['type'] ?? 'free', $body['description'] ?? '']);
        $stmt = $db->prepare('SELECT * FROM events WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'PUT' && count($segments) === 2 && $segments[0] === 'events') {
        $user = authenticate(); requireAdmin($user);
        $body = get_json_body();
        $stmt = $db->prepare('SELECT * FROM events WHERE id = ?'); $stmt->execute([$segments[1]]);
        if (!$stmt->fetch()) json_error('Event not found', 404);
        $db->prepare('UPDATE events SET title=COALESCE(?,title),day=COALESCE(?,day),mon=COALESCE(?,mon),year=COALESCE(?,year),time=COALESCE(?,time),location=COALESCE(?,location),meta=COALESCE(?,meta),type=COALESCE(?,type),description=COALESCE(?,description) WHERE id=?')
           ->execute([$body['title'] ?? null, $body['day'] ?? null, $body['mon'] ?? null, $body['year'] ?? null, $body['time'] ?? null, $body['location'] ?? null, $body['location'] ?? null, $body['type'] ?? null, $body['description'] ?? null, $segments[1]]);
        $stmt2 = $db->prepare('SELECT * FROM events WHERE id = ?'); $stmt2->execute([$segments[1]]);
        json_response($stmt2->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'events') {
        $user = authenticate(); requireAdmin($user);
        $db->prepare('DELETE FROM events WHERE id = ?')->execute([$segments[1]]);
        json_success('Event deleted');
        return true;
    }

    if ($method === 'GET' && count($segments) === 3 && $segments[0] === 'events' && $segments[2] === 'registrations') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $stmt = $db->prepare('SELECT * FROM event_registrations WHERE event_id = ? ORDER BY created_at DESC');
        $stmt->execute([$segments[1]]);
        json_response($stmt->fetchAll());
        return true;
    }

    // ─── GALLERY ─────────────────────────────────────────────────
    if ($method === 'POST' && $path === 'gallery') {
        $user = authenticate(); requireAdmin($user);
        $pic = handle_upload('photo');
        if (!$pic) json_error('Photo required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO gallery (id,caption,file_path,file_url) VALUES (?,?,?,?)')
           ->execute([$id, $_POST['caption'] ?? '', $pic['path'], $pic['url']]);
        $stmt = $db->prepare('SELECT * FROM gallery WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'gallery') {
        $user = authenticate(); requireAdmin($user);
        $stmt = $db->prepare('SELECT file_path FROM gallery WHERE id = ?'); $stmt->execute([$segments[1]]);
        $photo = $stmt->fetch();
        if ($photo && $photo['file_path'] && file_exists($photo['file_path'])) @unlink($photo['file_path']);
        $db->prepare('DELETE FROM gallery WHERE id = ?')->execute([$segments[1]]);
        json_success('Photo removed');
        return true;
    }

    // ─── TESTIMONIALS ────────────────────────────────────────────
    if ($method === 'POST' && $path === 'testimonials') {
        $user = authenticate(); requireAdmin($user);
        $quote = $_POST['quote'] ?? ''; $name = $_POST['name'] ?? '';
        if (!$quote || !$name) json_error('Quote and name required', 400);
        $id = uuid4(); $pic = handle_upload('pic');
        $db->prepare('INSERT INTO testimonials (id,quote,name,role,pic_url) VALUES (?,?,?,?,?)')
           ->execute([$id, $quote, $name, $_POST['role'] ?? '', $pic ? $pic['url'] : null]);
        $stmt = $db->prepare('SELECT * FROM testimonials WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'testimonials') {
        $user = authenticate(); requireAdmin($user);
        $db->prepare('DELETE FROM testimonials WHERE id = ?')->execute([$segments[1]]);
        json_success('Testimonial removed');
        return true;
    }

    // ─── SPONSORS ────────────────────────────────────────────────
    if ($method === 'POST' && $path === 'sponsors') {
        $user = authenticate(); requireAdmin($user);
        if (empty($_POST['name'])) json_error('Name required', 400);
        $id = uuid4(); $logo = handle_upload('logo');
        $db->prepare('INSERT INTO sponsors (id,name,logo_url) VALUES (?,?,?)')
           ->execute([$id, $_POST['name'], $logo ? $logo['url'] : null]);
        $stmt = $db->prepare('SELECT * FROM sponsors WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'sponsors') {
        $user = authenticate(); requireAdmin($user);
        $db->prepare('DELETE FROM sponsors WHERE id = ?')->execute([$segments[1]]);
        json_success('Sponsor removed');
        return true;
    }

    // ─── BOOKS ───────────────────────────────────────────────────
    if ($method === 'POST' && $path === 'books') {
        $user = authenticate(); requireAdmin($user);
        $title = $_POST['title'] ?? ''; $author = $_POST['author'] ?? '';
        if (!$title || !$author) json_error('Title and author required', 400);
        $id = uuid4(); $img = handle_upload('img');
        $db->prepare('INSERT INTO books (id,title,author,description,price,category,img_url) VALUES (?,?,?,?,?,?,?)')
           ->execute([$id, $title, $author, $_POST['description'] ?? '', floatval($_POST['price'] ?? 0), $_POST['category'] ?? 'Book', $img ? $img['url'] : null]);
        $stmt = $db->prepare('SELECT * FROM books WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'PUT' && count($segments) === 2 && $segments[0] === 'books') {
        $user = authenticate(); requireAdmin($user);
        $stmt = $db->prepare('SELECT * FROM books WHERE id = ?'); $stmt->execute([$segments[1]]);
        if (!$stmt->fetch()) json_error('Book not found', 404);
        $img = handle_upload('img');
        $db->prepare('UPDATE books SET title=COALESCE(?,title),author=COALESCE(?,author),description=COALESCE(?,description),price=COALESCE(?,price),category=COALESCE(?,category),img_url=COALESCE(?,img_url) WHERE id=?')
           ->execute([$_POST['title'] ?? null, $_POST['author'] ?? null, $_POST['description'] ?? null, isset($_POST['price']) ? floatval($_POST['price']) : null, $_POST['category'] ?? null, $img ? $img['url'] : null, $segments[1]]);
        $stmt2 = $db->prepare('SELECT * FROM books WHERE id = ?'); $stmt2->execute([$segments[1]]);
        json_response($stmt2->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'books') {
        $user = authenticate(); requireAdmin($user);
        $db->prepare('DELETE FROM books WHERE id = ?')->execute([$segments[1]]);
        json_success('Book removed');
        return true;
    }

    // ─── MEDIA / PODCAST ─────────────────────────────────────────
    if ($method === 'POST' && $path === 'media') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        if (empty($body['title']) || empty($body['url'])) json_error('Title and URL required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO media_items (id,title,speaker,description,type,url,date) VALUES (?,?,?,?,?,?,?)')
           ->execute([$id, $body['title'], $body['speaker'] ?? '', $body['description'] ?? '', $body['type'] ?? 'youtube', $body['url'], $body['date'] ?? null]);
        $stmt = $db->prepare('SELECT * FROM media_items WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'media') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $db->prepare('DELETE FROM media_items WHERE id = ?')->execute([$segments[1]]);
        json_success('Media item removed');
        return true;
    }

    // ─── USERS ───────────────────────────────────────────────────
    if ($method === 'GET' && $path === 'users') {
        $user = authenticate(); requireAdmin($user);
        json_response($db->query('SELECT id,email,name,role,initials,phone,country,bio,pic_url,position,tcmi_id,track,mentor_email,gpa,status,created_at FROM users')->fetchAll());
        return true;
    }

    if ($method === 'POST' && $path === 'users') {
        $user = authenticate(); requireAdmin($user);
        $body = get_json_body();
        $email = strtolower(trim($body['email'] ?? ''));
        $pw = $body['password'] ?? '';
        $name = $body['name'] ?? '';
        $role = $body['role'] ?? '';
        if (!$email || !$pw || !$name || !$role) json_error('email, password, name, role required', 400);
        if (strlen($pw) < 6) json_error('Password must be at least 6 characters', 400);

        $exists = $db->prepare('SELECT id FROM users WHERE email = ?'); $exists->execute([$email]);
        if ($exists->fetch()) json_error('Email already registered', 409);

        $countStmt = $db->prepare('SELECT COUNT(*) FROM users WHERE role = ?'); $countStmt->execute([$role]);
        $count = $countStmt->fetchColumn();
        $prefix = $role === 'faculty' ? 'FAC' : ($role === 'student' ? 'STU' : 'ADM');
        $tcmi_id = 'TCMI-' . $prefix . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        $initials = strtoupper(substr($name, 0, 1) . substr(strstr($name, ' ') ?: '', 1, 1));
        $hashed = password_hash($pw, PASSWORD_BCRYPT, ['cost' => 10]);
        $id = uuid4();

        $db->prepare('INSERT INTO users (id,email,password,name,role,initials,tcmi_id,position,track) VALUES (?,?,?,?,?,?,?,?,?)')
           ->execute([$id, $email, $hashed, $name, $role, $initials, $tcmi_id, $body['position'] ?? '', $body['track'] ?? '']);

        $stmt = $db->prepare('SELECT id,email,name,role,initials,tcmi_id,position FROM users WHERE id = ?'); $stmt->execute([$id]);
        $newUser = $stmt->fetch();
        $newUser['temp_password'] = $pw;
        json_response($newUser);
        return true;
    }

    if ($method === 'PUT' && count($segments) === 2 && $segments[0] === 'users') {
        $user = authenticate(); requireAdmin($user);
        $body = get_json_body();
        $db->prepare('UPDATE users SET name=COALESCE(?,name),role=COALESCE(?,role),position=COALESCE(?,position),track=COALESCE(?,track),status=COALESCE(?,status) WHERE id=?')
           ->execute([$body['name'] ?? null, $body['role'] ?? null, $body['position'] ?? null, $body['track'] ?? null, $body['status'] ?? null, $segments[1]]);
        json_success('User updated');
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'users') {
        $user = authenticate(); requireAdmin($user);
        $stmt = $db->prepare('SELECT * FROM users WHERE id = ?'); $stmt->execute([$segments[1]]);
        $target = $stmt->fetch();
        if (!$target) json_error('User not found', 404);
        if ($target['email'] === $user['email']) json_error('Cannot delete your own account', 400);
        $db->prepare('DELETE FROM users WHERE id = ?')->execute([$segments[1]]);
        json_success('User deleted');
        return true;
    }

    // ─── COURSES ─────────────────────────────────────────────────
    if ($method === 'GET' && $path === 'courses') {
        // Authenticated version returns ALL courses (not just published)
        $user = authenticate();
        json_response($db->query('SELECT * FROM courses ORDER BY created_at DESC')->fetchAll());
        return true;
    }

    if ($method === 'POST' && $path === 'courses') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        if (empty($body['title'])) json_error('Title required', 400);
        $id = uuid4();
        $status = $user['role'] === 'admin' ? ($body['status'] ?? 'published') : 'pending';
        $db->prepare('INSERT INTO courses (id,title,track,level,modules,price,status,instructor_email,color,description) VALUES (?,?,?,?,?,?,?,?,?,?)')
           ->execute([$id, $body['title'], $body['track'] ?? '', $body['level'] ?? 'Beginner', intval($body['modules'] ?? 0), $body['price'] ?? 'Free', $status, $user['email'], $body['color'] ?? '#0B1B3A', $body['description'] ?? '']);
        $stmt = $db->prepare('SELECT * FROM courses WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'PUT' && count($segments) === 2 && $segments[0] === 'courses') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        $stmt = $db->prepare('SELECT * FROM courses WHERE id = ?'); $stmt->execute([$segments[1]]);
        $course = $stmt->fetch();
        if (!$course) json_error('Course not found', 404);
        if ($user['role'] === 'faculty' && $course['instructor_email'] !== $user['email'])
            json_error('You can only edit your own courses', 403);
        $db->prepare('UPDATE courses SET title=COALESCE(?,title),track=COALESCE(?,track),level=COALESCE(?,level),modules=COALESCE(?,modules),price=COALESCE(?,price),status=COALESCE(?,status),color=COALESCE(?,color),description=COALESCE(?,description) WHERE id=?')
           ->execute([$body['title'] ?? null, $body['track'] ?? null, $body['level'] ?? null, isset($body['modules']) ? intval($body['modules']) : null, $body['price'] ?? null, $body['status'] ?? null, $body['color'] ?? null, $body['description'] ?? null, $segments[1]]);
        $stmt2 = $db->prepare('SELECT * FROM courses WHERE id = ?'); $stmt2->execute([$segments[1]]);
        json_response($stmt2->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'courses') {
        $user = authenticate(); requireAdmin($user);
        $db->prepare('DELETE FROM courses WHERE id = ?')->execute([$segments[1]]);
        json_success('Course deleted');
        return true;
    }

    // ─── LESSONS ─────────────────────────────────────────────────
    if ($method === 'GET' && $path === 'lessons') {
        $user = authenticate();
        $cid = $_GET['course_id'] ?? '';
        $sql = 'SELECT * FROM lessons WHERE 1=1';
        $params = [];
        if ($cid) { $sql .= ' AND course_id = ?'; $params[] = $cid; }
        $sql .= ' ORDER BY created_at DESC';
        $stmt = $db->prepare($sql); $stmt->execute($params);
        $rows = $stmt->fetchAll();
        // Remove file_path from response
        foreach ($rows as &$r) { unset($r['file_path']); }
        json_response($rows);
        return true;
    }

    if ($method === 'POST' && $path === 'lessons') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $cid = $_POST['course_id'] ?? ''; $title = $_POST['title'] ?? '';
        if (!$cid || !$title) json_error('course_id and title required', 400);
        $id = uuid4(); $file = handle_upload('pdf');
        $db->prepare('INSERT INTO lessons (id,course_id,title,description,type,file_path,file_url,uploaded_by) VALUES (?,?,?,?,?,?,?,?)')
           ->execute([$id, $cid, $title, $_POST['description'] ?? '', $_POST['type'] ?? 'PDF', $file ? $file['path'] : null, $file ? $file['url'] : null, $user['email']]);
        $stmt = $db->prepare('SELECT * FROM lessons WHERE id = ?'); $stmt->execute([$id]);
        $lesson = $stmt->fetch(); unset($lesson['file_path']);
        json_response($lesson);
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'lessons') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $stmt = $db->prepare('SELECT file_path FROM lessons WHERE id = ?'); $stmt->execute([$segments[1]]);
        $lesson = $stmt->fetch();
        if ($lesson && $lesson['file_path'] && file_exists($lesson['file_path'])) @unlink($lesson['file_path']);
        $db->prepare('DELETE FROM lessons WHERE id = ?')->execute([$segments[1]]);
        json_success('Lesson deleted');
        return true;
    }

    // ─── BOOKSTORE ORDERS ────────────────────────────────────────
    if ($method === 'GET' && $path === 'orders') {
        $user = authenticate(); requireAdmin($user);
        $rows = $db->query('SELECT * FROM bookstore_orders ORDER BY created_at DESC')->fetchAll();
        foreach ($rows as &$r) { $r['items'] = $r['items'] ? json_decode($r['items'], true) : []; }
        json_response($rows);
        return true;
    }

    if ($method === 'PUT' && count($segments) === 3 && $segments[0] === 'orders' && $segments[2] === 'status') {
        $user = authenticate(); requireAdmin($user);
        $body = get_json_body();
        $status = $body['status'] ?? '';
        if (!in_array($status, ['Pending', 'Confirmed', 'Rejected'])) json_error('Invalid status', 400);
        $db->prepare('UPDATE bookstore_orders SET status = ? WHERE id = ?')->execute([$status, $segments[1]]);
        json_success("Order $status");
        return true;
    }

    // ─── ANNOUNCEMENTS ───────────────────────────────────────────
    if ($method === 'GET' && $path === 'announcements') {
        $user = authenticate();
        $anns = $db->query('SELECT * FROM announcements ORDER BY created_at DESC')->fetchAll();
        foreach ($anns as &$a) {
            $stmt = $db->prepare('SELECT * FROM announcement_replies WHERE announcement_id = ? ORDER BY created_at ASC');
            $stmt->execute([$a['id']]);
            $a['replies'] = $stmt->fetchAll();
        }
        json_response($anns);
        return true;
    }

    if ($method === 'POST' && $path === 'announcements') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        if (empty($body['title']) || empty($body['body'])) json_error('Title and body required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO announcements (id,title,body,author_name,author_email) VALUES (?,?,?,?,?)')
           ->execute([$id, $body['title'], $body['body'], $user['name'], $user['email']]);
        $stmt = $db->prepare('SELECT * FROM announcements WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'POST' && count($segments) === 3 && $segments[0] === 'announcements' && $segments[2] === 'replies') {
        $user = authenticate();
        $body = get_json_body();
        if (empty($body['body'])) json_error('Reply text required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO announcement_replies (id,announcement_id,author_name,author_email,body) VALUES (?,?,?,?,?)')
           ->execute([$id, $segments[1], $user['name'], $user['email'], $body['body']]);
        $stmt = $db->prepare('SELECT * FROM announcement_replies WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'announcements') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $db->prepare('DELETE FROM announcements WHERE id = ?')->execute([$segments[1]]);
        json_success('Announcement deleted');
        return true;
    }

    // ─── MESSAGES ────────────────────────────────────────────────
    if ($method === 'GET' && $path === 'messages/contacts') {
        $user = authenticate();
        $stmt = $db->prepare('SELECT id,email,name,role,initials,position,pic_url FROM users WHERE email != ?');
        $stmt->execute([$user['email']]);
        json_response($stmt->fetchAll());
        return true;
    }

    if ($method === 'GET' && $path === 'messages') {
        $user = authenticate();
        $with = $_GET['with'] ?? '';
        if (!$with) json_error('with parameter required', 400);
        $stmt = $db->prepare('SELECT * FROM messages WHERE (from_email=? AND to_email=?) OR (from_email=? AND to_email=?) ORDER BY created_at ASC');
        $stmt->execute([$user['email'], $with, $with, $user['email']]);
        $msgs = $stmt->fetchAll();
        $db->prepare('UPDATE messages SET is_read=1 WHERE to_email=? AND from_email=?')
           ->execute([$user['email'], $with]);
        json_response($msgs);
        return true;
    }

    if ($method === 'POST' && $path === 'messages') {
        $user = authenticate();
        $body = get_json_body();
        if (empty($body['to_email']) || empty($body['body'])) json_error('to_email and body required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO messages (id,from_email,to_email,body) VALUES (?,?,?,?)')
           ->execute([$id, $user['email'], $body['to_email'], $body['body']]);
        $stmt = $db->prepare('SELECT * FROM messages WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'GET' && $path === 'messages/unread-count') {
        $user = authenticate();
        $stmt = $db->prepare('SELECT COUNT(*) FROM messages WHERE to_email=? AND is_read=0');
        $stmt->execute([$user['email']]);
        json_response(['count' => (int)$stmt->fetchColumn()]);
        return true;
    }

    // ─── GRADES ──────────────────────────────────────────────────
    if ($method === 'GET' && $path === 'grades') {
        $user = authenticate();
        $sql = 'SELECT g.*, c.title as course_title FROM grades g LEFT JOIN courses c ON g.course_id = c.id WHERE 1=1';
        $params = [];
        $email = $user['role'] === 'student' ? $user['email'] : ($_GET['student_email'] ?? null);
        if ($email) { $sql .= ' AND g.student_email = ?'; $params[] = $email; }
        $cid = $_GET['course_id'] ?? '';
        if ($cid) { $sql .= ' AND g.course_id = ?'; $params[] = $cid; }
        $stmt = $db->prepare($sql); $stmt->execute($params);
        json_response($stmt->fetchAll());
        return true;
    }

    if ($method === 'POST' && $path === 'grades') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        if (empty($body['student_email']) || empty($body['course_id'])) json_error('student_email and course_id required', 400);
        $stmt = $db->prepare('SELECT * FROM grades WHERE student_email=? AND course_id=?');
        $stmt->execute([$body['student_email'], $body['course_id']]);
        $existing = $stmt->fetch();
        if ($existing) {
            $db->prepare('UPDATE grades SET assignment_grade=COALESCE(?,assignment_grade),midterm_grade=COALESCE(?,midterm_grade),final_grade=COALESCE(?,final_grade),gpa=COALESCE(?,gpa) WHERE id=?')
               ->execute([$body['assignment_grade'] ?? null, $body['midterm_grade'] ?? null, $body['final_grade'] ?? null, $body['gpa'] ?? null, $existing['id']]);
            $stmt2 = $db->prepare('SELECT * FROM grades WHERE id = ?'); $stmt2->execute([$existing['id']]);
            json_response($stmt2->fetch());
        } else {
            $id = uuid4();
            $db->prepare('INSERT INTO grades (id,student_email,course_id,assignment_grade,midterm_grade,final_grade,gpa) VALUES (?,?,?,?,?,?,?)')
               ->execute([$id, $body['student_email'], $body['course_id'], $body['assignment_grade'] ?? null, $body['midterm_grade'] ?? null, $body['final_grade'] ?? null, $body['gpa'] ?? null]);
            $stmt2 = $db->prepare('SELECT * FROM grades WHERE id = ?'); $stmt2->execute([$id]);
            json_response($stmt2->fetch());
        }
        return true;
    }

    // ─── EXAMS ───────────────────────────────────────────────────
    if ($method === 'GET' && $path === 'exams') {
        $user = authenticate();
        json_response($db->query('SELECT * FROM exams ORDER BY start_time DESC')->fetchAll());
        return true;
    }

    if ($method === 'POST' && $path === 'exams') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        if (empty($body['title']) || empty($body['start_time'])) json_error('title and start_time required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO exams (id,course_id,title,start_time,duration_min,created_by) VALUES (?,?,?,?,?,?)')
           ->execute([$id, $body['course_id'] ?? '', $body['title'], $body['start_time'], intval($body['duration_min'] ?? 60), $user['email']]);
        $stmt = $db->prepare('SELECT * FROM exams WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'POST' && count($segments) === 3 && $segments[0] === 'exams' && $segments[2] === 'grant') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        $id = uuid4();
        $db->prepare('INSERT INTO exam_grants (id,exam_id,student_email,granted_by,expires_at) VALUES (?,?,?,?,?)')
           ->execute([$id, $segments[1], $body['student_email'] ?? '', $user['email'], $body['expires_at'] ?? null]);
        json_success('Access granted');
        return true;
    }

    // ─── ASSIGNMENTS ─────────────────────────────────────────────
    if ($method === 'GET' && $path === 'assignments') {
        $user = authenticate();
        $cid = $_GET['course_id'] ?? '';
        $sql = 'SELECT * FROM assignments WHERE 1=1';
        $params = [];
        if ($cid) { $sql .= ' AND course_id = ?'; $params[] = $cid; }
        $sql .= ' ORDER BY due_date ASC';
        $stmt = $db->prepare($sql); $stmt->execute($params);
        json_response($stmt->fetchAll());
        return true;
    }

    if ($method === 'POST' && $path === 'assignments') {
        $user = authenticate(); requireAdminOrFaculty($user);
        $body = get_json_body();
        if (empty($body['title'])) json_error('Title required', 400);
        $id = uuid4();
        $db->prepare('INSERT INTO assignments (id,course_id,title,description,due_date,created_by) VALUES (?,?,?,?,?,?)')
           ->execute([$id, $body['course_id'] ?? '', $body['title'], $body['description'] ?? '', $body['due_date'] ?? '', $user['email']]);
        $stmt = $db->prepare('SELECT * FROM assignments WHERE id = ?'); $stmt->execute([$id]);
        json_response($stmt->fetch());
        return true;
    }

    if ($method === 'POST' && count($segments) === 3 && $segments[0] === 'assignments' && $segments[2] === 'submit') {
        $user = authenticate();
        $body = get_json_body();
        $id = uuid4();
        $db->prepare('INSERT INTO submissions (id,assignment_id,student_email,content) VALUES (?,?,?,?)')
           ->execute([$id, $segments[1], $user['email'], $body['content'] ?? '']);
        json_success('Assignment submitted');
        return true;
    }

    // ─── SETTINGS ────────────────────────────────────────────────
    if ($method === 'GET' && $path === 'settings') {
        // Authenticated admin version
        $user = authenticate(); requireAdmin($user);
        $rows = $db->query('SELECT key_name, value FROM settings')->fetchAll();
        $s = [];
        foreach ($rows as $r) { $s[$r['key_name']] = $r['value']; }
        json_response($s);
        return true;
    }

    if ($method === 'PUT' && $path === 'settings') {
        $user = authenticate(); requireAdmin($user);
        $body = get_json_body();
        $stmt = $db->prepare('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)');
        foreach ($body as $k => $v) { $stmt->execute([$k, $v]); }
        json_success('Settings saved');
        return true;
    }

    // ─── APPLICATIONS / REGISTRATIONS (admin view) ───────────────
    if ($method === 'GET' && $path === 'applications') {
        $user = authenticate(); requireAdmin($user);
        json_response($db->query('SELECT * FROM applications ORDER BY created_at DESC')->fetchAll());
        return true;
    }

    if ($method === 'GET' && $path === 'mentee-registrations') {
        $user = authenticate(); requireAdmin($user);
        json_response($db->query('SELECT * FROM mentee_registrations ORDER BY created_at DESC')->fetchAll());
        return true;
    }

    if ($method === 'GET' && $path === 'mentor-registrations') {
        $user = authenticate(); requireAdmin($user);
        json_response($db->query('SELECT * FROM mentor_registrations ORDER BY created_at DESC')->fetchAll());
        return true;
    }

    return false;
}
