<?php
/**
 * TCMI Database Initialization — Schema + Seed Data
 *
 * USAGE: Visit http://localhost/api/db/init.php in browser
 * WARNING: Delete this file after first run in production!
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/uuid.php';

echo "<h2>TCMI Database Initializer</h2><pre>\n";

try {
    $db = getDB();
    echo "✅ Connected to database " . DB_NAME . "\n\n";

    // ── Schema ────────────────────────────────────────────────────
    $schema = "
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin','faculty','student') NOT NULL,
        initials VARCHAR(5) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        country VARCHAR(100) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        pic_url VARCHAR(500) DEFAULT NULL,
        position VARCHAR(255) DEFAULT NULL,
        tcmi_id VARCHAR(50) DEFAULT NULL,
        track VARCHAR(100) DEFAULT NULL,
        mentor_email VARCHAR(255) DEFAULT NULL,
        gpa DECIMAL(3,2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_tcmi_id (tcmi_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS team (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        initials VARCHAR(5) DEFAULT NULL,
        pic_url TEXT DEFAULT NULL,
        whatsapp VARCHAR(50) DEFAULT NULL,
        facebook VARCHAR(500) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        quote TEXT DEFAULT NULL,
        tags JSON DEFAULT NULL,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS cofounder (
        id INT NOT NULL DEFAULT 1 PRIMARY KEY,
        name VARCHAR(255) DEFAULT NULL,
        title VARCHAR(255) DEFAULT NULL,
        roles VARCHAR(255) DEFAULT NULL,
        bio1 TEXT DEFAULT NULL,
        bio2 TEXT DEFAULT NULL,
        quote TEXT DEFAULT NULL,
        facebook VARCHAR(500) DEFAULT NULL,
        whatsapp VARCHAR(50) DEFAULT NULL,
        pic_url TEXT DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        day VARCHAR(10) DEFAULT NULL,
        mon VARCHAR(10) DEFAULT NULL,
        year VARCHAR(10) DEFAULT NULL,
        time VARCHAR(100) DEFAULT NULL,
        location VARCHAR(500) DEFAULT NULL,
        meta VARCHAR(500) DEFAULT NULL,
        type ENUM('free','paid','online') DEFAULT 'free',
        description TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS event_registrations (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        event_id VARCHAR(36) DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        count VARCHAR(10) DEFAULT '1',
        message TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS gallery (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        caption VARCHAR(255) DEFAULT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        quote TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) DEFAULT NULL,
        pic_url TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS sponsors (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        price DECIMAL(10,2) DEFAULT 0.00,
        category VARCHAR(100) DEFAULT 'Book',
        img_url TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS bookstore_orders (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        customer_name VARCHAR(255) DEFAULT NULL,
        customer_email VARCHAR(255) DEFAULT NULL,
        items JSON DEFAULT NULL,
        total DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('Pending','Confirmed','Rejected') DEFAULT 'Pending',
        payment_ref VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS bookstore_accounts (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS media_items (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        speaker VARCHAR(255) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        type VARCHAR(50) DEFAULT 'youtube',
        url VARCHAR(500) NOT NULL,
        date VARCHAR(100) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        track VARCHAR(100) DEFAULT NULL,
        level VARCHAR(50) DEFAULT 'Beginner',
        modules INT DEFAULT 0,
        price VARCHAR(50) DEFAULT 'Free',
        status VARCHAR(50) DEFAULT 'published',
        instructor_email VARCHAR(255) DEFAULT NULL,
        color VARCHAR(20) DEFAULT '#0B1B3A',
        description TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        course_id VARCHAR(36) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        type VARCHAR(50) DEFAULT 'PDF',
        file_path VARCHAR(500) DEFAULT NULL,
        file_url VARCHAR(500) DEFAULT NULL,
        uploaded_by VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        course_id VARCHAR(36) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        due_date VARCHAR(50) DEFAULT NULL,
        created_by VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        assignment_id VARCHAR(36) DEFAULT NULL,
        student_email VARCHAR(255) DEFAULT NULL,
        content TEXT DEFAULT NULL,
        file_url VARCHAR(500) DEFAULT NULL,
        grade VARCHAR(10) DEFAULT NULL,
        feedback TEXT DEFAULT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        course_id VARCHAR(36) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        start_time VARCHAR(50) NOT NULL,
        duration_min INT DEFAULT 60,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_by VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS exam_grants (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        exam_id VARCHAR(36) DEFAULT NULL,
        student_email VARCHAR(255) NOT NULL,
        granted_by VARCHAR(255) DEFAULT NULL,
        expires_at VARCHAR(50) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS grades (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        student_email VARCHAR(255) DEFAULT NULL,
        course_id VARCHAR(36) DEFAULT NULL,
        assignment_grade DECIMAL(5,2) DEFAULT NULL,
        midterm_grade DECIMAL(5,2) DEFAULT NULL,
        final_grade DECIMAL(5,2) DEFAULT NULL,
        gpa DECIMAL(3,2) DEFAULT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        author_name VARCHAR(255) DEFAULT NULL,
        author_email VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS announcement_replies (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        announcement_id VARCHAR(36) DEFAULT NULL,
        author_name VARCHAR(255) DEFAULT NULL,
        author_email VARCHAR(255) DEFAULT NULL,
        body TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        from_email VARCHAR(255) NOT NULL,
        to_email VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        country_birth VARCHAR(100) DEFAULT NULL,
        country_origin VARCHAR(100) DEFAULT NULL,
        nationality VARCHAR(100) DEFAULT NULL,
        personal_statement TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS mentee_registrations (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        message TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS mentor_registrations (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        occupation VARCHAR(255) DEFAULT NULL,
        message TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(100) NOT NULL PRIMARY KEY,
        value TEXT DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    // Execute each CREATE TABLE statement
    foreach (explode(';', $schema) as $stmt) {
        $stmt = trim($stmt);
        if ($stmt) { $db->exec($stmt); }
    }

    // Ensure existing installations have the required media columns.
    if ($db->query("SHOW COLUMNS FROM media_items LIKE 'type'")->rowCount() === 0) {
        $db->exec("ALTER TABLE media_items ADD COLUMN type VARCHAR(50) DEFAULT 'youtube' AFTER description");
    }
    if ($db->query("SHOW COLUMNS FROM media_items LIKE 'date'")->rowCount() === 0) {
        $db->exec("ALTER TABLE media_items ADD COLUMN date VARCHAR(100) DEFAULT NULL AFTER url");
    }

    echo "✅ All 22 tables created (or already exist)\n\n";

    // ── Seed data (only if tables are empty) ──────────────────────

    // Admin user
    $check = $db->prepare('SELECT id FROM users WHERE email = ?');
    $check->execute([SEED_ADMIN_EMAIL]);
    if (!$check->fetch()) {
        $db->prepare('INSERT INTO users (id,email,password,name,role,initials,tcmi_id) VALUES (?,?,?,?,?,?,?)')
           ->execute([uuid4(), SEED_ADMIN_EMAIL, password_hash(SEED_ADMIN_PASSWORD, PASSWORD_BCRYPT), SEED_ADMIN_NAME, 'admin', 'AD', 'TCMI-ADM-0001']);
        echo "✅ Admin user created: " . SEED_ADMIN_EMAIL . "\n";
    } else {
        echo "ℹ️ Admin user already exists\n";
    }

    // Faculty
    $faculty_seeds = [
        ['pastor@tcmi.org', 'faculty123', 'Pastor David Osei', 'Founder & Director', 'DO', 'TCMI-FAC-0001'],
        ['faculty@tcmi.org', 'faculty123', 'Grace Mensah', 'Programme Coordinator', 'GM', 'TCMI-FAC-0002'],
        ['james@tcmi.org', 'faculty123', 'Elder James Boateng', 'Mentor Lead', 'JB', 'TCMI-FAC-0003'],
        ['rachel@tcmi.org', 'faculty123', 'Sister Rachel Adu', 'Youth Outreach Lead', 'RA', 'TCMI-FAC-0004'],
    ];
    foreach ($faculty_seeds as $f) {
        $check->execute([$f[0]]);
        if (!$check->fetch()) {
            $db->prepare('INSERT INTO users (id,email,password,name,role,initials,tcmi_id,position,country) VALUES (?,?,?,?,?,?,?,?,?)')
               ->execute([uuid4(), $f[0], password_hash($f[1], PASSWORD_BCRYPT), $f[2], 'faculty', $f[4], $f[5], $f[3], 'Ghana']);
            echo "✅ Faculty: {$f[2]}\n";
        }
    }

    // Students
    $student_seeds = [
        ['student@tcmi.org', 'student123', 'Ama Asante', 'AA', 'Youth Track', 'pastor@tcmi.org', 3.72, 'STU001'],
        ['kwame@tcmi.org', 'student123', 'Kwame Darko', 'KD', 'Mentor Track', 'james@tcmi.org', 3.45, 'STU002'],
        ['tobenna@tcmi.org', 'student123', 'Tobenna Okeke', 'TO', 'Youth Track', 'rachel@tcmi.org', 2.90, 'STU003'],
        ['ruth@tcmi.org', 'student123', 'Ruth Owusu', 'RO', 'Leadership', 'james@tcmi.org', 3.80, 'STU004'],
    ];
    foreach ($student_seeds as $s) {
        $check->execute([$s[0]]);
        if (!$check->fetch()) {
            $id = 'TCMI-STU-' . str_pad(substr($s[7], 3), 4, '0', STR_PAD_LEFT);
            $db->prepare('INSERT INTO users (id,email,password,name,role,initials,tcmi_id,track,mentor_email,gpa,country) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
               ->execute([uuid4(), $s[0], password_hash($s[1], PASSWORD_BCRYPT), $s[2], 'student', $s[3], $id, $s[4], $s[5], $s[6], 'Ghana']);
            echo "✅ Student: {$s[2]}\n";
        }
    }

    // Team members
    if ($db->query('SELECT COUNT(*) FROM team')->fetchColumn() == 0) {
        $team = [
            ['Pastor David Osei', 'Founder & Director', 'DO', '61491319153', 'https://www.facebook.com/share/1D6etEV5e1/', 'api/uploads/teams/Pastor_David_Osei.jfif', 'Pst. Yormie Page is the visionary Founder and President of The Cornerstone Initiative. Driven by a deep passion for youth transformation and the Gospel of Jesus Christ, he established TCMI to raise up a generation rooted in faith, purpose, and godly character.', 'We are not just building programmes — we are building people. And people built on the Cornerstone of Christ will stand through any storm.', ['Pastor','Founder','Mentor','Leader']],
            ['Mrs. Anna K. Page', 'Co-Founder', 'AP', '61491319154', 'https://www.facebook.com/share/1D6etEV5e1/', 'api/uploads/teams/Mrs_Anna_K_Page.jfif', 'Mrs. Anna K. Page is the Co-Founder of The Cornerstone Initiative and a passionate advocate for youth, family, and community transformation. As a devoted mother and trained counsellor, she brings compassion and wisdom to everything TCMI does.', 'Every young person needs someone in their corner who believes in them unconditionally — that is what we are here to be.', ['Co-Founder','Counsellor','Mother','Community Leader']],
            ['Grace Mensah', 'Programme Coordinator', 'GM', null, null, null, 'Grace Mensah serves as the Programme Coordinator for TCMI, overseeing the planning and execution of all mentorship programmes and events. Her organisational skills and heart for people make her an invaluable part of the team.', 'Every detail matters when we are serving God’s people.', ['Coordinator','Administrator','Mentor']],
            ['Elder James Boateng', 'Mentor Lead', 'JB', null, null, null, 'Elder James Boateng leads the mentorship training division at TCMI, equipping mentors with practical tools and biblical principles to effectively disciple the next generation. His decades of pastoral experience bring depth and wisdom to the programme.', 'A mentor is simply someone who walks ahead and refuses to leave you behind.', ['Elder','Trainer','Mentor','Pastor']],
            ['Sister Rachel Adu', 'Youth Outreach Lead', 'RA', null, null, null, 'Sister Rachel Adu heads the youth outreach arm of TCMI, connecting with young people in churches, schools, and communities. Her energy, creativity, and genuine love for youth make her a natural bridge between TCMI and the next generation.', 'If we reach them where they are, we can walk them to where God wants them to be.', ['Outreach','Youth','Evangelist']],
            ['Elijah N. Bowyah Jr', 'Head of Tech & Media', 'EB', '18572868405', 'https://www.facebook.com/liberiarising231', 'api/uploads/teams/Elijah_N_Bowyah_Jr.jfif', 'Elijah N. Bowyah Jr serves as the Head of Technology and Media at TCMI, overseeing the digital infrastructure, platform development, and media strategy of the organisation. His technical expertise and creative vision drive TCMI’s digital presence and online reach.', 'Technology is just a tool — the real power is the message it carries.', ['Tech','Media','Developer','Designer']],
        ];
        $i = 0;
        foreach ($team as $t) {
            $db->prepare('INSERT INTO team (id,name,role,initials,whatsapp,facebook,sort_order,pic_url,bio,quote,tags) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
               ->execute([uuid4(), $t[0], $t[1], $t[2], $t[3], $t[4], $i++, $t[5], $t[6], $t[7], json_encode($t[8])]);
        }
        echo "✅ Team members seeded ({$i})\n";
    }

    // Gallery
    if ($db->query('SELECT COUNT(*) FROM gallery')->fetchColumn() == 0) {
        $gallery = [
            ['Pastor David Osei speaking at TCMI', 'api/uploads/gallery/Pastor_David_Osei.jfif', 'api/uploads/gallery/Pastor_David_Osei.jfif'],
            ['Mrs. Anna K. Page with the TCMI family', 'api/uploads/gallery/Mrs_Anna_K_Page.jfif', 'api/uploads/gallery/Mrs_Anna_K_Page.jfif'],
            ['Elijah N. Bowyah Jr leading media & tech', 'api/uploads/gallery/Elijah_N_Bowyah_Jr.jfif', 'api/uploads/gallery/Elijah_N_Bowyah_Jr.jfif'],
        ];
        foreach ($gallery as $g) {
            $db->prepare('INSERT INTO gallery (id,caption,file_path,file_url) VALUES (?,?,?,?)')
               ->execute([uuid4(), $g[0], $g[1], $g[2]]);
        }
        echo "✅ Gallery seeded (3)\n";
    }

    // Co-founder
    if ($db->query('SELECT COUNT(*) FROM cofounder')->fetchColumn() == 0) {
        $db->exec("INSERT INTO cofounder (id,name,title,roles,bio1,bio2,quote,facebook,whatsapp) VALUES (1,'Mrs. Anna K. Page','Co-Founder — The Cornerstone Initiative','Mother · Counsellor · Community Builder','Mrs. Anna K. Page is the Co-Founder of The Cornerstone Initiative and a passionate advocate for youth, family, and community transformation.','Her calling is to walk alongside young people and families — offering counsel, encouragement, and the kind of nurturing support that reflects the love of Christ.','Every young person needs someone in their corner who believes in them unconditionally — that is what we are here to be.','https://www.facebook.com/share/1D6etEV5e1/','61491319154')");
        echo "✅ Co-founder seeded\n";
    }

    // Events
    if ($db->query('SELECT COUNT(*) FROM events')->fetchColumn() == 0) {
        $events = [
            ['ev1','14','Jun','2026','Youth Summit 2026','9:00 AM','Grace Community Church, Brisbane','free','A powerful gathering of young people for worship, teaching, and fellowship.'],
            ['ev2','28','Jun','2026','Mentor Training Day','10:00 AM – 3:00 PM','The Cornerstone Centre','paid','Mandatory orientation and training for all current and prospective TCMI mentors.'],
            ['ev3','19','Jul','2026','Night of Worship','6:00 PM','Calvary Chapel, Sydney','free','An evening of Spirit-filled worship and prayer open to all.'],
            ['ev4','02','Aug','2026','Young Leaders Weekend','Fri – Sun','Riverside Retreat Centre','paid','A transformative leadership retreat for young believers aged 18–25.'],
        ];
        foreach ($events as $e) {
            $db->prepare('INSERT INTO events (id,day,mon,year,title,time,location,meta,type,description) VALUES (?,?,?,?,?,?,?,?,?,?)')
               ->execute([$e[0], $e[1], $e[2], $e[3], $e[4], $e[5], $e[6], $e[6], $e[7], $e[8]]);
        }
        echo "✅ Events seeded (4)\n";
    }

    // Courses
    if ($db->query('SELECT COUNT(*) FROM courses')->fetchColumn() == 0) {
        $courses = [
            ['c1', 'Foundations of Faith', 'Youth Track', 'Beginner', 8, 'Free', '#0B1B3A', 'pastor@tcmi.org', 'Explore the fundamentals of Christian faith.'],
            ['c2', 'Biblical Leadership', 'Mentor Track', 'Intermediate', 6, 'Free', '#1a3a5c', 'james@tcmi.org', 'Develop servant-leadership skills through Scripture.'],
            ['c3', 'Counselling Basics', 'Youth Track', 'Beginner', 4, 'Free', '#2E7D32', 'faculty@tcmi.org', 'Introduction to pastoral counselling and active listening.'],
        ];
        foreach ($courses as $c) {
            $db->prepare('INSERT INTO courses (id,title,track,level,modules,price,color,instructor_email,description) VALUES (?,?,?,?,?,?,?,?,?)')
               ->execute([$c[0], $c[1], $c[2], $c[3], $c[4], $c[5], $c[6], $c[7], $c[8]]);
        }
        echo "✅ Courses seeded (3)\n";
    }

    // Testimonials
    if ($db->query('SELECT COUNT(*) FROM testimonials')->fetchColumn() == 0) {
        $testimonials = [
            ['TCMI has been an extraordinary journey of faith, purpose, and growth. Building this initiative has shown me that when God places a vision in your heart and you commit to it with everything, He brings the right people and the right moments to make it a reality. To every young person reading this — you are destined for more.', 'Pst. Yormie Page', 'Founder & Director, TCMI', 'api/uploads/testimonials/Pastor_David_Osei.jfif'],
            ['Watching young people discover who God has called them to be through TCMI fills my heart with unspeakable joy. This is more than a programme — it is a family. Every young life transformed is a testimony of what happens when a community chooses to love intentionally.', 'Mrs. Anna K. Page', 'Co-Founder & Counsellor, TCMI', 'api/uploads/testimonials/Mrs_Anna_K_Page.jfif'],
            ['Being part of the TCMI team as Head of Technology and Media has been one of the most rewarding chapters of my life. Technology is just a vessel — the real power is the message of transformation that TCMI carries. I am proud to use my skills to amplify that message to the world.', 'Elijah N. Bowyah Jr', 'Head of Tech & Media, TCMI', 'api/uploads/testimonials/Elijah_N_Bowyah_Jr.jfif'],
        ];
        foreach ($testimonials as $t) {
            $db->prepare('INSERT INTO testimonials (id,quote,name,role,pic_url) VALUES (?,?,?,?,?)')
               ->execute([uuid4(), $t[0], $t[1], $t[2], $t[3]]);
        }
        echo "✅ Testimonials seeded (3)\n";
    }

    // Books
    if ($db->query('SELECT COUNT(*) FROM books')->fetchColumn() == 0) {
        $books = [
            ['Walking in Purpose', 'Pastor David Osei', 'A transformative guide to discovering your calling.', 24.99, 'Book'],
            ['The Mentor\'s Handbook', 'Elder James Boateng', 'Practical tools for effective Christian mentoring.', 19.99, 'Book'],
            ['Faith Foundations Study Guide', 'Grace Mensah', 'A companion workbook for the Foundations of Faith course.', 14.99, 'Study Guide'],
            ['Youth Worship Collection', 'TCMI Worship Team', 'A digital collection of original worship songs.', 9.99, 'Music'],
        ];
        foreach ($books as $b) {
            $db->prepare('INSERT INTO books (id,title,author,description,price,category) VALUES (?,?,?,?,?,?)')
               ->execute([uuid4(), $b[0], $b[1], $b[2], $b[3], $b[4]]);
        }
        echo "✅ Books seeded (4)\n";
    }

    // Sponsors
    if ($db->query('SELECT COUNT(*) FROM sponsors')->fetchColumn() == 0) {
        $sponsors = [
            ['sp1', 'The Nella Foundation', 'api/uploads/sponsors/The_Nella_Foundation.png'],
            ['sp2', 'Bowyah University', null],
            ['sp3', 'Yormie Global', null],
            ['sp4', 'Grace Community Church', null],
            ['sp5', 'Kingdom Leaders Network', null],
        ];
        foreach ($sponsors as $sp) {
            $db->prepare('INSERT INTO sponsors (id,name,logo_url) VALUES (?,?,?)')->execute([$sp[0], $sp[1], $sp[2]]);
        }
        echo "✅ Sponsors seeded (5)\n";
    }

    // Settings
    if ($db->query('SELECT COUNT(*) FROM settings')->fetchColumn() == 0) {
        $settings = [
            ['app_name', 'The Cornerstone Mentorship Initiative'],
            ['hero_title', 'MENTORSHIP THAT TRANSFORMS'],
            ['payment_bank', '1'],
            ['payment_mobile', '1'],
        ];
        foreach ($settings as $s) {
            $db->prepare('INSERT INTO settings (key_name, value) VALUES (?, ?)')->execute($s);
        }
        echo "✅ Settings seeded\n";
    }

    // Media items
    if ($db->query('SELECT COUNT(*) FROM media_items')->fetchColumn() == 0) {
        $mediaSeeds = [
            ['m1', 'Faith That Moves Mountains', 'Pastor David Osei', 'A powerful sermon on activating mountain-moving faith.', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'May 2026'],
            ['m2', 'Walking with God Daily', 'Grace Mensah', 'Practical steps to maintaining a daily walk with God.', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Apr 2026'],
        ];
        foreach ($mediaSeeds as $m) {
            $db->prepare('INSERT INTO media_items (id,title,speaker,description,type,url,date) VALUES (?,?,?,?,?,?,?)')
               ->execute($m);
        }
        echo "✅ Media items seeded (2)\n";
    }

    // Announcements
    if ($db->query('SELECT COUNT(*) FROM announcements')->fetchColumn() == 0) {
        $db->prepare('INSERT INTO announcements (id,title,body,author_name,author_email) VALUES (?,?,?,?,?)')
           ->execute([uuid4(), 'Welcome to TCMI!', 'We are excited to begin this semester together. Please review the course materials and reach out to your mentors.', 'Pastor David Osei', 'pastor@tcmi.org']);
        echo "✅ Announcements seeded (1)\n";
    }

    echo "\n✅ Database initialization complete!\n";
    echo "Login: " . SEED_ADMIN_EMAIL . " / " . SEED_ADMIN_PASSWORD . "\n";

} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    echo "\nMake sure:\n";
    echo "1. MySQL is running in XAMPP\n";
    echo "2. Database '" . DB_NAME . "' exists (create it in phpMyAdmin)\n";
    echo "3. DB_USER and DB_PASS are correct in config.php\n";
}

echo "</pre>";
