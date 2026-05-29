// 
// COUNTRIES
// 
// Defined in js/countries.js

// 
// DATA STORE
// 


let currentUser = null, currentRole = 'student', appStep = 1, newTeamPic = null;

// 
// BOOT
// 
window.DB = {
  team: [], cofounder: {}, courses: [], events: [], users: {}, applications: [],
  faculty: [], students: [], lessons: [], assignments: [], exams: [], grades: [],
  announcements: [], messages: {}, enrollments: [], paymentMethods: {},
  eventRegistrations: [], pendingCourses: [], mediaItems: [], chatWith: null, notifications: [],
  books: [], sponsors: [], gallery: [], testimonials: []
};

window.refreshDB = async function () {
  try {
    const api = window.TCMI_API;
    const [team, cofounder, courses, events, gallery, testimonials, sponsors, books] = await Promise.all([
      api.public.getTeam().catch(() => []),
      api.public.getCofounder().catch(() => ({})),
      api.public.getCourses().catch(() => []),
      api.public.getEvents().catch(() => []),
      api.public.getGallery().catch(() => []),
      api.public.getTestimonials().catch(() => []),
      api.public.getSponsors().catch(() => []),
      api.public.getBooks().catch(() => [])
    ]);
    window.DB.team = (team || []).map(x => ({ ...x, pic: x.pic || x.pic_url || '' }));
    window.DB.cofounder = cofounder || {};
    window.DB.courses = courses || [];
    window.DB.events = events || [];
    window.DB.gallery = (gallery || []).map(x => ({ ...x, src: x.src || x.file_url || x.file_path || '' }));
    window.DB.testimonials = (testimonials || []).map(x => ({ ...x, pic: x.pic || x.pic_url || '' }));
    window.DB.sponsors = sponsors || [];
    window.DB.books = books || [];
  } catch (e) { console.error('DB Refresh Error:', e); }
};

document.addEventListener('DOMContentLoaded', async () => {
  const hasSession = await restoreSession().catch(() => false);
  await window.refreshDB();
  populateCountryDropdowns();
  renderLandingTeam();
  renderTestimonials();
  renderSponsorsSlider();
  renderGallery();
  if (!hasSession) {
    switchView('view-landing');
  }
});

function renderLandingTeam() {
  const g = document.getElementById('land-team-grid');
  if (!g) return;
  g.innerHTML = '';
  DB.team.forEach(function (m, i) {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.style.cssText = 'cursor:pointer;transition:all .3s;position:relative';

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'team-avatar-wrap';
    avatarWrap.style.position = 'relative';

    const avatarCircle = document.createElement('div');
    avatarCircle.className = 'team-avatar-circle';
    if (m.pic) {
      const img = document.createElement('img');
      img.src = m.pic;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
      avatarCircle.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.style.cssText = 'font-family:var(--font-serif);font-size:26px;font-weight:700';
      span.textContent = m.initials || (m.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      avatarCircle.appendChild(span);
    }
    avatarWrap.appendChild(avatarCircle);

    const hint = document.createElement('div');
    hint.className = 'view-profile-hint';
    hint.textContent = 'View Profile';
    hint.style.cssText = 'position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--navy);font-size:10px;font-weight:700;padding:2px 10px;border-radius:100px;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none';
    avatarWrap.appendChild(hint);
    card.appendChild(avatarWrap);

    const nameEl = document.createElement('div');
    nameEl.className = 'team-name';
    nameEl.style.marginTop = '16px';
    nameEl.textContent = m.name;
    card.appendChild(nameEl);

    const roleEl = document.createElement('div');
    roleEl.className = 'team-role';
    roleEl.textContent = m.role;
    card.appendChild(roleEl);

    const socialRow = document.createElement('div');
    socialRow.style.cssText = 'display:flex;justify-content:center;gap:8px;margin-top:12px';

    if (m.facebook) {
      const fbUrl = m.facebook.startsWith('http') ? m.facebook : 'https://' + m.facebook;
      const fbA = document.createElement('a');
      fbA.href = fbUrl;
      fbA.target = '_blank';
      fbA.rel = 'noopener';
      fbA.style.cssText = 'width:30px;height:30px;border-radius:50%;background:var(--navy);display:flex;align-items:center;justify-content:center;color:var(--gold-light);text-decoration:none;transition:all .2s;border:1px solid var(--border-gold)';
      fbA.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg>';
      fbA.addEventListener('mouseenter', function () { this.style.background = '#4267B2'; this.style.color = '#fff'; });
      fbA.addEventListener('mouseleave', function () { this.style.background = 'var(--navy)'; this.style.color = 'var(--gold-light)'; });
      fbA.addEventListener('click', function (e) { e.stopPropagation(); });
      socialRow.appendChild(fbA);
    } else {
      const fbDiv = document.createElement('div');
      fbDiv.title = 'Facebook coming soon';
      fbDiv.style.cssText = 'width:30px;height:30px;border-radius:50%;background:var(--cream);border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--slate-light)';
      fbDiv.textContent = 'f';
      socialRow.appendChild(fbDiv);
    }

    if (m.whatsapp) {
      const waA = document.createElement('a');
      waA.href = 'https://wa.me/' + m.whatsapp + '?text=Hello%20' + encodeURIComponent(m.name) + '%2C%20I%20found%20you%20on%20the%20TCMI%20website.';
      waA.target = '_blank';
      waA.rel = 'noopener';
      waA.style.cssText = 'width:30px;height:30px;border-radius:50%;background:var(--navy);display:flex;align-items:center;justify-content:center;color:var(--gold-light);text-decoration:none;transition:all .2s;border:1px solid var(--border-gold)';
      waA.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
      waA.addEventListener('mouseenter', function () { this.style.background = '#25D366'; this.style.color = '#fff'; });
      waA.addEventListener('mouseleave', function () { this.style.background = 'var(--navy)'; this.style.color = 'var(--gold-light)'; });
      waA.addEventListener('click', function (e) { e.stopPropagation(); });
      socialRow.appendChild(waA);
    } else {
      const waDiv = document.createElement('div');
      waDiv.title = 'WhatsApp coming soon';
      waDiv.style.cssText = 'width:30px;height:30px;border-radius:50%;background:var(--cream);border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--slate-light)';
      waDiv.textContent = 'w';
      socialRow.appendChild(waDiv);
    }

    card.appendChild(socialRow);

    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 12px 32px rgba(11,27,58,.14)';
      hint.style.opacity = '1';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transform = '';
      this.style.boxShadow = '';
      hint.style.opacity = '0';
    });

    card.addEventListener('click', function () {
      openTeamProfile(m.id);
    });

    g.appendChild(card);
  });
}

// 
// AUTH
// 
function showLanding() { switchView('view-landing'); }
function showLogin() {
  if (window.TCMI_API?.getToken?.() && currentUser) {
    switchView('view-app');
  } else {
    switchView('view-login');
  }
}
function switchView(id) { document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function setRole(r, btn) { currentRole = r; document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active')); btn.classList.add('active'); }
function scroll2(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

async function restoreSession() {
  const token = window.TCMI_API?.getToken?.();
  if (!token) return false;

  try {
    const user = await window.TCMI_API.me();
    if (user && user.id) {
      currentUser = user;
      window.currentUser = user;
      initApp(currentUser);
      switchView('view-app');
      return true;
    }
  } catch (e) {
    console.warn('Session restore failed:', e);
    window.TCMI_API.clearToken?.();
  }
  return false;
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pass').value;
  const err = document.getElementById('login-err');

  err.textContent = 'Logging in...';
  err.style.display = 'block';
  err.style.color = 'var(--text)';

  try {
    const res = await window.TCMI_API.login(email, pw);
    window.TCMI_API.setToken(res.token);
    err.style.display = 'none';
    currentUser = res.user;
    window.currentUser = currentUser;

    // We optionally keep syncAdminData running in the background for un-migrated sections (Phase 3 & 4)
    if (window.syncAdminData) {
      window.syncAdminData().catch(e => console.log(e)); // Run non-blocking
    }

    initApp(currentUser);
    switchView('view-app');
  } catch (e) {
    err.style.color = 'var(--danger)';
    err.textContent = e.message || 'Invalid email or password';
  }
}
function doLogout() {
  window.TCMI_API.logout();
  currentUser = null;
  window.currentUser = null;
  switchView('view-landing');
}

// 
// APP INIT
// 
function initApp(u) {
  setAvatarEl('sb-avatar', u);
  setAvatarEl('topbar-pic', u);
  document.getElementById('sb-name').textContent = u.name;
  document.getElementById('sb-role').textContent = cap(u.role);
  document.getElementById('welcome-msg').textContent = 'Welcome back, ' + u.name.split(' ')[0] + '!';
  document.getElementById('welcome-sub').textContent = u.role === 'admin' ? "Here's your institutional overview for today." : u.role === 'faculty' ? "Review your teaching dashboard and pending tasks." : "Track your spiritual growth and academic progress.";
  const fn = document.getElementById('c-faculty-note');
  if (fn) fn.style.display = u.role === 'faculty' ? 'block' : 'none';
  const ab = document.getElementById('approval-btn');
  if (ab) ab.style.display = u.role === 'admin' ? 'flex' : 'none';
  buildSidebar(u.role);
  populateCourseDropdowns();
  populateMentorSelect();
  renderNotifications();
  navTo('dashboard');
}

function setAvatarEl(id, u) {
  const el = document.getElementById(id); if (!el) return;
  if (u.pic) { el.innerHTML = `<img src="${u.pic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`; }
  else { el.textContent = u.initials; }
}

const NAV = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: '' },
    { id: 'students', label: 'Student Management', icon: '', sec: 'Management' },
    { id: 'applications', label: 'Applications', icon: '' },
    { id: 'faculty', label: 'Faculty & Mentors', icon: '' },
    { id: 'assign', label: 'Assign Mentors', icon: '' },
    { id: 'courses', label: 'Course Management', icon: '' },
    { id: 'course-approvals', label: 'Course Approvals', icon: '' },
    { id: 'lessons', label: 'Lesson Upload', icon: '' },
    { id: 'assignments', label: 'Assignments', icon: '' },
    { id: 'exams', label: 'Exams', icon: '' },
    { id: 'grades', label: 'Grades & GPA', icon: '', sec: 'Academic' },
    { id: 'announcements', label: 'Announcements', icon: '' },
    { id: 'chat', label: 'Messages', icon: '' },
    { id: 'registration', label: 'Registration', icon: '' },
    { id: 'bookstore', label: 'Bookstore', icon: '', sec: 'Features' },
    { id: 'podcast', label: 'Podcast & Media', icon: '' },
    { id: 'mentee-reg', label: 'Mentee Registrations', icon: '' },
    { id: 'mentor-reg', label: 'Mentor Registrations', icon: '' },
    { id: 'profile', label: 'My Profile', icon: '', sec: 'Account' },
    { id: 'admin', label: 'Admin Panel', icon: '' },
  ],
  faculty: [
    { id: 'dashboard', label: 'Dashboard', icon: '' },
    { id: 'courses', label: 'My Courses', icon: '', sec: 'Teaching' },
    { id: 'lessons', label: 'Upload Lessons', icon: '' },
    { id: 'assignments', label: 'Assignments', icon: '' },
    { id: 'exams', label: 'Exams', icon: '' },
    { id: 'grades', label: 'Grade Book', icon: '', sec: 'Academic' },
    { id: 'announcements', label: 'Announcements', icon: '' },
    { id: 'chat', label: 'Messages', icon: '' },
    { id: 'students', label: 'My Students', icon: '', sec: 'People' },
    { id: 'bookstore', label: 'Bookstore', icon: '', sec: 'Resources' },
    { id: 'podcast', label: 'Podcast & Media', icon: '' },
    { id: 'profile', label: 'My Profile', icon: '', sec: 'Account' },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: '' },
    { id: 'courses', label: 'My Courses', icon: '', sec: 'Academics' },
    { id: 'my-lessons', label: 'My Lessons', icon: '' },
    { id: 'registration', label: 'Registration', icon: '' },
    { id: 'assignments', label: 'Assignments', icon: '' },
    { id: 'exams', label: 'Upcoming Exams', icon: '' },
    { id: 'grades', label: 'Grades & GPA', icon: '' },
    { id: 'announcements', label: 'Announcements', icon: '', sec: 'Community' },
    { id: 'chat', label: 'Mentor Chat', icon: '' },
    { id: 'bookstore', label: 'Bookstore', icon: '', sec: 'Resources' },
    { id: 'podcast', label: 'Podcast & Media', icon: '' },
    { id: 'profile', label: 'My Profile', icon: '', sec: 'Account' },
  ],
};

function buildSidebar(role) {
  const nav = document.getElementById('sidebar-nav'); nav.innerHTML = '';
  (NAV[role] || NAV.admin).forEach(item => {
    if (item.sec) { const s = document.createElement('div'); s.className = 'sb-section'; s.textContent = item.sec; nav.appendChild(s); }
    const btn = document.createElement('button'); btn.className = 'nav-btn'; btn.id = 'nav-' + item.id;
    btn.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
    btn.onclick = () => navTo(item.id); nav.appendChild(btn);
  });
}

const PAGE_LABELS = { 'my-lessons': 'My Lessons', dashboard: 'Dashboard', students: 'Student Management', applications: 'Student Applications', faculty: 'Faculty & Mentors', assign: 'Assign Mentors', courses: 'Course Management', 'course-approvals': 'Course Approvals', lessons: 'Lesson Upload', assignments: 'Assignment Portal', exams: 'Exam Management', grades: 'Grades & GPA', announcements: 'Announcements & Discussion', chat: 'Messages', registration: 'Course Registration', admin: 'Admin Panel', profile: 'My Profile', bookstore: 'Online Bookstore', podcast: 'Podcast & Media', 'mentee-reg': 'Mentee Registrations', 'mentor-reg': 'Mentor Registrations' };

function navTo(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const btn = document.getElementById('nav-' + id); if (btn) btn.classList.add('active');
  const pg = document.getElementById('page-' + id); if (pg) pg.classList.add('active');
  if (id === 'my-lessons') { currentPdfId = null; renderMyLessons(); }
  document.getElementById('topbar-title').textContent = PAGE_LABELS[id] || 'TCMI';
  closeNotif();
  const renders = {
    dashboard: renderDashboard, profile: renderProfile, students: renderStudents,
    applications: renderApplications, faculty: renderFaculty, assign: renderAssign,
    courses: renderCourses, 'course-approvals': renderCourseApprovals,
    lessons: renderLessons, assignments: renderAssignments, exams: renderExams,
    grades: renderGrades, announcements: renderAnnouncements, chat: renderChat,
    registration: renderRegistration, admin: renderAdmin
  };
  if (renders[id]) renders[id]();
}

async function renderStudents() {
  const tbody = document.getElementById('students-table');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--slate)">Loading students...</td></tr>';
  let students = Array.isArray(DB.students) ? DB.students.slice() : [];

  if (window.TCMI_API?.admin?.getUsers) {
    try {
      const users = await window.TCMI_API.admin.getUsers();
      if (Array.isArray(users) && users.length) {
        DB.students = users.filter(u => u.role === 'student');
        students = DB.students;
      }
    } catch (e) {
      console.warn('Unable to load students from API:', e);
    }
  }

  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--slate)">No students found.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td><strong>${s.name || 'Unnamed'}</strong><div style="font-size:11px;color:var(--slate);margin-top:4px">${s.email || ''}</div></td>
      <td>${s.tcmi_id || s.id || '-'}</td>
      <td>${s.track || '-'}</td>
      <td>${s.mentor || '<span style="color:var(--slate)">Unassigned</span>'}</td>
      <td>${typeof s.gpa === 'number' ? s.gpa.toFixed(2) : (s.gpa || '-')}</td>
      <td>${s.status ? cap(s.status) : 'Active'}</td>
      <td><button class="btn-sm btn-golden" type="button">Profile</button></td>
    </tr>
  `).join('');
}

function filterStudents(q) {
  const query = (q || '').toLowerCase();
  document.querySelectorAll('#students-table tr').forEach(r => {
    const text = r.textContent.toLowerCase();
    r.style.display = text.includes(query) ? '' : 'none';
  });
}

// 
// DASHBOARD
// 
async function renderDashboard() {
  const r = currentUser.role;
  const statsContainer = document.getElementById('dash-stats');
  if (statsContainer) statsContainer.innerHTML = '<div style="padding:20px;text-align:center;width:100%;color:var(--slate)">Loading statistics...</div>';

  let stats = [];
  try {
    if (r === 'admin') {
      const [users, courses, apps] = await Promise.all([
        window.TCMI_API.admin.getUsers().catch(() => []),
        window.TCMI_API.admin.getAllCourses().catch(() => []),
        window.TCMI_API.admin.getApplications().catch(() => [])
      ]);
      const stuCount = users.filter(u => u.role === 'student').length;
      const facCount = users.filter(u => u.role === 'faculty').length;
      const pubCourses = courses.filter(c => c.status === 'published').length;
      const pendingApps = apps.filter(a => a.status === 'pending').length;

      stats = [
        { icon: '', label: 'Total Students', v: stuCount, trend: '+2', up: true, bg: '#EBF8FF' },
        { icon: '', label: 'Faculty Members', v: facCount, trend: '', bg: '#F0FFF4' },
        { icon: '', label: 'Active Courses', v: pubCourses, trend: '', bg: '#FBF5E6' },
        { icon: '', label: 'Pending Apps', v: pendingApps, trend: '', bg: '#FFF5F5' }
      ];
    } else if (r === 'faculty') {
      stats = [
        { icon: '', label: 'My Courses', v: '-', trend: '', bg: '#EBF8FF' },
        { icon: '', label: 'My Students', v: '-', trend: '', bg: '#F0FFF4' },
        { icon: '', label: 'Assignments', v: '-', trend: '', bg: '#FBF5E6' },
        { icon: '', label: 'Pending Grades', v: 3, trend: '', bg: '#FFF5F5' }
      ];
    } else {
      stats = [
        { icon: '', label: 'Enrolled Courses', v: '-', trend: '', bg: '#EBF8FF' },
        { icon: '', label: 'Current GPA', v: calcGPA().toFixed(2), trend: '+0.1', up: true, bg: '#FBF5E6' },
        { icon: '', label: 'Due Assignments', v: 2, trend: '', bg: '#FFF5F5' },
        { icon: '', label: 'Completed', v: 8, trend: '+1', up: true, bg: '#F0FFF4' }
      ];
    }

    if (statsContainer) {
      statsContainer.innerHTML = stats.map(s => `<div class="stat-card"><div class="stat-top"><div class="stat-icon" style="background:${s.bg}">${s.icon}</div>${s.trend ? `<span class="stat-trend ${s.up ? 'trend-up' : 'trend-dn'}">${s.up ? '↑' : '↓'} ${s.trend}</span>` : ''}</div><div class="stat-value">${s.v}</div><div class="stat-label">${s.label}</div></div>`).join('');
    }
  } catch (e) {
    if (statsContainer) statsContainer.innerHTML = '<div style="padding:20px;text-align:center;width:100%;color:var(--danger)">Error loading stats</div>';
  }

  document.getElementById('dash-activity').innerHTML = [
    { u: 'Ama Asante', a: 'Submitted Assignment', t: '2m', st: 'bg-success', sl: 'Submitted' },
    { u: 'Kwame Darko', a: 'Completed Module', t: '1h', st: 'bg-info', sl: 'Completed' },
    { u: 'Grace Mensah', a: 'Uploaded Lesson', t: '3h', st: 'bg-gold', sl: 'Uploaded' },
    { u: 'Ruth Owusu', a: 'Application Submitted', t: '5h', st: 'bg-warn', sl: 'Pending' },
  ].map(r => `<tr><td><strong>${r.u}</strong></td><td>${r.a}</td><td style="font-size:11px;color:var(--slate-light)">${r.t} ago</td><td><span class="badge ${r.st}">${r.sl}</span></td></tr>`).join('');
  const acts = r === 'admin'
    ? [["+ Add Student", "openModal('modal-add-student')"], ["+ New Course", "openModal('modal-add-course')"], [" Announce", "openModal('modal-add-ann')"], [" Applications", "navTo('applications')"]]
    : r === 'faculty'
      ? [[" Upload Lesson", "navTo('lessons')"], [" Create Assignment", "openModal('modal-add-assignment')"], [" Add Course", "openModal('modal-add-course')"], [" View Grades", "navTo('grades')"]]
      : [[" My Courses", "navTo('courses')"], [" Assignments", "navTo('assignments')"], [" Chat Mentor", "navTo('chat')"], [" My Grades", "navTo('grades')"]];
  document.getElementById('dash-actions').innerHTML = acts.map(([l, fn]) => `<button class="btn-sm btn-navy" style="width:100%;padding:9px;text-align:left;font-size:12px" onclick="${fn}">${l}</button>`).join('');

  if (DB.events && DB.events.length) {
    document.getElementById('dash-events').innerHTML = DB.events.map(e => `<div style="background:var(--cream);border-radius:9px;padding:14px;border:1px solid var(--border)"><div style="font-size:10px;font-weight:600;color:var(--gold);text-transform:uppercase">${e.mon}</div><div style="font-family:var(--font-serif);font-size:20px;color:var(--navy);font-weight:700">${e.day}</div><div style="font-size:12px;font-weight:600;color:var(--navy);margin-top:3px">${e.title}</div><div style="font-size:11px;color:var(--slate)">${e.meta}</div></div>`).join('');
  }
}

// 
// PROFILE
// 
function renderProfile() {
  const u = currentUser;
  const el = document.getElementById('profile-av-display');
  if (u.pic) { el.innerHTML = `<img src="${u.pic}">`; } else { el.textContent = u.initials; }
  document.getElementById('profile-display-name').textContent = u.name;
  document.getElementById('profile-display-role').textContent = cap(u.role);
  document.getElementById('profile-display-email').textContent = u.email;
  const extra = document.getElementById('profile-display-extra'); extra.innerHTML = '';
  if (u.phone) extra.innerHTML += `<div> ${u.phone}</div>`;
  if (u.country) extra.innerHTML += `<div> ${u.country}</div>`;
  document.getElementById('edit-name').value = u.name || '';
  document.getElementById('edit-email').value = u.email || '';
  document.getElementById('edit-phone').value = u.phone || '';
  document.getElementById('edit-bio').value = u.bio || '';
  const ec = document.getElementById('edit-country'); if (ec && u.country) ec.value = u.country;
}

function uploadProfilePic(inp) {
  const file = inp.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    const d = e.target.result;
    currentUser.pic = d; DB.users[currentUser.email].pic = d;
    setAvatarEl('sb-avatar', currentUser); setAvatarEl('topbar-pic', currentUser);
    const el = document.getElementById('profile-av-display'); el.innerHTML = `<img src="${d}">`;
    showToast('Profile photo updated!');
  }; r.readAsDataURL(file);
}

function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  const country = document.getElementById('edit-country').value;
  const bio = document.getElementById('edit-bio').value.trim();
  const pw = document.getElementById('edit-pw').value;
  const pw2 = document.getElementById('edit-pw2').value;
  if (pw && pw !== pw2) { showToast('Passwords do not match', 'err'); return; }
  currentUser.name = name; currentUser.phone = phone; currentUser.country = country; currentUser.bio = bio;
  if (pw) { currentUser.pw = pw; DB.users[currentUser.email].pw = pw; }
  Object.assign(DB.users[currentUser.email], { name, phone, country, bio });
  document.getElementById('sb-name').textContent = name;
  document.getElementById('profile-display-name').textContent = name;
  showToast('Profile saved!');
}

// 
// STUDENTS
// 


// 
// APPLICATIONS
// 
function renderApplications() {
  updateAppBadge();
  const pending = DB.applications.filter(a => a.status === 'pending');
  const approved = DB.applications.filter(a => a.status === 'approved');
  const rejected = DB.applications.filter(a => a.status === 'rejected');
  document.getElementById('pending-count').textContent = pending.length;
  ['pending', 'approved', 'rejected'].forEach(t => {
    const list = DB.applications.filter(a => a.status === t);
    document.getElementById('tab-apps-' + t).innerHTML = list.length ? list.map(renderAppCard).join('') : `<div style="text-align:center;padding:40px;color:var(--slate)">No ${t} applications.</div>`;
  });
}

function renderAppCard(a) {
  return `<div class="card" style="margin:0"><div class="card-body">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-family:var(--font-serif);font-size:16px;margin-bottom:3px">${a.name}</div>
        <div style="font-size:12px;color:var(--slate)"> ${a.email} ·  ${a.coo || '—'} · Age ${a.age || '—'}</div>
        <div style="font-size:12px;color:var(--slate);margin-top:3px">Courses: <strong>${(a.courses || []).join(', ') || '—'}</strong> · Payment: <strong>${a.payment || '—'}</strong></div>
        <div style="font-size:11px;color:var(--slate-light);margin-top:2px">Submitted: ${a.submittedAt}</div>
      </div>
      <div style="display:flex;gap:7px;flex-shrink:0;flex-wrap:wrap">
        <button class="btn-sm btn-golden" onclick="viewApplication('${a.id}')">View Details</button>
        ${a.status === 'pending' ? `<button class="btn-sm btn-success" onclick="processApp('${a.id}','approved')"> Approve</button><button class="btn-sm btn-danger" onclick="processApp('${a.id}','rejected')"> Reject</button>` : ''}
        ${a.status === 'approved' ? '<span class="badge bg-success"> Approved</span>' : ''}
        ${a.status === 'rejected' ? '<span class="badge bg-danger"> Rejected</span>' : ''}
      </div>
    </div>
  </div></div>`;
}

function processApp(id, status) {
  const app = DB.applications.find(a => a.id === id); if (!app) return;
  app.status = status;
  if (status === 'approved') {
    DB.students.push({ name: app.name, email: app.email, id: 'STU' + String(DB.students.length + 1).padStart(3, '0'), track: 'Youth Track', mentor: '', gpa: 0, status: 'Active', pic: null });
    showToast('Approved! Student account created.'); addNotif('Application approved for ' + app.name, 'var(--success)');
  } else { showToast('Application rejected.'); }
  renderApplications(); updateAppBadge();
}

function viewApplication(id) {
  const a = DB.applications.find(x => x.id === id); if (!a) return;
  document.getElementById('view-app-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      <div><div class="section-divider" style="margin-top:0">Personal</div>
        <table style="font-size:13px;width:100%">
          <tr><td style="color:var(--slate);padding:5px 0;width:140px">Full Name</td><td><strong>${a.name}</strong></td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Age</td><td>${a.age}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Date of Birth</td><td>${a.dob}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Country of Birth</td><td>${a.cob}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Country of Origin</td><td>${a.coo}</td></tr>
        </table>
      </div>
      <div><div class="section-divider" style="margin-top:0">Contact</div>
        <table style="font-size:13px;width:100%">
          <tr><td style="color:var(--slate);padding:5px 0;width:140px">Email</td><td>${a.email}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Phone</td><td>${a.phone || '—'}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Emergency Contact</td><td>${a.ecName} (${a.ecRel})</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">EC Phone</td><td>${a.ecPhone || '—'}</td></tr>
        </table>
      </div>
    </div>
    <div class="section-divider">Courses Applied For</div>
    <p style="font-size:13px">${(a.courses || []).join(', ') || 'None selected'}</p>
    <div class="section-divider">Personal Statement</div>
    <p style="font-size:13px;color:var(--slate);line-height:1.7">${a.statement || '—'}</p>
    <div class="section-divider">Payment & Documents</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <span class="badge bg-gold"> ${a.payment}</span>
      <span class="badge bg-${a.hasTranscript ? 'success' : 'danger'}"> Transcript: ${a.hasTranscript ? 'Uploaded' : 'Missing'}</span>
      <span class="badge bg-${a.hasDiploma ? 'success' : 'danger'}"> Diploma: ${a.hasDiploma ? 'Uploaded' : 'Missing'}</span>
      <span class="badge bg-${a.hasRec ? 'success' : 'danger'}"> Rec Letter: ${a.hasRec ? 'Uploaded' : 'Missing'}</span>
    </div>`;
  document.getElementById('view-app-footer').innerHTML = a.status === 'pending'
    ? `<button class="btn-cancel" onclick="closeModal('modal-view-app')">Close</button><button class="btn-submit" style="background:var(--danger)" onclick="processApp('${a.id}','rejected');closeModal('modal-view-app')">Reject</button><button class="btn-submit" style="background:var(--success)" onclick="processApp('${a.id}','approved');closeModal('modal-view-app')">Approve</button>`
    : `<button class="btn-cancel" onclick="closeModal('modal-view-app')">Close</button><span class="badge bg-${a.status === 'approved' ? 'success' : 'danger'}" style="padding:8px 16px;font-size:12px">${a.status === 'approved' ? ' Approved' : ' Rejected'}</span>`;
  openModal('modal-view-app');
}

function updateAppBadge() {
  const n = DB.applications.filter(a => a.status === 'pending').length;
  const el = document.getElementById('app-badge'); if (el) el.textContent = n;
}

// 
// FACULTY
// 

// ═══ ID GENERATION & CREDENTIAL HELPERS ═══
function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Student & faculty functions moved to js/users.js

// ═══ TCMI ID LOOKUP (public verification) ═══
function doLookup() {
  const raw = (document.getElementById('lookup-input').value || '').trim().toUpperCase();
  const res = document.getElementById('lookup-result');
  const none = document.getElementById('lookup-notfound');
  if (!raw) { showToast('Please enter a TCMI ID', 'err'); return; }

  res.style.display = 'none';
  none.style.display = 'none';

  // Search faculty
  const fac = DB.faculty.find(f => f.tcmiId && f.tcmiId.toUpperCase() === raw);
  if (fac) {
    showLookupResult({
      name: fac.name,
      role: fac.position,
      id: fac.tcmiId,
      type: 'Faculty Member',
      pic: fac.pic,
    });
    return;
  }

  // Search students
  const stu = DB.students.find(s => (s.tcmiId && s.tcmiId.toUpperCase() === raw) || (s.id && s.id.toUpperCase() === raw));
  if (stu) {
    showLookupResult({
      name: stu.name,
      role: stu.track || 'Student',
      id: stu.tcmiId || stu.id,
      type: 'Enrolled Student',
      pic: stu.pic,
    });
    return;
  }

  none.style.display = 'block';
}

function showLookupResult(data) {
  document.getElementById('lookup-name').textContent = data.name;
  document.getElementById('lookup-role').textContent = data.role;
  document.getElementById('lookup-id').textContent = data.id;
  document.getElementById('lookup-type').textContent = data.type;

  const avatarEl = document.getElementById('lookup-avatar');
  avatarEl.innerHTML = data.pic
    ? `<img src="${data.pic}" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:20px;font-weight:700;color:var(--navy)">${data.name.charAt(0).toUpperCase()}</div>`;

  document.getElementById('lookup-result').style.display = 'block';
}




// 
// APPLICATIONS
// 
function renderApplications() {
  updateAppBadge();
  const pending = DB.applications.filter(a => a.status === 'pending');
  const approved = DB.applications.filter(a => a.status === 'approved');
  const rejected = DB.applications.filter(a => a.status === 'rejected');
  document.getElementById('pending-count').textContent = pending.length;
  ['pending', 'approved', 'rejected'].forEach(t => {
    const list = DB.applications.filter(a => a.status === t);
    document.getElementById('tab-apps-' + t).innerHTML = list.length ? list.map(renderAppCard).join('') : `<div style="text-align:center;padding:40px;color:var(--slate)">No ${t} applications.</div>`;
  });
}

function renderAppCard(a) {
  return `<div class="card" style="margin:0"><div class="card-body">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-family:var(--font-serif);font-size:16px;margin-bottom:3px">${a.name}</div>
        <div style="font-size:12px;color:var(--slate)"> ${a.email} ·  ${a.coo || '—'} · Age ${a.age || '—'}</div>
        <div style="font-size:12px;color:var(--slate);margin-top:3px">Courses: <strong>${(a.courses || []).join(', ') || '—'}</strong> · Payment: <strong>${a.payment || '—'}</strong></div>
        <div style="font-size:11px;color:var(--slate-light);margin-top:2px">Submitted: ${a.submittedAt}</div>
      </div>
      <div style="display:flex;gap:7px;flex-shrink:0;flex-wrap:wrap">
        <button class="btn-sm btn-golden" onclick="viewApplication('${a.id}')">View Details</button>
        ${a.status === 'pending' ? `<button class="btn-sm btn-success" onclick="processApp('${a.id}','approved')"> Approve</button><button class="btn-sm btn-danger" onclick="processApp('${a.id}','rejected')"> Reject</button>` : ''}
        ${a.status === 'approved' ? '<span class="badge bg-success"> Approved</span>' : ''}
        ${a.status === 'rejected' ? '<span class="badge bg-danger"> Rejected</span>' : ''}
      </div>
    </div>
  </div></div>`;
}

function processApp(id, status) {
  const app = DB.applications.find(a => a.id === id); if (!app) return;
  app.status = status;
  if (status === 'approved') {
    DB.students.push({ name: app.name, email: app.email, id: 'STU' + String(DB.students.length + 1).padStart(3, '0'), track: 'Youth Track', mentor: '', gpa: 0, status: 'Active', pic: null });
    showToast('Approved! Student account created.'); addNotif('Application approved for ' + app.name, 'var(--success)');
  } else { showToast('Application rejected.'); }
  renderApplications(); updateAppBadge();
}

function viewApplication(id) {
  const a = DB.applications.find(x => x.id === id); if (!a) return;
  document.getElementById('view-app-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      <div><div class="section-divider" style="margin-top:0">Personal</div>
        <table style="font-size:13px;width:100%">
          <tr><td style="color:var(--slate);padding:5px 0;width:140px">Full Name</td><td><strong>${a.name}</strong></td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Age</td><td>${a.age}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Date of Birth</td><td>${a.dob}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Country of Birth</td><td>${a.cob}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Country of Origin</td><td>${a.coo}</td></tr>
        </table>
      </div>
      <div><div class="section-divider" style="margin-top:0">Contact</div>
        <table style="font-size:13px;width:100%">
          <tr><td style="color:var(--slate);padding:5px 0;width:140px">Email</td><td>${a.email}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Phone</td><td>${a.phone || '—'}</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">Emergency Contact</td><td>${a.ecName} (${a.ecRel})</td></tr>
          <tr><td style="color:var(--slate);padding:5px 0">EC Phone</td><td>${a.ecPhone || '—'}</td></tr>
        </table>
      </div>
    </div>
    <div class="section-divider">Courses Applied For</div>
    <p style="font-size:13px">${(a.courses || []).join(', ') || 'None selected'}</p>
    <div class="section-divider">Personal Statement</div>
    <p style="font-size:13px;color:var(--slate);line-height:1.7">${a.statement || '—'}</p>
    <div class="section-divider">Payment & Documents</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <span class="badge bg-gold"> ${a.payment}</span>
      <span class="badge bg-${a.hasTranscript ? 'success' : 'danger'}"> Transcript: ${a.hasTranscript ? 'Uploaded' : 'Missing'}</span>
      <span class="badge bg-${a.hasDiploma ? 'success' : 'danger'}"> Diploma: ${a.hasDiploma ? 'Uploaded' : 'Missing'}</span>
      <span class="badge bg-${a.hasRec ? 'success' : 'danger'}"> Rec Letter: ${a.hasRec ? 'Uploaded' : 'Missing'}</span>
    </div>`;
  document.getElementById('view-app-footer').innerHTML = a.status === 'pending'
    ? `<button class="btn-cancel" onclick="closeModal('modal-view-app')">Close</button><button class="btn-submit" style="background:var(--danger)" onclick="processApp('${a.id}','rejected');closeModal('modal-view-app')">Reject</button><button class="btn-submit" style="background:var(--success)" onclick="processApp('${a.id}','approved');closeModal('modal-view-app')">Approve</button>`
    : `<button class="btn-cancel" onclick="closeModal('modal-view-app')">Close</button><span class="badge bg-${a.status === 'approved' ? 'success' : 'danger'}" style="padding:8px 16px;font-size:12px">${a.status === 'approved' ? ' Approved' : ' Rejected'}</span>`;
  openModal('modal-view-app');
}

function updateAppBadge() {
  const n = DB.applications.filter(a => a.status === 'pending').length;
  const el = document.getElementById('app-badge'); if (el) el.textContent = n;
}

// 
// FACULTY
// 
function renderFaculty() {
  document.getElementById('faculty-table').innerHTML = DB.faculty.map(f => `<tr>
    <td><div style="display:flex;align-items:center;gap:9px">${av(f, 30)}<strong>${f.name}</strong></div></td>
    <td style="font-size:12px;color:var(--slate)">${f.position}</td>
    <td>${DB.courses.filter(c => c.instructor === f.email).length}</td>
    <td>${DB.students.filter(s => s.mentor === f.email).length}</td>
    <td><span class="badge bg-success">Active</span></td>
    <td><button class="btn-sm btn-golden">Profile</button></td>
  </tr>`).join('');
}

function addFaculty() {
  const name = document.getElementById('nf-name').value.trim();
  const email = document.getElementById('nf-email').value.trim();
  const pos = document.getElementById('nf-pos').value;
  if (!name || !email) { showToast('Name and email required', 'err'); return; }
  DB.faculty.push({ name, email, position: pos, initials: ini(name), pic: null });
  DB.users[email] = { pw: 'faculty123', role: 'faculty', name, initials: ini(name), email, pic: null, position: pos };
  renderFaculty(); closeModal('modal-add-faculty'); showToast('Faculty member added!');
}

// 
// ASSIGN MENTORS (admin only)
// 
async function renderAssign() {
  const table = document.getElementById('assign-table'); if (!table) return;
  table.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--slate)">Loading...</td></tr>';

  try {
    // Fetch users from API (admin-only). Fall back to existing DB if API not accessible.
    let users = [];
    try { users = await window.TCMI_API.admin.getUsers(); } catch (e) { users = []; }

    if (users && users.length) {
      DB.students = users.filter(u => u.role === 'student');
      DB.faculty = users.filter(u => u.role === 'faculty');
    }

    // Render rows
    table.innerHTML = DB.students.map(s => {
      const cur = DB.faculty.find(f => f.email === s.mentor);
      return `<tr>
      <td><strong>${s.name}</strong></td>
      <td>${cur ? cur.name : '<span style="color:var(--danger)">Unassigned</span>'}</td>
      <td><select class="fs" style="width:auto;padding:5px 9px;font-size:12px" id="ms-${s.id}">
        <option value="">-- Select --</option>
        ${DB.faculty.map(f => `<option value="${f.email}" ${s.mentor === f.email ? 'selected' : ''}>${f.name}</option>`).join('')}
      </select></td>
      <td><button class="btn-sm btn-success" onclick="saveAssign('${s.id}')">Assign</button></td>
    </tr>`;
    }).join('');
  } catch (e) {
    console.error('renderAssign error:', e);
    table.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--danger)">Error loading students.</td></tr>';
  }
}

function saveAssign(sid) {
  const sel = document.getElementById('ms-' + sid); if (!sel) return;
  const mEmail = sel.value;
  const s = DB.students.find(x => x.id === sid); if (!s) return;
  s.mentor = mEmail; if (DB.users[s.email]) DB.users[s.email].mentor = mEmail;
  const m = DB.faculty.find(f => f.email === mEmail);
  showToast(`${s.name} assigned to ${m ? m.name : 'mentor'}`);
  addNotif(`${s.name} assigned to ${m ? m.name : 'a mentor'}`, 'var(--success)');
}

// 
// COURSES
// 
async function renderCourses() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--slate)">Loading courses...</div>';

  const ab = document.getElementById('approval-btn');
  try {
    const courses = await window.TCMI_API.getCourses().catch(() => []);
    const pub = courses.filter(c => c.status === 'published');
    const pc = courses.filter(c => c.status === 'pending');

    if (ab) {
      ab.style.display = currentUser?.role === 'admin' && pc.length > 0 ? 'flex' : 'none';
      const cbadge = document.getElementById('approval-count');
      if (cbadge) cbadge.textContent = pc.length;
    }

    grid.innerHTML = pub.length ? pub.map(c => `
      <div class="course-app-card">
        <div class="course-banner" style="background:${c.color || '#EBF8FF'}">${c.emoji || '📚'}</div>
        <div class="course-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
            <span class="badge bg-info" style="font-size:10px">${c.level || 'Beginner'}</span>
            <span style="font-size:11px;color:var(--slate)">${c.enrolled || 0} enrolled</span>
          </div>
          <div class="course-body-title">${c.title}</div>
          <div class="course-body-meta"> ${c.modules || 6} Modules • ${c.track || 'General'}</div>
          <div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--slate);margin-bottom:3px"><span>Progress</span><span>${c.progress || 0}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${c.progress || 0}%"></div></div></div>
          <div style="display:flex;gap:5px;margin-top:9px">
            <button class="btn-sm btn-navy" style="flex:1" onclick="showToast('Opening ${c.title.replace(/'/g, '')}...')">Open</button>
            ${currentUser?.role !== 'student' ? `<button class="btn-sm btn-golden">Edit</button>` : ''}
            ${currentUser?.role === 'admin' ? `<button class="btn-sm btn-danger" onclick="deleteCourse('${c.id}')">Del</button>` : ''}
          </div>
        </div>
      </div>`).join('') : '<div style="text-align:center;padding:40px;color:var(--slate)">No published courses.</div>';
  } catch (e) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger)">Error loading courses.</div>';
  }
}

async function deleteCourse(id) {
  if (!confirm('Delete this course?')) return;
  try {
    await window.TCMI_API.admin.deleteCourse(id);
    showToast('Course deleted.');
    renderCourses();
  } catch (e) {
    showToast('Failed to delete course', 'err');
  }
}

async function createCourse() {
  const title = document.getElementById('c-title').value.trim();
  if (!title) { showToast('Title required', 'err'); return; }

  const c = {
    emoji: document.getElementById('c-emoji').value || '',
    title,
    description: document.getElementById('c-desc').value,
    track: document.getElementById('c-track').value,
    level: document.getElementById('c-level').value,
    price: '$' + document.getElementById('c-price').value,
    enrolled: 0,
    modules: 6,
    progress: 0,
    color: '#EBF8FF',
    instructor: currentUser.email,
    status: currentUser.role === 'admin' ? 'published' : 'pending'
  };

  try {
    await window.TCMI_API.admin.addCourse(c);
    if (currentUser.role === 'admin') {
      showToast('Course published!');
    } else {
      showToast('Course submitted for admin approval!');
      addNotif('New course submitted: ' + title, 'var(--warn)');
    }
    closeModal('modal-add-course');
    renderCourses();
  } catch (e) {
    showToast('Failed to create course: ' + e.message, 'err');
  }
}

async function renderCourseApprovals() {
  const list = document.getElementById('approvals-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:60px;color:var(--slate)">Loading pending courses...</div>';

  try {
    const courses = await window.TCMI_API.admin.getAllCourses();
    const pc = courses.filter(c => c.status === 'pending');

    list.innerHTML = pc.length ? pc.map(c => `
      <div class="card" style="margin:0"><div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-family:var(--font-serif);font-size:16px;margin-bottom:3px">${c.emoji || '📚'} ${c.title}</div>
            <div style="font-size:12px;color:var(--slate)">${c.track} • ${c.level} • Submitted by: ${c.instructor}</div>
            ${c.description ? `<div style="font-size:12px;color:var(--slate);margin-top:5px">${c.description}</div>` : ''}
          </div>
          <div style="display:flex;gap:7px">
            <button class="btn-sm btn-success" onclick="approveCourse('${c.id}')"> Approve & Publish</button>
            <button class="btn-sm btn-danger" onclick="rejectCourse('${c.id}')"> Reject</button>
          </div>
        </div>
      </div></div>`).join('') : '<div style="text-align:center;padding:60px;color:var(--slate)">No courses pending approval</div>';
  } catch (e) {
    list.innerHTML = '<div style="text-align:center;padding:60px;color:var(--danger)">Error loading pending courses</div>';
  }
}

async function approveCourse(id) {
  try {
    await window.TCMI_API.admin.updateCourse(id, { status: 'published' });
    showToast('Course approved and published!');
    renderCourseApprovals();
  } catch (e) {
    showToast('Failed to approve course: ' + e.message, 'err');
  }
}

async function rejectCourse(id) {
  if (!confirm('Reject and delete this course submission?')) return;
  try {
    await window.TCMI_API.admin.deleteCourse(id);
    showToast('Course rejected.');
    renderCourseApprovals();
  } catch (e) {
    showToast('Failed to reject course', 'err');
  }
}

// 
// LESSONS
// 
function renderLessons() {
  populateCourseDropdowns();
  document.getElementById('lessons-table').innerHTML = DB.lessons.map((l, i) => {
    const c = DB.courses.find(x => x.id === l.courseId);
    return `<tr>
      <td><strong>${l.title}</strong>${l.desc ? `<div style="font-size:11px;color:var(--slate)">${l.desc.slice(0, 50)}</div>` : ''}  </td>
      <td style="font-size:12px">${c ? c.title : '—'}</td>
      <td><span class="badge bg-${l.type === 'Video' ? 'warn' : l.type === 'PPTX' ? 'success' : 'info'}">${l.type}</span></td>
      <td style="white-space:nowrap">
        ${l.pdfData ? `<button class="btn-sm btn-navy" onclick="openSecurePdfAdmin('${l.id}')"> Preview</button>` : '<span style="font-size:11px;color:var(--slate)">No PDF</span>'}
        <button class="btn-sm btn-danger" style="margin-left:4px" onclick="DB.lessons.splice(${i},1);renderLessons();renderMyLessons();showToast('Lesson removed.')">&#x2715;</button>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--slate)">No lessons uploaded</td></tr>';
}

function doUploadLesson() {
  const title = document.getElementById('lesson-title').value.trim();
  const courseId = document.getElementById('lesson-course').value;
  if (!title || !courseId) { showToast('Title and course required', 'err'); return; }
  const file = document.getElementById('lesson-file').files[0];
  const type = file ? getFileType(file.name) : 'PDF';
  const desc = document.getElementById('lesson-desc')?.value?.trim() || '';
  if (file && type === 'PDF') {
    const reader = new FileReader();
    reader.onload = e => {
      DB.lessons.push({ id: 'l' + Date.now(), courseId, title, type, desc, by: currentUser.email, date: new Date().toLocaleDateString(), pdfData: e.target.result });
      renderLessons(); renderMyLessons();
      showToast('PDF lesson uploaded — students can view it securely!');
    };
    reader.readAsDataURL(file);
    return;
  }
  DB.lessons.push({ id: 'l' + Date.now(), courseId, title, type, desc, by: currentUser.email, date: new Date().toLocaleDateString(), pdfData: null });
  renderLessons(); renderMyLessons();
  document.getElementById('lesson-title').value = ''; document.getElementById('lesson-file').value = '';
  document.getElementById('lesson-prev').style.display = 'none';
  showToast('Lesson uploaded!');
}
function getFileType(n) { const e = n.split('.').pop().toLowerCase(); return e === 'mp4' || e === 'mov' ? 'Video' : e === 'pptx' ? 'PPTX' : e === 'docx' ? 'DOCX' : 'PDF'; }

// 
// ASSIGNMENTS
// 
function renderAssignments() {
  populateCourseDropdowns();
  document.getElementById('assignments-table').innerHTML = DB.assignments.map(a => {
    const c = DB.courses.find(x => x.id === a.courseId);
    const ov = new Date(a.due) < new Date();
    return `<tr>
      <td><strong>${a.title}</strong></td>
      <td style="font-size:12px">${c ? c.title : '—'}</td>
      <td style="font-size:12px;color:var(--slate)">${a.due}</td>
      <td>${a.submissions}/${a.total}</td>
      <td><span class="badge ${ov ? 'bg-danger' : 'bg-info'}">${ov ? 'Overdue' : 'Active'}</span></td>
      <td style="display:flex;gap:5px">
        ${currentUser.role === 'student' ? `<button class="btn-sm btn-golden" onclick="openSubmitAssign('${a.id}')">Submit</button>` : ''}
        ${currentUser.role !== 'student' ? `<button class="btn-sm btn-navy">View</button><button class="btn-sm btn-golden">Grade</button>` : ''}
      </td></tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--slate)">No assignments</td></tr>';
}

function openSubmitAssign(id) { document.getElementById('submit-assign-id').value = id; openModal('modal-submit-assign'); }
function doSubmitAssignment() { showToast('Assignment submitted!'); closeModal('modal-submit-assign'); }

function createAssignment() {
  const title = document.getElementById('a-title').value.trim();
  const courseId = document.getElementById('a-course').value;
  if (!title || !courseId) { showToast('Title and course required', 'err'); return; }
  DB.assignments.push({ id: 'a' + Date.now(), title, courseId, due: document.getElementById('a-due').value, max: parseInt(document.getElementById('a-max').value) || 100, by: currentUser.email, submissions: 0, total: 20 });
  renderAssignments(); closeModal('modal-add-assignment'); showToast('Assignment created!');
  addNotif('New assignment posted: ' + title, 'var(--info)');
}

// 
// EXAMS
// 
function renderExams() {
  populateCourseDropdowns();
  document.getElementById('exams-grid').innerHTML = DB.exams.map(e => {
    const c = DB.courses.find(x => x.id === e.courseId);
    return `<div class="exam-card">
      <div class="exam-card-hdr"><div class="exam-title">${e.title}</div><span class="badge bg-warn">Upcoming</span></div>
      <div class="exam-info"> <span>${c ? c.title : '—'}</span><br> <span>${e.date}</span><br> <span>${e.time}</span><br> <span>${e.duration} mins</span><br> <span>${e.marks} marks</span></div>
      <div style="display:flex;gap:6px;margin-top:12px">
        ${currentUser.role === 'student' ? `<button class="btn-sm btn-navy" style="flex:1">Start Exam</button>` : `<button class="btn-sm btn-navy" style="flex:1">Edit</button><button class="btn-sm btn-danger" onclick="DB.exams=DB.exams.filter(x=>x.id!=='${e.id}');renderExams()">Delete</button>`}
      </div></div>`;
  }).join('') || '<div style="text-align:center;padding:40px;color:var(--slate)">No exams scheduled.</div>';
}

function createExam() {
  const title = document.getElementById('ex-title').value.trim();
  const courseId = document.getElementById('ex-course').value;
  if (!title || !courseId) { showToast('Title and course required', 'err'); return; }
  DB.exams.push({ id: 'e' + Date.now(), title, courseId, date: document.getElementById('ex-date').value, time: document.getElementById('ex-time').value, duration: parseInt(document.getElementById('ex-dur').value) || 90, marks: parseInt(document.getElementById('ex-marks').value) || 100 });
  renderExams(); closeModal('modal-add-exam'); showToast('Exam scheduled!');
  addNotif('Exam scheduled: ' + title, 'var(--warn)');
}

// 
// GRADES + GPA + PDF TRANSCRIPT
// 
function calcGPA() { const tp = DB.grades.reduce((s, g) => s + g.points * g.credits, 0); const tc = DB.grades.reduce((s, g) => s + g.credits, 0); return tc ? tp / tc : 0; }
function scoreToGrade(s) { if (s >= 95) return { grade: 'A+', points: 4.0 }; if (s >= 90) return { grade: 'A', points: 4.0 }; if (s >= 85) return { grade: 'B+', points: 3.5 }; if (s >= 80) return { grade: 'B', points: 3.0 }; if (s >= 75) return { grade: 'C+', points: 2.5 }; if (s >= 70) return { grade: 'C', points: 2.0 }; if (s >= 60) return { grade: 'D', points: 1.0 }; return { grade: 'F', points: 0.0 }; }
function gpaClass(g) { if (g >= 3.7) return "Dean's List · First Class Honours"; if (g >= 3.3) return 'Second Class Upper'; if (g >= 3.0) return 'Second Class Lower'; if (g >= 2.0) return 'Third Class'; if (g > 0) return 'Academic Probation'; return 'No grades yet'; }

function renderGrades() {
  const gpa = calcGPA();
  document.getElementById('gpa-value').textContent = gpa.toFixed(2);
  document.getElementById('gpa-class').textContent = gpaClass(gpa);
  document.getElementById('grades-table').innerHTML = DB.grades.map(g => {
    const gc = g.grade.startsWith('A') ? 'grade-a' : g.grade.startsWith('B') ? 'grade-b' : g.grade.startsWith('C') ? 'grade-c' : 'grade-f';
    return `<tr><td><strong>${g.course}</strong></td><td>${g.credits}</td><td>${g.score}%</td><td><span class="${gc}">${g.grade}</span></td><td>${g.points.toFixed(1)}</td><td><span class="badge bg-${g.grade === 'F' ? 'danger' : 'success'}">${g.grade === 'F' ? 'Failed' : 'Passed'}</span></td></tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--slate)">No grades recorded</td></tr>';
}

function addGrade() {
  const course = document.getElementById('gpa-course').value.trim();
  const score = parseInt(document.getElementById('gpa-score').value);
  const credits = parseInt(document.getElementById('gpa-credits').value);
  if (!course || isNaN(score) || isNaN(credits)) { showToast('Fill all fields', 'err'); return; }
  const { grade, points } = scoreToGrade(score);
  DB.grades.push({ course, credits, score, grade, points });
  renderGrades();
  document.getElementById('gpa-course').value = ''; document.getElementById('gpa-score').value = ''; document.getElementById('gpa-credits').value = '';
  showToast('Grade added! GPA recalculated.');
}

function downloadTranscript() {
  const u = currentUser; const gpa = calcGPA();
  const LOGO = 'data:image/png;base64,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HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44TpQ6HA6Hw+FwOE44/38Ls98BEZY93gAAAABJRU5ErkJggg==';
  const rows = DB.grades.map(g => `<tr style="border-bottom:1px solid #eee"><td style="padding:8px 12px">${g.course}</td><td style="padding:8px 12px;text-align:center">${g.credits}</td><td style="padding:8px 12px;text-align:center">${g.score}%</td><td style="padding:8px 12px;text-align:center;font-weight:700">${g.grade}</td><td style="padding:8px 12px;text-align:center">${g.points.toFixed(1)}</td></tr>`).join('');
  const doc = `<!DOCTYPE html><html><head><title>TCMI Transcript — ${u.name}</title>
  </head><body>
  <img class="watermark" src="${LOGO}" alt="TCMI Watermark">
  <div class="content">
    <div class="letterhead">
      <div class="letterhead-left">
        <img src="${LOGO}" alt="TCMI Logo">
        <div class="letterhead-text">
          <h1>The Cornerstone Initiative</h1>
          <p>Est. 2026 · Official Academic Document</p>
          <p> 0477037427 ·  info.thecornerstone@gmail.com</p>
        </div>
      </div>
      <div style="text-align:right;font-size:11px;color:#555">
        <div style="font-weight:700;font-size:13px;color:#0B1B3A">OFFICIAL TRANSCRIPT</div>
 Generated: ${new Date().toLocaleDateString()}<br>
 Ref: TCMI-${u.initials || 'XX'}-${Date.now().toString().slice(-6)}
      </div>
    </div>
    <table style="margin-bottom:16px;font-size:12px;width:auto">
      <tr><td style="padding:4px 24px 4px 0;color:#555;font-weight:600">Student Name:</td><td><strong>${u.name}</strong></td></tr>
      <tr><td style="padding:4px 24px 4px 0;color:#555;font-weight:600">Email:</td><td>${u.email}</td></tr>
      <tr><td style="padding:4px 24px 4px 0;color:#555;font-weight:600">Academic Year:</td><td>2025–2026</td></tr>
    </table>
    <table><thead><tr><th>Course</th><th>Credits</th><th>Score</th><th>Grade</th><th>Points</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="padding:16px;text-align:center;color:#999">No grades on record</td></tr>'}</tbody></table>
    <div class="gpa-box">
      <div style="font-size:11px;opacity:.6;margin-bottom:3px">Cumulative GPA (4.0 Scale)</div>
      <div style="font-size:32px;font-weight:700;line-height:1">${gpa.toFixed(2)}</div>
      <div style="font-size:12px;margin-top:3px">${gpaClass(gpa)}</div>
    </div>
    <div class="stamp">Official Document</div>
    <div class="footer">
      <p>This is an official transcript issued by The Cornerstone Initiative · info.thecornerstone@gmail.com · 0477037427</p>
      <p style="margin-top:5px;font-style:italic">"Built on the foundation of the apostles and prophets, Jesus Christ himself being the chief cornerstone." — Ephesians 2:20</p>
      <p style="margin-top:5px">Developed and Designed by: <a href="mailto:bowyah26@gmail.com">TCMI-Tech Team</a></p>
    </div>
  </div>
  <script>window.onload=function(){window.print();}<\/script></body></html>`;
  const w = window.open('', '_blank'); w.document.write(doc); w.document.close();
  showToast('Transcript opened — use Print (Ctrl+P) to save as PDF');
}

// 
// ANNOUNCEMENTS + REPLIES
// 
const ANN_COLORS = { General: 'var(--gold)', Academic: 'var(--info)', Event: 'var(--success)', Question: 'var(--navy)', Urgent: 'var(--danger)' };

function renderAnnouncements() {
  document.getElementById('announcements-list').innerHTML = DB.announcements.map(a => `
    <div class="ann-card">
      <div class="ann-top">
        <div class="ann-dot" style="background:${ANN_COLORS[a.cat] || 'var(--gold)'}"></div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
            <div class="ann-title">${a.pinned ? ' ' : ''}${a.title} <span class="badge bg-${a.cat === 'Urgent' ? 'danger' : a.cat === 'Academic' ? 'info' : a.cat === 'Event' ? 'success' : 'gold'}" style="font-size:10px">${a.cat}</span></div>
            ${currentUser.role !== 'student' ? `<button class="btn-sm btn-danger" style="padding:2px 8px;font-size:11px" onclick="deleteAnn('${a.id}')">Delete</button>` : ''}
          </div>
          <div class="ann-body">${a.body}</div>
          <div class="ann-meta">By <strong>${a.by}</strong> · ${a.time}</div>
          <div class="ann-replies" id="ann-replies-${a.id}">
            ${(a.replies || []).map(r => `<div class="reply-item"><strong>${r.by}:</strong> ${r.text} <span style="font-size:10px;color:var(--slate-light)">· ${r.time}</span></div>`).join('')}
          </div>
          <div class="ann-reply-row">
            <input class="ann-reply-input" id="ann-inp-${a.id}" placeholder="Reply or comment…" onkeydown="if(event.key==='Enter')postReply('${a.id}')">
            <button class="btn-sm btn-golden" onclick="postReply('${a.id}')">Reply</button>
          </div>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('events-list').innerHTML = DB.events.map(e => `
    <div style="display:flex;gap:11px;padding:10px 0;border-bottom:1px solid var(--border);align-items:flex-start">
      <div style="min-width:44px;background:var(--navy);color:#fff;border-radius:7px;padding:7px;text-align:center">
        <div style="font-family:var(--font-serif);font-size:20px;font-weight:700;line-height:1">${e.day}</div>
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:var(--gold-light)">${e.mon}</div>
      </div>
      <div><div style="font-size:13px;font-weight:600;color:var(--navy)">${e.title}</div><div style="font-size:11px;color:var(--slate)">${e.meta}</div></div>
    </div>`).join('');
}

function postReply(annId) {
  const inp = document.getElementById('ann-inp-' + annId); if (!inp || !inp.value.trim()) return;
  const ann = DB.announcements.find(a => a.id === annId); if (!ann) return;
  if (!ann.replies) ann.replies = [];
  ann.replies.push({ by: currentUser.name, text: inp.value.trim(), time: 'Just now' });
  inp.value = '';
  renderAnnouncements();
  addNotif(currentUser.name + ' replied to "' + ann.title + '"', 'var(--info)');
}

function postAnnouncement() {
  const title = document.getElementById('ann-title').value.trim();
  const body = document.getElementById('ann-body').value.trim();
  if (!title || !body) { showToast('Title and message required', 'err'); return; }
  const a = { id: 'an' + Date.now(), title, body, cat: document.getElementById('ann-cat').value, by: currentUser.name, role: currentUser.role, time: 'Just now', color: 'var(--gold)', replies: [], pinned: false };
  DB.announcements.unshift(a);
  closeModal('modal-add-ann'); renderAnnouncements();
  showToast('Announcement posted — all users notified!');
  addNotif(currentUser.name + ' posted: ' + title, 'var(--gold)');
}

function deleteAnn(id) { if (!confirm('Delete this announcement?')) return; DB.announcements = DB.announcements.filter(a => a.id !== id); renderAnnouncements(); showToast('Deleted.'); }

// 
// CHAT
// 
function renderChat() {
  const contacts = currentUser.role === 'student' ? DB.faculty : [...DB.students, ...DB.faculty.filter(f => f.email !== currentUser.email)];
  document.getElementById('chat-contacts').innerHTML = contacts.map(c => {
    const key = c.email || '';
    const msgs = DB.messages[key] || [];
    const last = msgs[msgs.length - 1];
    return `<div class="chat-contact${DB.chatWith === key ? ' active' : ''}" onclick="openChat('${key}','${c.name}','${c.initials || ini(c.name)}')">
      <div class="chat-contact-av">${c.pic ? `<img src="${c.pic}">` : (c.initials || ini(c.name || ''))}</div>
      <div style="flex:1;min-width:0"><div class="chat-contact-name">${c.name}</div><div class="chat-contact-last">${last ? last.text.slice(0, 30) + '…' : 'Start a conversation'}</div></div>
    </div>`;
  }).join('');
  if (DB.chatWith) openChat(DB.chatWith, '', '');
}

function openChat(email, name, initial) {
  DB.chatWith = email;
  const contacts = [...DB.faculty, ...DB.students];
  const contact = contacts.find(c => c.email === email);
  const dname = name || contact?.name || email;
  const dini = initial || contact?.initials || ini(dname);
  document.getElementById('chat-hdr-name').textContent = dname;
  const hav = document.getElementById('chat-hdr-av');
  if (contact?.pic) { hav.innerHTML = `<img src="${contact.pic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`; }
  else { hav.textContent = dini; }
  if (!DB.messages[email]) DB.messages[email] = [];
  const box = document.getElementById('chat-messages');
  box.innerHTML = DB.messages[email].map(m => `<div class="msg ${m.from === 'me' ? 'msg-out' : 'msg-in'}">${m.text}<div class="msg-time">${m.time}</div></div>`).join('');
  box.scrollTop = box.scrollHeight;
  document.querySelectorAll('.chat-contact').forEach(c => c.classList.remove('active'));
}

function sendMsg() {
  const inp = document.getElementById('chat-input'); const txt = inp.value.trim(); if (!txt || !DB.chatWith) return;
  if (!DB.messages[DB.chatWith]) DB.messages[DB.chatWith] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  DB.messages[DB.chatWith].push({ from: 'me', text: txt, time: now });
  inp.value = ''; openChat(DB.chatWith, '', '');
  setTimeout(() => {
    const replies = ['Thank you for sharing that. God bless you! ', 'I will get back to you shortly. Keep pressing forward!', 'That is a great point — let us discuss further.', 'Praying for you! Stay strong in the faith.'];
    DB.messages[DB.chatWith].push({ from: DB.chatWith, text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    openChat(DB.chatWith, '', '');
  }, 1400);
}

// 
// REGISTRATION
// 
function renderRegistration() {
  const avail = DB.courses.filter(c => c.status === 'published' && !DB.enrollments.includes(c.id));
  document.getElementById('reg-available').innerHTML = avail.map(c => `<tr>
    <td><strong>${c.title}</strong></td><td style="font-size:11px;color:var(--slate)">${c.track}</td>
    <td>${c.price}</td><td><button class="btn-sm btn-success" onclick="enrol('${c.id}','${c.title.replace(/'/g, '`')}')">Enrol</button></td>
  </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--slate)">All courses enrolled!</td></tr>';
  document.getElementById('reg-enrolled').innerHTML = DB.enrollments.map(id => {
    const c = DB.courses.find(x => x.id === id);
    return c ? `<tr><td><strong>${c.title}</strong></td><td><div class="progress-bar" style="width:100px;display:inline-block"><div class="progress-fill" style="width:${c.progress}%"></div></div> ${c.progress}%</td><td><button class="btn-sm btn-danger" onclick="drop('${c.id}','${c.title.replace(/'/g, '`')}')">Drop</button></td></tr>` : '';
  }).join('') || '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--slate)">Not enrolled in any courses</td></tr>';
}

function enrol(id, t) { if (!DB.enrollments.includes(id)) DB.enrollments.push(id); renderRegistration(); showToast('Enrolled in ' + t + '!'); }
function drop(id, t) { if (!confirm('Drop "' + t + '"?')) return; DB.enrollments = DB.enrollments.filter(x => x !== id); renderRegistration(); showToast('Dropped course.'); }

// 
// ADMIN
// 
function renderAdmin() {
  document.getElementById('admin-stats').innerHTML = [
    { icon: '', label: 'Total Users', v: Object.keys(DB.users).length, bg: '#EBF8FF' },
    { icon: '', label: 'Active Courses', v: DB.courses.filter(c => c.status === 'published').length, bg: '#F0FFF4' },
    { icon: '', label: 'Applications', v: DB.applications.length, bg: '#FBF5E6' },
    { icon: '', label: 'Pending Courses', v: DB.pendingCourses.length, bg: '#FFF5F5' },
  ].map(s => `<div class="stat-card"><div class="stat-top"><div class="stat-icon" style="background:${s.bg}">${s.icon}</div></div><div class="stat-value">${s.v}</div><div class="stat-label">${s.label}</div></div>`).join('');

  document.getElementById('admin-roles-table').innerHTML = Object.values(DB.users).filter(u => u.email !== currentUser.email).map(u => `<tr>
    <td><div style="display:flex;align-items:center;gap:8px">${av(u, 26)}<div><div style="font-size:12px;font-weight:600">${u.name}</div><div style="font-size:11px;color:var(--slate)">${u.email}</div></div></div></td>
    <td><span class="badge bg-${u.role === 'admin' ? 'danger' : u.role === 'faculty' ? 'info' : 'success'}">${u.role}</span></td>
    <td><select class="fs" style="width:auto;padding:4px 8px;font-size:12px" onchange="changeRole('${u.email}',this.value)">
      <option ${u.role === 'student' ? 'selected' : ''} value="student">Student</option>
      <option ${u.role === 'faculty' ? 'selected' : ''} value="faculty">Faculty</option>
      <option ${u.role === 'admin' ? 'selected' : ''} value="admin">Admin</option>
    </select></td>
  </tr>`).join('');

  document.getElementById('payment-toggles').innerHTML = `
    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px;border:1px solid var(--border);border-radius:8px">
      <input type="checkbox" id="pay-bank" ${DB.paymentMethods.bank ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--gold)">
      <div><div style="font-weight:600;font-size:13px"> Bank Transfer</div><div style="font-size:11px;color:var(--slate)">Allow bank transfer payment on applications</div></div>
    </label>
    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px;border:1px solid var(--border);border-radius:8px">
      <input type="checkbox" id="pay-mobile" ${DB.paymentMethods.mobile ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--gold)">
      <div><div style="font-weight:600;font-size:13px"> Mobile Money Transfer</div><div style="font-size:11px;color:var(--slate)">Allow mobile money payment on applications</div></div>
    </label>`;

  initAdminCofounder();
  renderAdminSponsors();
  renderAdminGallery();
  renderAdminTestimonials();
  renderAdminOrders();
  renderAdminCarts();
  // Events table
  const et = document.getElementById('admin-events-table');
  if (et) et.innerHTML = DB.events.length ? DB.events.map(e => `<tr>
    <td><strong>${e.day} ${e.mon} ${e.year || '2026'}</strong></td>
    <td>${e.title}</td>
    <td style="font-size:12px;color:var(--slate)">${e.location || e.meta}</td>
    <td><span class="badge ${e.type === 'free' ? 'bg-success' : e.type === 'online' ? 'bg-info' : 'bg-gold'}">${e.type}</span></td>
    <td style="font-size:12px;font-weight:600;color:var(--info)">${(DB.eventRegistrations || []).filter(r => r.eventId === e.id).length} registered</td>
    <td><button class="btn-sm btn-danger" style="font-size:11px" onclick="deleteEvent('${e.id}');renderAdmin()">Delete</button></td>
  </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--slate)">No events. Click + Add Event.</td></tr>';

  document.getElementById('admin-team-grid').innerHTML = DB.team.map((m, i) => `
    <div class="team-admin-card">
      <div class="team-admin-av">${m.pic ? `<img src="${m.pic}">` : (m.initials || '?')}</div>
      <div style="font-size:13px;font-weight:600;color:var(--navy)">${m.name}</div>
      <div style="font-size:11px;color:var(--slate);margin-bottom:4px">${m.role}</div>
      <div style="display:flex;justify-content:center;gap:5px;margin-bottom:8px">
        ${m.facebook ? `<span style="font-size:10px;background:var(--info-bg);color:var(--info);padding:2px 7px;border-radius:100px">f linked</span>` : `<span style="font-size:10px;background:var(--cream);color:var(--slate-light);padding:2px 7px;border-radius:100px">no fb</span>`}
        ${m.whatsapp ? `<span style="font-size:10px;background:var(--success-bg);color:var(--success);padding:2px 7px;border-radius:100px">wa linked</span>` : `<span style="font-size:10px;background:var(--cream);color:var(--slate-light);padding:2px 7px;border-radius:100px">no wa</span>`}
      </div>
      <div style="display:flex;gap:5px;justify-content:center">
        <button class="btn-sm btn-golden" style="font-size:11px;padding:4px 10px" onclick="openEditTeamMember(${i})"> Edit</button>
        <button class="btn-sm btn-danger" style="font-size:11px" onclick="DB.team.splice(${i},1);renderAdmin();renderLandingTeam();showToast('Removed.')">Remove</button>
      </div>
    </div>`).join('');
}

function changeRole(email, role) { if (DB.users[email]) DB.users[email].role = role; showToast('Role updated'); renderAdmin(); }
function savePaymentSettings() { DB.paymentMethods.bank = document.getElementById('pay-bank').checked; DB.paymentMethods.mobile = document.getElementById('pay-mobile').checked; showToast('Payment settings saved!'); }

function createAdminAccount() {
  const name = document.getElementById('new-admin-name').value.trim();
  const email = document.getElementById('new-admin-email').value.trim();
  const pw = document.getElementById('new-admin-pw').value;
  if (!name || !email || !pw) { showToast('All fields required', 'err'); return; }
  if (DB.users[email]) { showToast('Email already exists', 'err'); return; }
  DB.users[email] = { pw, role: 'admin', name, initials: ini(name), email, pic: null };
  showToast('Admin account created for ' + name);
  document.getElementById('new-admin-name').value = ''; document.getElementById('new-admin-email').value = ''; document.getElementById('new-admin-pw').value = '';
  renderAdmin();
}

// 
// TEAM MEMBER
// 
function previewTeamPic(inp) {
  const file = inp.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    newTeamPic = e.target.result;
    const el = document.getElementById('new-team-av'); el.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  }; r.readAsDataURL(file);
}

function addTeamMember() {
  const name = document.getElementById('tm-name').value.trim();
  const role = document.getElementById('tm-role').value.trim();
  const initial = document.getElementById('tm-initials').value.trim() || ini(name);
  if (!name || !role) { showToast('Name and role required', 'err'); return; }
  const whatsapp = document.getElementById('tm-whatsapp').value.trim().replace(/[^0-9]/g, '');
  const facebook = document.getElementById('tm-facebook').value.trim();
  DB.team.push({ name, role, initials: initial.toUpperCase().slice(0, 2), whatsapp, facebook, pic: newTeamPic || null });
  newTeamPic = null;
  closeModal('modal-add-team'); renderAdmin(); renderLandingTeam(); showToast('Team member added!');
  ['tm-name', 'tm-role', 'tm-initials', 'tm-whatsapp', 'tm-facebook'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('new-team-av').innerHTML = '?'; document.getElementById('new-team-av').textContent = '?';
}

// 
// APPLICATION FORM (5-step)
// 
function appFormStep(dir) {
  const next = appStep + dir; if (next < 1 || next > 5) return;
  if (dir > 0) {
    if (appStep === 1 && (!document.getElementById('af-name').value.trim() || !document.getElementById('af-dob').value)) { showToast('Please fill required fields', 'err'); return; }
    if (appStep === 2 && (!document.getElementById('af-email').value.trim() || !document.getElementById('af-phone').value.trim() || !document.getElementById('af-ec-name').value.trim())) { showToast('Please fill required contact fields', 'err'); return; }
  }
  document.getElementById('app-step-' + appStep).classList.remove('active');
  document.querySelectorAll('.step-item').forEach(d => {
    const s = parseInt(d.dataset.step);
    d.classList.remove('active', 'done');
    if (s === next) d.classList.add('active');
    else if (s < next) d.classList.add('done');
  });
  appStep = next;
  document.getElementById('app-step-' + appStep).classList.add('active');
  document.getElementById('app-prev-btn').style.display = appStep > 1 ? 'inline-block' : 'none';
  document.getElementById('app-next-btn').style.display = appStep < 5 ? 'inline-block' : 'none';
  document.getElementById('app-submit-btn').style.display = appStep === 5 ? 'inline-block' : 'none';
  if (appStep === 4) buildCoursesCheckboxes();
  if (appStep === 5) buildPaymentOptions();
}

function buildCoursesCheckboxes() {
  document.getElementById('af-courses-list').innerHTML = DB.courses.filter(c => c.status === 'published').map(c => `
    <label style="display:flex;align-items:center;gap:11px;padding:11px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" value="${c.title}" name="af-course" style="width:15px;height:15px;accent-color:var(--gold)">
      <div><div style="font-weight:600;font-size:13px">${c.emoji} ${c.title}</div><div style="font-size:11px;color:var(--slate)">${c.track} · ${c.level} · ${c.price}</div></div>
    </label>`).join('');
}

function buildPaymentOptions() {
  const cont = document.getElementById('af-pay-options');
  cont.innerHTML = `<div class="pay-option selected" onclick="selectPayment(this,'PayID')">
    <input type="radio" name="af-pay" value="PayID" checked style="accent-color:var(--gold)">
    <div class="pay-icon"></div>
    <div><div class="pay-label">PayID (Australian)</div><div class="pay-sub">Instant payment via Australian banking PayID</div></div>
  </div>`;
  document.getElementById('af-payid-info').style.display = 'block';
}

function selectPayment(el, method) {
  document.querySelectorAll('.pay-option').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected'); el.querySelector('input').checked = true;
  const pi = document.getElementById('af-payid-info'); if (pi) pi.style.display = 'block';
}

function submitApplication() {
  const name = document.getElementById('af-name').value.trim();
  if (!name) { showToast('Name is required', 'err'); return; }
  const payEl = document.querySelector('input[name="af-pay"]:checked');
  const courses = Array.from(document.querySelectorAll('input[name="af-course"]:checked')).map(c => c.value);
  const app = {
    id: 'app' + Date.now(), status: 'pending', name,
    age: document.getElementById('af-age').value,
    dob: document.getElementById('af-dob').value,
    cob: document.getElementById('af-cob').value,
    coo: document.getElementById('af-coo').value,
    email: document.getElementById('af-email').value,
    phone: document.getElementById('af-phone').value,
    ecName: document.getElementById('af-ec-name').value,
    ecRel: document.getElementById('af-ec-rel').value,
    ecPhone: document.getElementById('af-ec-phone').value,
    statement: document.getElementById('af-statement').value,
    payment: payEl ? payEl.value : 'Not selected',
    courses, submittedAt: new Date().toLocaleDateString(),
    hasTranscript: !!document.getElementById('af-transcript').files.length,
    hasDiploma: !!document.getElementById('af-diploma').files.length,
    hasRec: !!document.getElementById('af-rec').files.length,
  };
  DB.applications.push(app);
  closeModal('modal-apply');
  // Reset form
  appStep = 1;
  document.querySelectorAll('.app-step').forEach((s, i) => { s.classList.toggle('active', i === 0); });
  document.querySelectorAll('.step-item').forEach((d, i) => { d.classList.toggle('active', i === 0); d.classList.remove('done'); });
  document.getElementById('app-prev-btn').style.display = 'none';
  document.getElementById('app-next-btn').style.display = 'inline-block';
  document.getElementById('app-submit-btn').style.display = 'none';
  addNotif('New application received from ' + name, 'var(--info)');
  showToast('Application submitted! You will hear from us within 5–7 business days. ');
}

// 
// NOTIFICATIONS
// 
// Notifications and UI helpers moved to js/ui.js


let cart = [];
let bookstoreAccounts = {};
let bookstoreOrders = [];
let currentBookstoreUser = null;
let menteeRegs = [];
let mentorRegs = [];
currentBookstoreUser = null; // logged-in bookstore user
DB.mediaItems = [
  { id: 'm1', title: 'Faith That Moves Mountains', speaker: 'Pastor David Osei', desc: 'A powerful sermon on activating mountain-moving faith.', type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: 'May 2026' },
  { id: 'm2', title: 'Walking with God Daily', speaker: 'Grace Mensah', desc: 'Practical steps to maintaining a daily walk with God.', type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: 'Apr 2026' },
];
menteeRegs = [];
mentorRegs = [];

async function renderBookstore() {
  const btn = document.getElementById('add-book-btn');
  if (btn) btn.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
  await renderBooksGrid('books-grid', true);
  renderCart();
}

async function renderBooksGrid(containerId, showCart = false) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--slate)">Loading books...</div>';
  try {
    const books = await window.TCMI_API.api('GET', '/api/books').catch(() => []);
    el.innerHTML = books.map(b => `
      <div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:all .2s" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div style="height:160px;background:linear-gradient(135deg,var(--navy),var(--navy-light));display:flex;align-items:center;justify-content:center;font-size:48px">${b.img_url ? `<img src="${b.img_url}" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
        <div style="padding:14px">
          <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--gold);margin-bottom:4px">${b.category || 'Book'}</div>
          <div style="font-family:var(--font-serif);font-size:14px;font-weight:600;color:var(--navy);margin-bottom:3px">${b.title}</div>
          <div style="font-size:11px;color:var(--slate);margin-bottom:8px">${b.author}</div>
          <div style="font-size:12px;color:var(--slate);margin-bottom:10px;line-height:1.5">${b.description ? b.description.slice(0, 80) : ''}…</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:16px;font-weight:700;color:var(--navy)">AU$${parseFloat(b.price).toFixed(2)}</div>
            ${showCart ? `<button class="btn-sm btn-navy" onclick="addToCart('${b.id}')">Add to Cart</button>` : ''}
          </div>
          ${currentUser && currentUser.role === 'admin' ? `<button class="btn-sm btn-danger" style="width:100%;margin-top:8px;font-size:11px" onclick="deleteBook('${b.id}')">Remove</button>` : ''}
        </div>
      </div>`).join('') || '<div style="text-align:center;padding:40px;color:var(--slate)">No books in store yet.</div>';

    DB.books = books;
  } catch (e) {
    el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger)">Failed to load books.</div>';
  }
}

async function deleteBook(id) {
  if (!confirm('Remove this book?')) return;
  try {
    await window.TCMI_API.admin.api('DELETE', '/api/books/' + id);
    showToast('Book removed.');
    renderBookstore();
    renderLandBooksGrid();
  } catch (e) {
    showToast('Failed to delete book', 'err');
  }
}

function addToCart(bookId) {
  const book = DB.books.find(b => b.id === bookId);
  if (!book) return;
  const existing = cart.find(c => c.id === bookId);
  if (existing) { existing.qty++; } else { cart.push({ ...book, qty: 1 }); }
  renderCart();
  showToast(book.title + ' added to cart!');
}

function renderCart() {
  const el = document.getElementById('cart-items');
  if (!el) return;
  if (!cart.length) { el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--slate);font-size:13px">Your cart is empty</div>'; document.getElementById('cart-total').textContent = 'AU$0.00'; return; }
  el.innerHTML = cart.map(item => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border)">
      <div><div style="font-size:13px;font-weight:600;color:var(--navy)">${item.title}</div><div style="font-size:11px;color:var(--slate)">AU$${item.price.toFixed(2)} × ${item.qty}</div></div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn-sm btn-golden" style="padding:2px 8px" onclick="changeQty('${item.id}',-1)">−</button>
        <span style="font-size:12px;font-weight:600">${item.qty}</span>
        <button class="btn-sm btn-golden" style="padding:2px 8px" onclick="changeQty('${item.id}',1)">+</button>
      </div>
    </div>`).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-total').textContent = 'AU$' + total.toFixed(2);
}

function changeQty(id, dir) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += dir;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  renderCart();
}

function clearCart() { cart = []; renderCart(); showToast('Cart cleared.'); }

async function addBook() {
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const price = parseFloat(document.getElementById('book-price').value) || 0;
  if (!title || !author) { showToast('Title and author required', 'err'); return; }

  try {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('author', author);
    fd.append('description', document.getElementById('book-desc').value);
    fd.append('price', price);
    fd.append('category', document.getElementById('book-cat').value);

    await fetch('/TCMI/api/admin/books', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + window.TCMI_API.getToken() },
      body: fd
    });

    closeModal('modal-add-book');
    renderBookstore();
    renderLandBooksGrid();
    showToast('Book added to store!');
  } catch (e) {
    showToast('Failed to add book', 'err');
  }
}

async function confirmOrder() {
  const name = document.getElementById('checkout-name').value.trim();
  const email = document.getElementById('checkout-email') ? document.getElementById('checkout-email').value.trim() : 'unknown@example.com';
  if (!name) { showToast('Please enter your name', 'err'); return; }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  try {
    await window.TCMI_API.api('POST', '/api/orders', {
      customer_name: name,
      customer_email: email,
      items: cart,
      total: total
    });
    cart = [];
    renderCart();
    closeModal('modal-checkout');
    showToast('Order confirmed! AU$' + total.toFixed(2) + ' — Please complete PayID payment to 0477037427 (Ref: TCMI)');
    addNotif('New book order from ' + name, 'var(--success)');
  } catch (e) {
    showToast('Failed to place order: ' + e.message, 'err');
  }
}

async function renderLandBooksGrid() {
  const el = document.getElementById('land-books-grid'); if (!el) return;
  try {
    const books = await window.TCMI_API.api('GET', '/api/books').catch(() => []);
    if (!books.length) { el.innerHTML = '<p style="color:var(--slate)">Check back soon for new resources!</p>'; return; }
    el.innerHTML = books.slice(0, 4).map(b => `
      <div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:16px;text-align:center">
        <div style="font-size:40px;margin-bottom:10px"></div>
        <div style="font-family:var(--font-serif);font-size:15px;margin-bottom:4px">${b.title}</div>
        <div style="font-size:12px;color:var(--slate);margin-bottom:8px">${b.author}</div>
        <div style="font-size:15px;font-weight:700;color:var(--navy)">AU$${parseFloat(b.price).toFixed(2)}</div>
      </div>`).join('');
  } catch (e) { }
}

// PODCAST 
function renderPodcast() {
  const btn = document.getElementById('add-media-btn');
  if (btn) btn.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
  renderPodcastGrid('podcast-grid', true);
}

async function renderPodcastGrid(containerId, showAdmin = false) {
  const el = document.getElementById(containerId); if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--slate)">Loading media...</div>';
  try {
    const media = await window.TCMI_API.api('GET', '/api/media').catch(() => []);
    el.innerHTML = media.map(m => `
      <div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
        ${m.type === 'youtube' ? `<div style="position:relative;padding-top:56.25%;background:#000"><iframe src="${getYTEmbed(m.url)}" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" loading="lazy"></iframe></div>` : `<div style="height:200px;background:var(--navy);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);font-size:13px"> Video File</div>`}
        <div style="padding:14px">
          <div style="font-family:var(--font-serif);font-size:15px;margin-bottom:4px;color:var(--navy)">${m.title}</div>
          <div style="font-size:12px;color:var(--slate);margin-bottom:6px"> ${m.speaker} · ${m.created_at ? m.created_at.split(' ')[0] : ''}</div>
          <div style="font-size:12px;color:var(--slate);line-height:1.5">${m.description || ''}</div>
          ${showAdmin && currentUser.role === 'admin' ? `<button class="btn-sm btn-danger" style="margin-top:10px;width:100%;font-size:11px" onclick="deleteMedia('${m.id}')">Remove</button>` : ''}
        </div>
      </div>`).join('') || '<div style="text-align:center;padding:40px;color:rgba(255,255,255,.4)">No media published yet.</div>';
  } catch (e) {
    el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger)">Failed to load media.</div>';
  }
}

async function deleteMedia(id) {
  if (!confirm('Delete this media?')) return;
  try {
    await window.TCMI_API.admin.api('DELETE', '/api/media/' + id);
    showToast('Media deleted');
    renderPodcast();
    renderLandPodcast();
  } catch (e) {
    showToast('Failed to delete media', 'err');
  }
}

function getYTEmbed(url) {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/').split('&')[0];
  if (url.includes('youtu.be/')) return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0];
  return url;
}

function renderLandPodcast() {
  renderPodcastGrid('land-podcast-grid', false);
}

async function addMedia() {
  const title = document.getElementById('media-title').value.trim();
  if (!title) { showToast('Title required', 'err'); return; }
  const type = document.getElementById('media-type').value;
  const url = type === 'youtube' ? document.getElementById('media-url').value : '';

  try {
    await window.TCMI_API.admin.api('POST', '/api/media', {
      title,
      speaker: document.getElementById('media-speaker').value,
      description: document.getElementById('media-desc').value,
      type,
      url
    });
    closeModal('modal-add-media');
    renderPodcast();
    renderLandPodcast();
    showToast('Media added!');
  } catch (e) {
    showToast('Failed to add media: ' + e.message, 'err');
  }
}

function toggleMediaInput(type) {
  document.getElementById('media-yt-input').style.display = type === 'youtube' ? 'block' : 'none';
  document.getElementById('media-upload-input').style.display = type === 'upload' ? 'block' : 'none';
}

// MENTEE REG 
function renderMenteeReg() {
  document.getElementById('mentee-pending-count').textContent = menteeRegs.filter(r => r.status === 'pending').length;
  ['pending', 'approved', 'rejected'].forEach(t => {
    const list = menteeRegs.filter(r => r.status === t);
    document.getElementById('tab-mentee-' + t).innerHTML = list.length ? list.map(r => renderRegCard(r, 'mentee')).join('') : `<div style="text-align:center;padding:40px;color:var(--slate)">No ${t} mentee registrations.</div>`;
  });
}

function renderMentorReg() {
  document.getElementById('mentor-pending-count').textContent = mentorRegs.filter(r => r.status === 'pending').length;
  ['pending', 'approved', 'rejected'].forEach(t => {
    const list = mentorRegs.filter(r => r.status === t);
    document.getElementById('tab-mentor-' + t).innerHTML = list.length ? list.map(r => renderRegCard(r, 'mentor')).join('') : `<div style="text-align:center;padding:40px;color:var(--slate)">No ${t} mentor registrations.</div>`;
  });
}

function renderRegCard(r, type) {
  return `<div class="card" style="margin:0"><div class="card-body">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-family:var(--font-serif);font-size:16px;margin-bottom:3px">${r.name}</div>
        <div style="font-size:12px;color:var(--slate)"> ${r.email} ·  ${r.phone || '—'} ·  ${r.country || '—'}</div>
        ${type === 'mentor' ? `<div style="font-size:12px;color:var(--slate);margin-top:2px"> ${r.occupation || '—'} ·  ${r.church || '—'}</div>` : ''}
        <div style="font-size:11px;color:var(--slate-light);margin-top:3px">Submitted: ${r.submittedAt}</div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        ${r.status === 'pending' ? `<button class="btn-sm btn-success" onclick="processReg('${r.id}','approved','${type}')"> Approve & Email</button><button class="btn-sm btn-danger" onclick="processReg('${r.id}','rejected','${type}')"> Reject</button>` : ''}
        ${r.status === 'approved' ? '<span class="badge bg-success"> Approved</span>' : ''}
        ${r.status === 'rejected' ? '<span class="badge bg-danger"> Rejected</span>' : ''}
      </div>
    </div>
    ${r.statement ? `<div style="margin-top:10px;padding:10px;background:var(--cream);border-radius:7px;font-size:12px;color:var(--slate)"><strong>Statement:</strong> ${r.statement.slice(0, 200)}${r.statement.length > 200 ? '…' : ''}</div>` : ''}
  </div></div>`;
}

function processReg(id, status, type) {
  const list = type === 'mentee' ? menteeRegs : mentorRegs;
  const reg = list.find(r => r.id === id); if (!reg) return;
  reg.status = status;
  if (status === 'approved') {
    showToast(`${reg.name} approved! Acceptance email sent to ${reg.email}`);
    addNotif(`${type === 'mentee' ? 'Mentee' : 'Mentor'} approved: ${reg.name}`, 'var(--success)');
    // Simulate email send
    console.log(`[TCMI EMAIL] To: ${reg.email} | Subject: Welcome to TCMI | Body: Dear ${reg.name}, Congratulations! Your application to join The Cornerstone Initiative as a ${type} has been approved. Welcome to the TCMI family! — info.thecornerstone@gmail.com`);
  } else { showToast(`${reg.name}'s application rejected.`); }
  type === 'mentee' ? renderMenteeReg() : renderMentorReg();
}

function submitMenteeReg() {
  const name = document.getElementById('me-name').value.trim();
  const email = document.getElementById('me-email').value.trim();
  if (!name || !email) { showToast('Name and email required', 'err'); return; }
  menteeRegs.push({
    id: 'mr' + Date.now(), status: 'pending', name, email,
    phone: document.getElementById('me-phone').value,
    country: document.getElementById('me-country').value,
    dob: document.getElementById('me-dob').value,
    age: document.getElementById('me-age').value,
    statement: document.getElementById('me-statement').value,
    source: document.getElementById('me-source').value,
    submittedAt: new Date().toLocaleDateString(),
  });
  closeModal('modal-mentee-signup');
  addNotif('New mentee application from ' + name, 'var(--info)');
  showToast('Mentee application submitted! You will hear from us soon. God bless you! ');
}

function submitMentorReg() {
  const name = document.getElementById('mtor-name').value.trim();
  const email = document.getElementById('mtor-email').value.trim();
  if (!name || !email) { showToast('Name and email required', 'err'); return; }
  if (!document.getElementById('mtor-cv').files.length) { showToast('Please upload your CV', 'err'); return; }
  mentorRegs.push({
    id: 'mtr' + Date.now(), status: 'pending', name, email,
    phone: document.getElementById('mtor-phone').value,
    country: document.getElementById('mtor-country').value,
    occupation: document.getElementById('mtor-job').value,
    church: document.getElementById('mtor-church').value,
    why: document.getElementById('mtor-why').value,
    statement: document.getElementById('mtor-why').value,
    refs: [
      { name: document.getElementById('ref1-name').value, rel: document.getElementById('ref1-rel').value, phone: document.getElementById('ref1-phone').value, email: document.getElementById('ref1-email').value },
      { name: document.getElementById('ref2-name').value, rel: document.getElementById('ref2-rel').value, phone: document.getElementById('ref2-phone').value, email: document.getElementById('ref2-email').value },
      { name: document.getElementById('ref3-name').value, rel: document.getElementById('ref3-rel').value, phone: document.getElementById('ref3-phone').value, email: document.getElementById('ref3-email').value },
    ],
    hasCv: true,
    submittedAt: new Date().toLocaleDateString(),
  });
  closeModal('modal-mentor-signup');
  addNotif('New mentor application from ' + name, 'var(--info)');
  showToast('Mentor application submitted! Thank you for your heart to serve. We will be in touch! ');
}

function copyText(txt) {
  navigator.clipboard.writeText(txt).then(() => showToast('Copied: ' + txt)).catch(() => showToast('PayID: ' + txt));
}

// HOOK INTO navTo renders 
const _origNavTo = navTo;
// Extend the renders map
const _extraRenders = {
  bookstore: renderBookstore,
  podcast: renderPodcast,
  'mentee-reg': renderMenteeReg,
  'mentor-reg': renderMentorReg,
};
// Patch the renders in the existing navTo
const _origScript_renders = typeof renders !== 'undefined' ? renders : {};

// Override navTo completely so we can inject bookstore/podcast
(function () {
  const originalNavTo = navTo;
  window.navTo = function (id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const btn = document.getElementById('nav-' + id); if (btn) btn.classList.add('active');
    const pg = document.getElementById('page-' + id); if (pg) pg.classList.add('active');
    const labels = Object.assign({}, { dashboard: 'Dashboard', profile: 'My Profile', students: 'Student Management', applications: 'Student Applications', faculty: 'Faculty & Mentors', assign: 'Assign Mentors', courses: 'Course Management', 'course-approvals': 'Course Approvals', lessons: 'Lesson Upload', assignments: 'Assignment Portal', exams: 'Exam Management', grades: 'Grades & GPA', announcements: 'Announcements & Discussion', chat: 'Messages', registration: 'Course Registration', admin: 'Admin Panel', bookstore: 'Online Bookstore', podcast: 'Podcast & Media', 'mentee-reg': 'Mentee Registrations', 'mentor-reg': 'Mentor Registrations' });
    document.getElementById('topbar-title').textContent = labels[id] || 'TCMI';
    closeNotif();
    const renders = { dashboard: renderDashboard, profile: renderProfile, students: renderStudents, applications: renderApplications, faculty: renderFaculty, assign: renderAssign, courses: renderCourses, 'course-approvals': renderCourseApprovals, lessons: renderLessons, assignments: renderAssignments, exams: renderExams, grades: renderGrades, announcements: renderAnnouncements, chat: renderChat, registration: renderRegistration, admin: renderAdmin, bookstore: renderBookstore, podcast: renderPodcast, 'mentee-reg': renderMenteeReg, 'mentor-reg': renderMentorReg };
    if (renders[id]) renders[id]();
  };
})();

// LANDING PAGE INIT — populate books + podcast + countries in forms 
document.addEventListener('DOMContentLoaded', function () {
  renderLandBooksGrid();
  renderLandPodcast();
  renderTestimonials();
  renderSponsorsSlider();
  // Populate mentee/mentor country dropdowns
  ['me-country', 'me-nat', 'mtor-country'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    COUNTRIES.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; el.appendChild(o); });
  });
  // Populate mentee programme checkboxes
  const mp = document.getElementById('me-programmes');
  if (mp) mp.innerHTML = ['Youth Mentorship Track', 'Leadership Development', 'Faith Foundations Course', 'Walking with God Programme', 'Identity in Christ Workshop', 'Deep Discipleship (Advanced)'].map(p => `<label style="display:flex;align-items:center;gap:9px;cursor:pointer"><input type="checkbox" value="${p}" style="accent-color:var(--gold)"><span style="font-size:13px">${p}</span></label>`).join('');
});

// RENDER LANDING EVENTS 
async function renderLandEvents() {
  const grid = document.getElementById('land-events-grid');
  const empty = document.getElementById('land-events-empty');
  if (!grid) return;

  try {
    const events = await window.TCMI_API.api('GET', '/api/events').catch(() => []);
    if (!events || !events.length) {
      grid.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }
    grid.style.display = 'grid';
    if (empty) empty.style.display = 'none';

    grid.innerHTML = '';
    events.forEach(function (e) {
      const card = document.createElement('div');
      card.className = 'land-event-card';
      card.style.cssText = 'cursor:pointer;transition:all .3s;position:relative;overflow:hidden';

      card.innerHTML = `
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-light));opacity:0;transition:opacity .3s" class="event-top-bar"></div>
        <div class="land-event-date-box">
          <div class="land-event-cal">
            <div class="land-event-cal-day">${e.day}</div>
            <div class="land-event-cal-mon">${e.mon}</div>
          </div>
          <div>
            <div class="land-event-title">${e.title}</div>
            <div class="land-event-meta"> ${e.location || e.meta || 'TBA'} ·  ${e.time || 'TBA'}</div>
          </div>
        </div>
        ${e.description ? `<div style="font-size:12px;color:rgba(255,255,255,.5);line-height:1.6;margin-bottom:12px">${e.description}</div>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <span class="land-event-badge ${e.type === 'free' ? 'free' : e.type === 'online' ? 'online' : 'paid'}">
            ${e.type === 'free' ? ' Free Entry' : e.type === 'online' ? ' Online' : ' Ticketed'}
          </span>
          <span style="font-size:12px;color:var(--gold-light);font-weight:600;display:flex;align-items:center;gap:4px">
   Register <span style="font-size:16px">→</span>
          </span>
        </div>
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(201,168,76,.15);font-size:11px;color:rgba(255,255,255,.35);text-align:center">Click to register for this event</div>
      `;

      card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 16px 40px rgba(0,0,0,.3)';
        this.style.borderColor = 'rgba(201,168,76,.6)';
        this.style.background = 'rgba(201,168,76,.12)';
        const bar = this.querySelector('.event-top-bar');
        if (bar) bar.style.opacity = '1';
      });
      card.addEventListener('mouseleave', function () {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.borderColor = 'rgba(201,168,76,.2)';
        this.style.background = 'rgba(255,255,255,.06)';
        const bar = this.querySelector('.event-top-bar');
        if (bar) bar.style.opacity = '0';
      });

      card.addEventListener('click', function () {
        openEventRegistration(e);
      });

      grid.appendChild(card);
    });
  } catch (err) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
  }
}

// ADMIN: ADD / DELETE EVENT 
async function addEvent() {
  const title = document.getElementById('ev-title').value.trim();
  const day = document.getElementById('ev-day').value;
  const dateVal = document.getElementById('ev-date').value;
  if (!title || !dateVal) { showToast('Title and date required', 'err'); return; }
  const d = new Date(dateVal);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const newEv = {
    day: String(d.getDate()).padStart(2, '0'),
    mon: months[d.getMonth()],
    year: String(d.getFullYear()),
    title,
    meta: document.getElementById('ev-location').value || 'TBA',
    time: document.getElementById('ev-time').value || 'TBA',
    location: document.getElementById('ev-location').value || 'TBA',
    type: document.getElementById('ev-type').value,
    description: document.getElementById('ev-desc').value,
  };

  try {
    await window.TCMI_API.admin.api('POST', '/api/events', newEv);
    closeModal('modal-add-event');
    renderLandEvents();
    renderDashboardEvents();
    showToast('Event added and published!');
    addNotif('New event added: ' + title, 'var(--gold)');
    ['ev-title', 'ev-location', 'ev-time', 'ev-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } catch (err) {
    showToast('Failed to add event: ' + err.message, 'err');
  }
}

async function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  try {
    await window.TCMI_API.admin.api('DELETE', '/api/events/' + id);
    renderLandEvents();
    renderDashboardEvents();
    showToast('Event deleted.');
  } catch (err) {
    showToast('Failed to delete event', 'err');
  }
}

async function renderDashboardEvents() {
  const el = document.getElementById('dash-events'); if (!el) return;
  try {
    const events = await window.TCMI_API.api('GET', '/api/events').catch(() => []);
    el.innerHTML = events.slice(0, 4).map(e => `
      <div style="background:var(--cream);border-radius:9px;padding:14px;border:1px solid var(--border)">
        <div style="font-size:10px;font-weight:600;color:var(--gold);text-transform:uppercase">${e.mon} ${e.year || '2026'}</div>
        <div style="font-family:var(--font-serif);font-size:20px;color:var(--navy);font-weight:700">${e.day}</div>
        <div style="font-size:12px;font-weight:600;color:var(--navy);margin-top:3px">${e.title}</div>
        <div style="font-size:11px;color:var(--slate)">${e.location || e.meta || 'TBA'}</div>
        ${document.getElementById('sb-role') && document.getElementById('sb-role').textContent === 'Admin' ? `<button class="btn-sm btn-danger" style="margin-top:8px;font-size:10px;padding:3px 9px" onclick="deleteEvent('${e.id}')">Delete</button>` : ''}
      </div>`).join('');
  } catch (err) {
    el.innerHTML = '<div style="padding:14px;color:var(--slate)">Error loading events</div>';
  }
}




// TEAM PROFILE PAGE 
async function openTeamProfile(id) {
  let teamData = [];
  try {
    teamData = await window.TCMI_API.api('GET', '/api/team');
  } catch (e) { console.error(e); }

  teamData = teamData.map(x => ({ ...x, pic: x.pic || x.pic_url || '' }));
  const m = teamData.find(x => String(x.id) === String(id));
  if (!m) return;

  // Copy logo to nav
  const navLogo = document.getElementById('tp-nav-logo');
  const mainLogo = document.querySelector('.crest img');
  if (navLogo && mainLogo) navLogo.src = mainLogo.src;

  // Photo
  const photoEl = document.getElementById('tp-photo');
  const oldPlaceholder = document.getElementById('tp-photo-placeholder');
  if (oldPlaceholder) oldPlaceholder.remove();
  const photoUrl = m.pic || m.pic_url || '';
  photoEl.src = photoUrl;
  photoEl.style.display = photoUrl ? 'block' : 'none';
  if (!photoUrl) {
    const placeholder = document.createElement('div');
    placeholder.id = 'tp-photo-placeholder';
    placeholder.style.cssText = 'width:100%;height:100%;background:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:52px;color:var(--gold-light);font-weight:700';
    placeholder.textContent = m.initials || (m.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    photoEl.parentNode.insertBefore(placeholder, photoEl);
  }
  document.getElementById('tp-card-photo').src = photoUrl;
  document.getElementById('tp-card-photo').style.display = photoUrl ? 'block' : 'none';

  // Text
  document.getElementById('tp-name').textContent = m.name;
  document.getElementById('tp-role-badge').textContent = m.role;
  document.getElementById('tp-card-name').textContent = m.name;
  document.getElementById('tp-card-role').textContent = m.role;
  document.getElementById('tp-bio').textContent = m.bio || 'Biography coming soon.';
  document.getElementById('tp-quote').textContent = m.quote ? '\u201c' + m.quote + '\u201d' : '';
  document.getElementById('tp-quote-cite').textContent = m.quote ? '— ' + m.name : '';
  document.getElementById('tp-quote-block').style.display = m.quote ? 'block' : 'none';

  // Tags
  document.getElementById('tp-tags').innerHTML = (m.tags || []).map(t =>
    `<span style="background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);color:var(--gold-light);padding:4px 12px;border-radius:100px;font-size:12px;font-weight:500">${t}</span>`
  ).join('');

  // Social links (hero)
  const fbUrl = m.facebook ? (m.facebook.startsWith('http') ? m.facebook : 'https://' + m.facebook) : null;
  const waUrl = m.whatsapp ? `https://wa.me/${m.whatsapp}?text=Hello%20${encodeURIComponent(m.name)}%2C%20I%20found%20your%20profile%20on%20the%20TCMI%20website.` : null;
  document.getElementById('tp-socials').innerHTML = `
    ${fbUrl ? `<a href="${fbUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:7px;padding:8px 18px;border-radius:7px;background:#4267B2;color:#fff;font-size:13px;font-weight:600;text-decoration:none;transition:all .2s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg> Facebook</a>` : ''}
    ${waUrl ? `<a href="${waUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:7px;padding:8px 18px;border-radius:7px;background:#25D366;color:#fff;font-size:13px;font-weight:600;text-decoration:none;transition:all .2s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp</a>` : ''}
    ${!fbUrl && !waUrl ? '<span style="font-size:13px;color:rgba(255,255,255,.4)">Contact details coming soon</span>' : ''}
  `;

  // Contact cards
  document.getElementById('tp-contact-cards').innerHTML = `
    ${waUrl ? `<a href="${waUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:14px;padding:16px 20px;background:#fff;border:1px solid var(--border);border-radius:var(--radius);text-decoration:none;transition:all .2s;min-width:220px" onmouseover="this.style.borderColor='#25D366';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''"><div style="width:44px;height:44px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div><div><div style="font-size:13px;font-weight:600;color:var(--navy)">WhatsApp</div><div style="font-size:12px;color:var(--slate)">+${m.whatsapp}</div></div></a>` : ''}
    ${fbUrl ? `<a href="${fbUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:14px;padding:16px 20px;background:#fff;border:1px solid var(--border);border-radius:var(--radius);text-decoration:none;transition:all .2s;min-width:220px" onmouseover="this.style.borderColor='#4267B2';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''"><div style="width:44px;height:44px;border-radius:50%;background:#4267B2;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg></div><div><div style="font-size:13px;font-weight:600;color:var(--navy)">Facebook</div><div style="font-size:12px;color:var(--slate)">View Profile →</div></div></a>` : ''}
    ${!waUrl && !fbUrl ? '<p style="color:var(--slate);font-size:14px">Contact details will be added soon.</p>' : ''}
  `;

  // Card socials (sidebar)
  document.getElementById('tp-card-socials').innerHTML = `
    ${waUrl ? `<a href="${waUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(37,211,102,.12);border-radius:8px;color:#fff;text-decoration:none;font-size:13px;transition:all .2s" onmouseover="this.style.background='rgba(37,211,102,.22)'" onmouseout="this.style.background='rgba(37,211,102,.12)'"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> <span>WhatsApp</span></a>` : ''}
    ${fbUrl ? `<a href="${fbUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(66,103,178,.2);border-radius:8px;color:#fff;text-decoration:none;font-size:13px;transition:all .2s" onmouseover="this.style.background='rgba(66,103,178,.35)'" onmouseout="this.style.background='rgba(66,103,178,.2)'"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg> <span>Facebook</span></a>` : ''}
  `;

  // Other team members grid
  document.getElementById('tp-other-members').innerHTML = teamData.map((tm, i) =>
    `<div onclick="openTeamProfile('${tm.id}')" style="background:rgba(255,255,255,.06);border:1px solid rgba(201,168,76,.15);border-radius:var(--radius);padding:16px;text-align:center;cursor:pointer;transition:all .2s${String(tm.id) === String(id) ? ';border-color:var(--gold);background:rgba(201,168,76,.1)' : ''}" onmouseover="this.style.background='rgba(201,168,76,.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='${String(tm.id) === String(id) ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.06)'}'${String(tm.id) === String(id) ? '' : ";this.style.transform=''"}>
      <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:2px solid ${String(tm.id) === String(id) ? 'var(--gold)' : 'rgba(201,168,76,.3)'};margin:0 auto 10px">
        ${tm.pic ? `<img src="${tm.pic}" style="width:100%;height:100%;object-fit:cover;object-position:center top">` : `<div style="width:100%;height:100%;background:var(--navy-mid);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:18px;color:var(--gold-light);font-weight:700">${tm.initials}</div>`}
      </div>
      <div style="font-size:12px;font-weight:600;color:${String(tm.id) === String(id) ? 'var(--gold-light)' : '#fff'}">${tm.name}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px">${tm.role}</div>
    </div>`
  ).join('');

  // Switch view
  switchView('view-team-profile');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeTeamProfile() {
  switchView('view-landing');
  setTimeout(() => scroll2('team-land'), 100);
}


// EVENT REGISTRATION 
let currentRegEvent = null;

function openEventRegistration(e) {
  currentRegEvent = e;

  // Populate modal with event details
  document.getElementById('event-reg-title').textContent = 'Register — ' + e.title;
  document.getElementById('event-reg-day').textContent = e.day;
  document.getElementById('event-reg-mon').textContent = e.mon;
  document.getElementById('event-reg-name').textContent = e.title;
  document.getElementById('event-reg-meta').textContent = ' ' + (e.location || e.meta) + '  ·   ' + (e.time || 'TBA');

  // Type badge
  const badge = document.getElementById('event-reg-type-badge');
  badge.innerHTML = e.type === 'free'
    ? '<span style="background:rgba(47,133,90,.25);color:#68D391;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700"> Free Entry</span>'
    : e.type === 'online'
      ? '<span style="background:rgba(43,108,176,.25);color:#90CDF4;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700"> Online Event</span>'
      : '<span style="background:rgba(201,168,76,.2);color:var(--gold-light);padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700"> Ticketed Event</span>';

  // Show payment section for paid events
  const payDiv = document.getElementById('event-reg-payment');
  if (payDiv) payDiv.style.display = e.type === 'paid' ? 'block' : 'none';

  // Pre-fill WhatsApp button
  const waBtn = document.getElementById('event-reg-wa-btn');
  if (waBtn) {
    const msg = encodeURIComponent('Hello TCMI, I would like to register for: ' + e.title + ' on ' + e.day + ' ' + e.mon + ' ' + (e.year || '2026') + '. Please confirm my spot.');
    waBtn.href = 'https://wa.me/61488060612?text=' + msg;
  }

  // Clear form
  ['reg-name', 'reg-email', 'reg-phone', 'reg-message'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const countEl = document.getElementById('reg-count');
  if (countEl) countEl.value = '1';

  openModal('modal-event-reg');
}

async function submitEventReg() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const count = document.getElementById('reg-count').value;
  const message = document.getElementById('reg-message').value.trim();

  if (!name) { showToast('Please enter your full name', 'err'); return; }
  if (!email) { showToast('Please enter your email address', 'err'); return; }

  const e = currentRegEvent;
  if (!e) return;

  try {
    await window.TCMI_API.api('POST', '/api/events/' + e.id + '/register', {
      name, email, phone, count, message
    });

    closeModal('modal-event-reg');

    const waMsg = encodeURIComponent(
      'Hello TCMI! I have just registered for ' + e.title +
      ' (' + e.day + ' ' + e.mon + ' ' + (e.year || '2026') + ').\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      (phone ? 'Phone: ' + phone + '\n' : '') +
      'Attendees: ' + count + '\n' +
      (message ? 'Message: ' + message : '') +
      '\n\nPlease confirm my registration. Thank you!'
    );

    showToast('Registration submitted! Opening WhatsApp to confirm…');

    setTimeout(function () {
      window.open('https://wa.me/61488060612?text=' + waMsg, '_blank');
    }, 800);

    addNotif('New registration for ' + e.title + ' from ' + name, 'var(--success)');
  } catch (err) {
    showToast('Failed to submit registration: ' + err.message, 'err');
  }
}

// EDIT TEAM MEMBER 
let editTeamNewPic = null;

async function addTeamMember(e) {
  e.preventDefault();
  const name = document.getElementById('tm-name').value.trim();
  const role = document.getElementById('tm-role').value.trim();
  const wa = document.getElementById('tm-whatsapp').value.trim().replace(/[^0-9]/g, '');
  const fb = document.getElementById('tm-facebook').value.trim();
  let fd = new FormData();
  fd.append('name', name);
  fd.append('role', role);
  fd.append('whatsapp', wa);
  fd.append('facebook', fb);
  if (newTeamPic) fd.append('pic', newTeamPic);

  try { await window.TCMI_API.admin.addTeamMember(fd); } catch (err) { }

  closeModal('modal-add-team-member');
  e.target.reset();
  const prev = document.getElementById('tm-pic-preview');
  if (prev) prev.src = '';
  newTeamPic = null;
  renderAdmin();
  renderLandingTeam();
  showToast('Team member added!');
}

async function openEditTeamMember(id) {
  let teamData = [];
  try { teamData = await window.TCMI_API.public.getTeam(); } catch (e) { }
  const m = teamData.find(x => String(x.id) === String(id));
  if (!m) return;
  document.getElementById('edit-tm-index').value = id;
  document.getElementById('edit-tm-name').value = m.name || '';
  document.getElementById('edit-tm-role').value = m.role || '';
  document.getElementById('edit-tm-whatsapp').value = m.whatsapp || '';
  document.getElementById('edit-tm-facebook').value = m.facebook || '';
  const prev = document.getElementById('edit-tm-pic-preview');
  if (prev) prev.src = m.pic || '';
  editTeamNewPic = null;
  openModal('modal-edit-team-member');
}

async function saveEditTeamMember() {
  const id = document.getElementById('edit-tm-index').value;
  const name = document.getElementById('edit-tm-name').value.trim();
  const role = document.getElementById('edit-tm-role').value.trim();
  const wa = document.getElementById('edit-tm-whatsapp').value.trim().replace(/[^0-9]/g, '');
  const fb = document.getElementById('edit-tm-facebook').value.trim();
  let fd = new FormData();
  fd.append('name', name);
  fd.append('role', role);
  fd.append('whatsapp', wa);
  fd.append('facebook', fb);
  if (editTeamNewPic) fd.append('pic', editTeamNewPic);

  try { await window.TCMI_API.admin.updateTeamMember(id, fd); } catch (err) { }

  closeModal('modal-edit-team-member');
  renderAdmin();
  renderLandingTeam();
  showToast('Team member updated!');
}

async function deleteTeamMember(id) {
  try { await window.TCMI_API.admin.deleteTeamMember(id); } catch (err) { }
  renderAdmin();
  renderLandingTeam();
  showToast('Removed.');
}

function previewEditTeamPic(inp) { const file = inp.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = e => { editTeamNewPic = e.target.result; const prev = document.getElementById('edit-tm-pic-preview'); if (prev) prev.src = editTeamNewPic; }; reader.readAsDataURL(file); }
// CO-FOUNDER PROFILE MANAGEMENT 
let cofounderNewPic = null;

function previewCofounderPic(inp) {
  const file = inp.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    cofounderNewPic = e.target.result;
    const prev = document.getElementById('cofounder-edit-preview');
    if (prev) prev.src = cofounderNewPic;
  };
  reader.readAsDataURL(file);
}

async function saveCofounderProfile() {
  const name = document.getElementById('cf-name').value.trim();
  const title = document.getElementById('cf-title').value.trim();
  const roles = document.getElementById('cf-roles').value.trim();
  const bio1 = document.getElementById('cf-bio1').value.trim();
  const bio2 = document.getElementById('cf-bio2').value.trim();
  const quote = document.getElementById('cf-quote').value.trim();
  const wa = document.getElementById('cf-whatsapp').value.trim();
  const fb = document.getElementById('cf-facebook').value.trim();

  let fd = new FormData();
  fd.append('name', name);
  fd.append('title', title);
  fd.append('roles', roles);
  fd.append('bio1', bio1);
  fd.append('bio2', bio2);
  fd.append('quote', quote);
  fd.append('whatsapp', wa);
  fd.append('facebook', fb);
  if (cofounderNewPic) {
    // Assuming cofounderNewPic is base64 for now, but API might expect file.
    // Assuming api_bridge handles it or API accepts base64 via json wrapper.
    fd.append('photo', cofounderNewPic);
  }

  try { await window.TCMI_API.admin.updateCofounder(fd); } catch (e) { }

  const nameHeading = document.getElementById('cofounder-name-heading');
  if (nameHeading) nameHeading.textContent = name;
  const namePlate = document.getElementById('cofounder-name-plate');
  if (namePlate) namePlate.textContent = name;
  const bio1El = document.getElementById('cofounder-bio1');
  if (bio1El) bio1El.textContent = bio1;
  const bio2El = document.getElementById('cofounder-bio2');
  if (bio2El) bio2El.textContent = bio2;
  const fbLink = document.getElementById('cofounder-fb-link');
  if (fbLink) fbLink.href = fb;
  const waLink = document.getElementById('cofounder-wa-link');
  if (waLink) waLink.href = 'https://wa.me/' + wa + '?text=Hello';

  if (cofounderNewPic) {
    const photoEl = document.getElementById('cofounder-photo');
    if (photoEl) photoEl.src = cofounderNewPic;
    const adminPhoto = document.getElementById('admin-cofounder-photo');
    if (adminPhoto) adminPhoto.src = cofounderNewPic;
    cofounderNewPic = null;
  }
  const adminName = document.getElementById('admin-cofounder-name');
  if (adminName) adminName.textContent = name;

  closeModal('modal-edit-cofounder');
  showToast('Co-Founder profile updated on homepage!');
}

async function initAdminCofounder() {
  const el = document.getElementById('admin-cofounder-photo');
  let data = null;
  try { data = await window.TCMI_API.public.getCofounder(); } catch (e) { }
  if (el && data && data.photo) {
    el.src = data.photo;
  } else if (el) {
    const mainPhoto = document.getElementById('cofounder-photo');
    if (mainPhoto) el.src = mainPhoto.src;
  }
}

// SPONSORS SLIDER 
let sponsorNewLogo = null;

async function renderSponsorsSlider() {
  const track = document.getElementById('sponsors-track');
  if (!track) return;
  let data = [];
  try { data = await window.TCMI_API.public.getSponsors(); } catch (e) { }
  if (!data || !data.length) {
    track.innerHTML = '<div style="padding:20px 40px;color:var(--slate);font-size:14px">No sponsors added yet.</div>';
    track.style.animation = 'none';
    return;
  }
  const cards = data.map(s => `<div class="sponsor-card">` + (s.logo_url ? `<img src="${s.logo_url}" class="sponsor-logo">` : `<div class="sponsor-logo-placeholder">${s.name}</div>`) + `<div class="sponsor-name">${s.name}</div></div>`).join('');
  track.innerHTML = cards + cards;
  track.style.animation = 'sponsorSlide ' + Math.max(10, data.length * 4) + 's linear infinite';
}

async function renderAdminSponsors() {
  const el = document.getElementById('admin-sponsors-table'); if (!el) return;
  let data = [];
  try { data = await window.TCMI_API.public.getSponsors(); } catch (e) { }
  el.innerHTML = data.length ? data.map(s => `<tr>
    <td>${s.logo_url ? `<img src="${s.logo_url}" style="height:36px;object-fit:contain;border-radius:4px">` : '<span style="font-size:20px"></span>'}</td>
    <td><strong>${s.name}</strong></td>
    <td><button class="btn-sm btn-danger" style="font-size:11px" onclick="deleteSponsor('${s.id}')">Remove</button></td>
  </tr>`).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--slate);padding:20px">No sponsors added.</td></tr>';
}

async function deleteSponsor(id) {
  try { await window.TCMI_API.admin.deleteSponsor(id); } catch (e) { }
  renderSponsorsSlider();
  renderAdminSponsors();
  showToast('Sponsor removed.');
}

// GALLERY 
let galleryNewPhoto = null;

function previewGalleryPhoto(inp) {
  const file = inp.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    galleryNewPhoto = e.target.result;
    document.getElementById('gallery-preview-wrap').style.display = 'block';
    document.getElementById('gallery-preview-img').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addGalleryPhoto() {
  if (!galleryNewPhoto) { showToast('Please select a photo', 'err'); return; }
  const caption = document.getElementById('gallery-caption').value.trim();
  DB.gallery.push({ id: 'g' + Date.now(), src: galleryNewPhoto, caption });
  galleryNewPhoto = null;
  closeModal('modal-add-gallery');
  document.getElementById('gallery-caption').value = '';
  document.getElementById('gallery-preview-wrap').style.display = 'none';
  renderGallery();
  renderAdminGallery();
  showToast('Photo added to gallery!');
}

function renderGallery() {
  const track = document.getElementById('gallery-track');
  const empty = document.getElementById('gallery-empty');
  if (!track) return;

  if (!DB.gallery || !DB.gallery.length) {
    track.innerHTML = '';
    track.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }

  track.style.display = 'flex';
  if (empty) empty.style.display = 'none';

  const makeCard = (p) => {
    const div = document.createElement('div');
    div.className = 'gallery-slide-card';
    div.innerHTML = `
      <img src="${p.src}" alt="${p.caption || 'Gallery photo'}">
      <div class="gallery-slide-overlay">
        <div class="gallery-slide-caption">${p.caption || ''}</div>
      </div>`;
    div.addEventListener('click', () => openLightbox(p.id));
    return div;
  };

  track.innerHTML = '';
  // Render twice for seamless infinite loop
  DB.gallery.forEach(p => track.appendChild(makeCard(p)));
  DB.gallery.forEach(p => {
    const clone = makeCard(p);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  // Adjust animation speed based on count
  const speed = Math.max(14, DB.gallery.length * 7);
  track.style.animation = `gallerySlide ${speed}s linear infinite`;
}

function openLightbox(id) {
  const p = DB.gallery.find(x => x.id === id); if (!p) return;
  document.getElementById('lightbox-img').src = p.src;
  document.getElementById('lightbox-caption').textContent = p.caption || '';
  const lb = document.getElementById('gallery-lightbox');
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('gallery-lightbox').style.display = 'none';
  document.body.style.overflow = '';
}

function renderAdminGallery() {
  const el = document.getElementById('admin-gallery-grid');
  if (!el) return;
  if (!DB.gallery.length) {
    el.innerHTML = '<div style="color:var(--slate);font-size:13px">No photos. Click + Upload Photo.</div>';
    renderGallery(); // keep landing in sync
    return;
  }
  el.innerHTML = DB.gallery.map((p, i) => `
    <div style="position:relative;border-radius:8px;overflow:hidden;aspect-ratio:4/3">
      <img src="${p.src}" style="width:100%;height:100%;object-fit:cover">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;flex-direction:column;justify-content:space-between;padding:8px">
        <button onclick="DB.gallery.splice(${i},1);renderAdminGallery();renderGallery();showToast('Photo removed.')" style="background:var(--danger);border:none;color:#fff;border-radius:4px;padding:3px 7px;font-size:10px;cursor:pointer;align-self:flex-end"> Remove</button>
        <div style="font-size:10px;color:rgba(255,255,255,.8);background:rgba(0,0,0,.5);border-radius:4px;padding:3px 6px">${p.caption || 'No caption'}</div>
      </div>
    </div>`).join('');
  renderGallery(); // keep landing slider in sync
}

// TESTIMONIALS 
let testiNewPic = null;

function previewTestiPic(inp) {
  const file = inp.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    testiNewPic = e.target.result;
    document.getElementById('testi-pic-preview').style.display = 'block';
    document.getElementById('testi-pic-img').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addTestimonial() {
  const quote = document.getElementById('testi-quote').value.trim();
  const name = document.getElementById('testi-name').value.trim();
  if (!quote || !name) { showToast('Message and name required', 'err'); return; }
  DB.testimonials.push({ id: 't' + Date.now(), quote, name, role: document.getElementById('testi-role').value.trim(), pic: testiNewPic || null });
  testiNewPic = null;
  closeModal('modal-add-testimonial');
  ['testi-quote', 'testi-name', 'testi-role'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('testi-pic-preview').style.display = 'none';
  renderTestimonials();
  renderAdminTestimonials();
  showToast('Testimonial added!');
}

function renderTestimonials() {
  const track = document.getElementById('testimonials-track');
  const empty = document.getElementById('testimonials-empty');
  if (!track) return;

  if (!DB.testimonials || !DB.testimonials.length) {
    track.innerHTML = '';
    track.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }

  track.style.display = 'flex';
  if (empty) empty.style.display = 'none';

  const PREVIEW_LEN = 120;

  const makeCard = (t, isClone) => {
    const card = document.createElement('div');
    card.className = 'testi-card';
    card.style.cursor = 'pointer';
    if (isClone) card.setAttribute('aria-hidden', 'true');

    const isLong = t.quote.length > PREVIEW_LEN;
    const preview = isLong ? t.quote.slice(0, PREVIEW_LEN).trim() + '…' : t.quote;

    const avatarHTML = t.pic
      ? `<div class="testi-avatar"><img src="${t.pic}" alt="${t.name}"></div>`
      : `<div class="testi-avatar-init">${t.name.charAt(0).toUpperCase()}</div>`;

    card.innerHTML = `
      <div>
        <div class="testi-open-quote">"</div>
        <div class="testi-quote-text">${preview}</div>
        ${isLong ? `<div style="font-size:11px;color:var(--gold-light);margin-top:6px;font-style:normal;font-weight:600">Read more...</div>` : ''}
      </div>
      <div class="testi-author-row">
        ${avatarHTML}
        <div>
          <div class="testi-name">${t.name}</div>
          ${t.role ? `<div class="testi-role">${t.role}</div>` : ''}
        </div>
      </div>`;

    // Click opens full testimony
    card.addEventListener('click', () => openTestimony(t));

    // Hover pause — stop slider while hovering
    card.addEventListener('mouseenter', () => {
      const tr = document.getElementById('testimonials-track');
      if (tr) tr.style.animationPlayState = 'paused';
    });
    card.addEventListener('mouseleave', () => {
      const tr = document.getElementById('testimonials-track');
      if (tr) tr.style.animationPlayState = 'running';
    });

    return card;
  };

  track.innerHTML = '';
  DB.testimonials.forEach(t => track.appendChild(makeCard(t, false)));
  DB.testimonials.forEach(t => track.appendChild(makeCard(t, true)));

  const speed = Math.max(18, DB.testimonials.length * 8);
  track.style.animation = `testiSlide ${speed}s linear infinite`;
}

function slideTestimonials(dir) { /* replaced by auto-scroll */ }

function renderAdminTestimonials() {
  const el = document.getElementById('admin-testimonials-table'); if (!el) return;
  el.innerHTML = DB.testimonials.length ? DB.testimonials.map((t, i) => `<tr>
    <td><strong>${t.name}</strong>${t.role ? `<div style="font-size:11px;color:var(--slate)">${t.role}</div>` : ''}</td>
    <td style="font-size:12px;color:var(--slate)">${t.quote.slice(0, 60)}${t.quote.length > 60 ? '…' : ''}</td>
    <td><button class="btn-sm btn-danger" style="font-size:11px" onclick="DB.testimonials.splice(${i},1);renderAdminTestimonials();renderTestimonials();showToast('Removed.')">Remove</button></td>
  </tr>`).join('') : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--slate)">No testimonials yet.</td></tr>';
}


// SECURE PDF LESSON VIEWER 
let currentPdfId = null;

function renderMyLessons() {
  const listEl = document.getElementById('my-lessons-list'); if (!listEl) return;
  const filterEl = document.getElementById('my-lessons-course-filter');

  // Populate filter dropdown
  if (filterEl) {
    const cur = filterEl.value;
    filterEl.innerHTML = '<option value="">All Courses</option>' +
      DB.courses.filter(c => c.status === 'published').map(c => `<option value="${c.id}"${c.id === cur ? ' selected' : ''}>${c.title}</option>`).join('');
  }

  const filter = filterEl ? filterEl.value : '';
  const lessons = DB.lessons.filter(l => l.pdfData && (!filter || l.courseId === filter));

  if (!lessons.length) {
    listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--slate);font-size:13px">No PDF lessons available for your courses yet.</div>';
    return;
  }

  listEl.innerHTML = '';
  lessons.forEach(l => {
    const c = DB.courses.find(x => x.id === l.courseId);
    const btn = document.createElement('button');
    btn.style.cssText = 'width:100%;text-align:left;padding:12px 14px;border:none;border-radius:8px;margin-bottom:4px;cursor:pointer;transition:all .2s;background:' + (currentPdfId === l.id ? 'var(--gold-pale)' : 'transparent');
    btn.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="font-size:20px;flex-shrink:0"></div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:2px">${l.title}</div>
          ${c ? `<div style="font-size:11px;color:var(--slate)">${c.title}</div>` : ''}
          ${l.desc ? `<div style="font-size:11px;color:var(--slate-light);margin-top:2px">${l.desc.slice(0, 50)}${l.desc.length > 50 ? '…' : ''}</div>` : ''}
          <div style="font-size:10px;color:var(--slate-light);margin-top:3px"> ${l.date || '—'}</div>
        </div>
      </div>`;
    btn.addEventListener('mouseenter', function () { if (currentPdfId !== l.id) this.style.background = 'var(--cream)'; });
    btn.addEventListener('mouseleave', function () { if (currentPdfId !== l.id) this.style.background = 'transparent'; });
    btn.addEventListener('click', function () { openSecurePdf(l.id); });
    if (currentPdfId === l.id) btn.style.background = 'var(--gold-pale)';
    listEl.appendChild(btn);
  });
}

function openSecurePdf(lessonId) {
  const l = DB.lessons.find(x => x.id === lessonId); if (!l || !l.pdfData) return;
  currentPdfId = lessonId;
  renderMyLessons(); // refresh to highlight active

  const titleEl = document.getElementById('pdf-viewer-title');
  if (titleEl) titleEl.textContent = ' ' + l.title;

  const container = document.getElementById('pdf-viewer-container');
  if (!container) return;

  // Create secure viewer using object tag with sandbox
  // The PDF is embedded as base64 — no download button visible
  container.innerHTML = `
    <div style="position:relative;width:100%;height:100%;overflow:hidden">
      <!-- Security overlay to block right-click context menu -->
      <div id="pdf-security-overlay" style="position:absolute;inset:0;z-index:10;pointer-events:none"></div>
      <object
        id="secure-pdf-object"
        data="${l.pdfData}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&zoom=page-fit"
        type="application/pdf"
        style="width:100%;height:100%;border:none;display:block"
        oncontextmenu="return false">
        <!-- Fallback for browsers without native PDF support -->
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;text-align:center">
          <div style="font-size:48px"></div>
          <div style="font-size:15px;font-weight:600;color:var(--navy)">${l.title}</div>
          <div style="font-size:13px;color:var(--slate)">Your browser does not support inline PDF viewing. Please use a modern browser like Chrome, Firefox, or Edge to view this lesson.</div>
          <div style="background:var(--info-bg);color:var(--info);padding:8px 16px;border-radius:8px;font-size:12px"> This lesson is protected and cannot be downloaded.</div>
        </div>
      </object>
    </div>`;

  // Block right-click on the container
  container.oncontextmenu = e => { e.preventDefault(); return false; };
}

function openSecurePdfAdmin(lessonId) {
  // Admin/faculty preview — same viewer but shown in a modal
  const l = DB.lessons.find(x => x.id === lessonId); if (!l || !l.pdfData) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:20px';
  overlay.innerHTML = `
    <div style="width:100%;max-width:900px;height:90vh;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="background:var(--navy);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-radius:12px 12px 0 0">
        <div>
          <div style="font-family:var(--font-serif);font-size:16px;color:#fff"> ${l.title}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">Admin Preview — Students see this protected view</div>
        </div>
        <button onclick="this.closest('div[style*="position:fixed"]').remove()" style="background:rgba(255,255,255,.1);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px">&#x2715;</button>
      </div>
      <object data="${l.pdfData}#toolbar=0&navpanes=0" type="application/pdf" style="flex:1;width:100%;border:none"></object>
    </div>`;
  document.body.appendChild(overlay);
}


// HERO TICKER 
function renderHeroTicker() {
  const track = document.getElementById('hero-ticker-track');
  if (!track) return;

  // Build items: "Now Enrolling" always first, then events
  const staticItems = [
    { icon: '', text: 'Now Enrolling · 2026 Cohort Open', action: "openModal('modal-apply')" },
    { icon: '', text: 'Courses Now Open — Join a Track Today', action: "scroll2('courses-land')" },
  ];

  const eventItems = (DB.events || []).map(e => ({
    icon: e.type === 'free' ? '' : '',
    text: e.day + ' ' + e.mon + ' · ' + e.title + (e.meta ? ' @ ' + e.meta : ''),
    action: "openEventRegistration(" + JSON.stringify(e) + ")",
    event: e,
  }));

  const allItems = [...staticItems, ...eventItems];
  if (!allItems.length) return;

  const makeItem = (item) => {
    const span = document.createElement('span');
    span.className = 'hero-ticker-item';
    span.innerHTML = `<span>${item.icon}</span><span>${item.text}</span>`;
    if (item.event) {
      span.addEventListener('click', () => openEventRegistration(item.event));
    } else if (item.action) {
      span.setAttribute('onclick', item.action);
    }

    const sep = document.createElement('span');
    sep.className = 'hero-ticker-sep';
    sep.textContent = '·';
    return [span, sep];
  };

  const inner = document.createElement('div');
  inner.className = 'hero-ticker-inner';

  // Render twice for seamless loop
  [0, 1].forEach(() => {
    allItems.forEach(item => {
      const [span, sep] = makeItem(item);
      inner.appendChild(span);
      inner.appendChild(sep);
    });
  });

  // Adjust speed based on total content
  const speed = Math.max(18, allItems.length * 4);
  inner.style.animationDuration = speed + 's';

  track.innerHTML = '';
  track.appendChild(inner);
}

// Re-render ticker whenever events change
function refreshHeroTicker() { renderHeroTicker(); }


// ═══ OPEN FULL TESTIMONY ═══
function openTestimony(t) {
  // Avatar
  const avatarEl = document.getElementById('testi-modal-avatar');
  if (avatarEl) {
    avatarEl.innerHTML = t.pic
      ? `<img src="${t.pic}" alt="${t.name}" style="width:100%;height:100%;object-fit:cover;object-position:center top">`
      : `<div style="width:100%;height:100%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:18px;font-weight:700;color:var(--navy)">${t.name.charAt(0).toUpperCase()}</div>`;
  }
  // Text
  const nameEl = document.getElementById('testi-modal-name');
  const roleEl = document.getElementById('testi-modal-role');
  const quoteEl = document.getElementById('testi-modal-quote');
  const tagEl = document.getElementById('testi-modal-tag');
  if (nameEl) nameEl.textContent = t.name;
  if (roleEl) roleEl.textContent = t.role || '';
  if (quoteEl) quoteEl.textContent = t.quote;
  if (tagEl) tagEl.textContent = t.role ? t.name + ' — ' + t.role : t.name;
  openModal('modal-testimony');
}


// ═══ COURSE CARD → APPLY MODAL ═══
function openApplyFromCourse(cardEl) {
  // Extract course title from the card
  const titleEl = cardEl ? cardEl.querySelector('.course-land-title') : null;
  const courseTitle = titleEl ? titleEl.textContent.trim() : '';

  // Open the apply modal
  openModal('modal-apply');

  // Wait a tick for modal to render, then pre-select course on Step 4
  setTimeout(function () {
    // Try to tick the matching course checkbox in Step 4
    if (courseTitle) {
      const checkboxes = document.querySelectorAll('#modal-apply input[type="checkbox"]');
      checkboxes.forEach(function (cb) {
        if (cb.parentElement && cb.parentElement.textContent.trim().toLowerCase().includes(courseTitle.toLowerCase().slice(0, 20))) {
          cb.checked = true;
        }
      });
    }
  }, 300);
}


// ═══════════════════════════════════════════════════════════
// BOOKSTORE SYSTEM
// ═══════════════════════════════════════════════════════════

let bsCurrentBookId = null;   // book being viewed/added to cart
let bsResetCode = null;    // generated reset code
let bsResetEmail = null;    // email for reset

// ── RENDER LANDING BOOKS ──
function renderLandBooks() {
  const grid = document.getElementById('land-books-grid');
  const empty = document.getElementById('land-books-empty');
  if (!grid) return;

  const q = (document.getElementById('land-book-search')?.value || '').toLowerCase();
  const cat = document.getElementById('land-book-cat')?.value || '';

  const filtered = DB.books.filter(b =>
    (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) &&
    (!cat || b.cat === cat)
  );

  if (!filtered.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = '';
  filtered.forEach(b => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:all .25s;cursor:pointer;box-shadow:var(--shadow-sm)';
    card.innerHTML = `
      <div style="height:160px;background:linear-gradient(135deg,var(--navy) 0%,#1a3a6e 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
        ${b.img ? `<img src="${b.img}" style="width:100%;height:100%;object-fit:cover">` :
        `<div style="text-align:center;padding:12px">
            <div style="font-family:var(--font-serif);font-size:14px;font-weight:700;color:#fff;line-height:1.3">${b.title}</div>
            <div style="font-size:11px;color:var(--gold-light);margin-top:6px">${b.author}</div>
          </div>`}
        <div style="position:absolute;top:8px;right:8px;background:${b.price === 0 || b.price === '0' ? 'var(--success)' : 'var(--gold)'};color:${b.price === 0 || b.price === '0' ? '#fff' : 'var(--navy)'};padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700">
          ${b.price === 0 || parseFloat(b.price) === 0 ? 'Free' : 'AU$' + parseFloat(b.price).toFixed(2)}
        </div>
      </div>
      <div style="padding:14px">
        <div style="font-size:10px;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px">${b.cat || 'Book'}</div>
        <div style="font-family:var(--font-serif);font-size:15px;font-weight:600;color:var(--navy);margin-bottom:4px;line-height:1.3">${b.title}</div>
        <div style="font-size:12px;color:var(--slate);margin-bottom:12px">${b.author}</div>
        <div style="font-size:12px;color:var(--slate);margin-bottom:14px;line-height:1.5">${b.desc ? b.desc.slice(0, 80) + (b.desc.length > 80 ? '…' : '') : ''}</div>
        <button style="width:100%;background:#e02020;color:#fff;font-weight:700;border:none;padding:9px;border-radius:7px;font-size:13px;cursor:pointer;font-family:var(--font-sans);transition:all .2s" onmouseover="this.style.background='#c41a1a'" onmouseout="this.style.background='#e02020'" onclick="openBookDetail('${b.id}');event.stopPropagation()">View & Buy</button>
      </div>`;
    card.addEventListener('click', () => openBookDetail(b.id));
    card.addEventListener('mouseenter', function () { this.style.boxShadow = 'var(--shadow-md)'; this.style.transform = 'translateY(-3px)'; });
    card.addEventListener('mouseleave', function () { this.style.boxShadow = 'var(--shadow-sm)'; this.style.transform = ''; });
    grid.appendChild(card);
  });
}

// ── BOOK DETAIL MODAL ──
function openBookDetail(bookId) {
  const b = DB.books.find(x => x.id === bookId);
  if (!b) return;
  bsCurrentBookId = bookId;

  document.getElementById('bd-title').textContent = b.title;
  document.getElementById('bd-cat').textContent = b.cat || 'Book';
  document.getElementById('bd-name').textContent = b.title;
  document.getElementById('bd-author').textContent = 'by ' + b.author;
  document.getElementById('bd-desc').textContent = b.desc || '';
  document.getElementById('bd-price').textContent = parseFloat(b.price) === 0 ? 'Free' : 'AU$' + parseFloat(b.price).toFixed(2);

  const cover = document.getElementById('bd-cover');
  cover.innerHTML = b.img
    ? `<img src="${b.img}" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="padding:16px;text-align:center"><div style="font-family:var(--font-serif);font-size:15px;font-weight:700;color:#fff;line-height:1.4">${b.title}</div><div style="font-size:12px;color:var(--gold-light);margin-top:8px">${b.author}</div></div>`;

  openModal('modal-book-detail');
}

function addToCartFromDetail(proceedToCheckout) {
  if (!bsCurrentBookId) return;
  /* replaced */
  if (!b) return;
  const existing = cart.find(c => c.id === bsCurrentBookId);
  if (existing) { existing.qty++; } else { cart.push({ ...b, qty: 1 }); }
  renderCart();
  renderLandCart();
  updateLandCartBadge();
  closeModal('modal-book-detail');
  if (proceedToCheckout) {
    // Go straight to register/login/checkout
    setTimeout(startCheckout, 200);
  } else {
    showToast(b.title + ' added to cart!');
  }
}

// ── LANDING CART ──
function renderLandCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('land-cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  // Show logged-in bookstore user
  const tag = document.getElementById('bs-user-tag');
  if (tag) {
    if (currentBookstoreUser) {
      tag.textContent = 'Hi, ' + currentBookstoreUser.username;
      tag.style.display = 'block';
    } else {
      tag.style.display = 'none';
    }
  }
}

function updateLandCartBadge() { renderLandCart(); }

// ── CHECKOUT FLOW ──
function startCheckout() {
  if (!cart.length) { showToast('Your cart is empty', 'err'); return; }
  if (currentBookstoreUser) {
    openBsCheckout();
  } else {
    openModal('modal-bs-register');
  }
}

function openBsCheckout() {
  // Build order summary
  const total = cart.reduce((s, c) => s + (parseFloat(c.price) * c.qty), 0);
  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();

  document.getElementById('bs-pay-ref').textContent = orderId;
  document.getElementById('bs-receipt').value = '';

  document.getElementById('bs-order-summary').innerHTML = `
    <div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">Order Summary</div>
    ${cart.map(c => `
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--navy)">${c.title} <span style="color:var(--slate)">x${c.qty}</span></span>
        <span style="font-weight:600;color:var(--navy)">AU$${(parseFloat(c.price) * c.qty).toFixed(2)}</span>
      </div>`).join('')}
    <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;color:var(--navy);margin-top:10px">
      <span>Total</span><span>AU$${total.toFixed(2)}</span>
    </div>
    <div style="font-size:11px;color:var(--slate);margin-top:4px">Order ID: <strong>${orderId}</strong></div>`;

  // Store temp orderId
  document.getElementById('bs-pay-ref').dataset.orderId = orderId;
  closeModal('modal-bs-register');
  closeModal('modal-bs-login');
  openModal('modal-bs-checkout');
}

function bsSubmitOrder() {
  const receipt = document.getElementById('bs-receipt').value.trim();
  if (!receipt) { showToast('Please enter your payment reference', 'err'); return; }

  const orderId = document.getElementById('bs-pay-ref').dataset.orderId || ('ORD-' + Date.now());
  const user = currentBookstoreUser;
  const total = cart.reduce((s, c) => s + (parseFloat(c.price) * c.qty), 0);

  const order = {
    id: orderId,
    email: user.email,
    username: user.username,
    name: user.name,
    items: JSON.parse(JSON.stringify(cart)),
    total: total.toFixed(2),
    date: new Date().toLocaleDateString('en-AU'),
    status: 'Pending',
    paymentRef: receipt,
  };

  bookstoreOrders.push(order);

  // Add to user history
  if (bookstoreAccounts[user.email]) {
    bookstoreAccounts[user.email].orders = bookstoreAccounts[user.email].orders || [];
    bookstoreAccounts[user.email].orders.push(orderId);
  }

  // Clear cart
  cart = [];
  renderCart();
  renderLandCart();

  closeModal('modal-bs-checkout');
  showToast('Order placed! We will verify your payment and confirm shortly.');
  addNotif('New bookstore order ' + orderId + ' from ' + user.name + ' — AU$' + order.total, 'var(--success)');

  // Refresh admin panel
  if (currentUser && currentUser.role === 'admin') renderAdmin();
}

// ── REGISTER ──
function bsRegister() {
  const name = document.getElementById('bsr-name').value.trim();
  const uname = document.getElementById('bsr-username').value.trim();
  const email = document.getElementById('bsr-email').value.trim().toLowerCase();
  const pw = document.getElementById('bsr-pw').value;
  const pw2 = document.getElementById('bsr-pw2').value;
  if (!name || !uname || !email || !pw) { showToast('All fields required', 'err'); return; }
  if (pw !== pw2) { showToast('Passwords do not match', 'err'); return; }
  if (pw.length < 6) { showToast('Password must be at least 6 characters', 'err'); return; }
  if (bookstoreAccounts[email]) { showToast('An account with this email already exists. Please sign in.', 'err'); return; }

  bookstoreAccounts[email] = { name, username: uname, email, pw, orders: [] };
  currentBookstoreUser = { name, username: uname, email };

  showToast('Account created! Proceeding to checkout...');
  setTimeout(openBsCheckout, 400);
}

// ── LOGIN ──
function bsLogin() {
  const input = document.getElementById('bsl-email').value.trim().toLowerCase();
  const pw = document.getElementById('bsl-pw').value;

  // Find by email or username
  const acct = bookstoreAccounts[input] ||
    Object.values(bookstoreAccounts).find(a => a.username.toLowerCase() === input);

  if (!acct || acct.pw !== pw) {
    showToast('Invalid email/username or password', 'err'); return;
  }

  currentBookstoreUser = { name: acct.name, username: acct.username, email: acct.email };
  showToast('Welcome back, ' + acct.name + '!');
  setTimeout(openBsCheckout, 400);
}

// ── PASSWORD RESET ──
function bsSendReset() {
  const email = document.getElementById('reset-email').value.trim().toLowerCase();
  if (!bookstoreAccounts[email]) { showToast('No account found with this email', 'err'); return; }

  // Generate 6-digit code
  bsResetCode = String(Math.floor(100000 + Math.random() * 900000));
  bsResetEmail = email;

  // Simulate email send via WhatsApp notification (since no SMTP)
  addNotif('Password reset code for ' + email + ': ' + bsResetCode + ' (share securely)', 'var(--warn)');

  // Show code in a toast and alert (simulating email delivery)
  showToast('Reset code generated! Check admin notifications for the code.');
  alert('SIMULATED EMAIL to ' + email + ':\n\nYour TCMI Bookstore password reset code is:\n\n' + bsResetCode + '\n\nThis code is valid for this session.\nFrom: info.thecornerstone@gmail.com');

  document.getElementById('reset-step1').style.display = 'none';
  document.getElementById('reset-step2').style.display = 'block';
}

function bsConfirmReset() {
  const code = document.getElementById('reset-code').value.trim();
  const npw = document.getElementById('reset-newpw').value;
  const npw2 = document.getElementById('reset-newpw2').value;

  if (code !== bsResetCode) { showToast('Incorrect reset code', 'err'); return; }
  if (npw !== npw2) { showToast('Passwords do not match', 'err'); return; }
  if (npw.length < 6) { showToast('Password must be at least 6 characters', 'err'); return; }

  bookstoreAccounts[bsResetEmail].pw = npw;
  bsResetCode = null; bsResetEmail = null;
  closeModal('modal-bs-reset');
  showToast('Password reset successfully! You can now sign in.');
  openModal('modal-bs-login');
}

// ── MODAL SWITCHERS ──
function switchToLogin() { closeModal('modal-bs-register'); openModal('modal-bs-login'); }
function switchToRegister() { closeModal('modal-bs-login'); openModal('modal-bs-register'); }
function switchToReset() { closeModal('modal-bs-login'); openModal('modal-bs-reset'); document.getElementById('reset-step1').style.display = 'block'; document.getElementById('reset-step2').style.display = 'none'; }

// ── EDIT BOOK (admin) ──
function openEditBook(bookId) {
  const b = DB.books.find(x => x.id === bookId);
  if (!b) return;
  document.getElementById('edit-book-id').value = bookId;
  document.getElementById('edit-book-title').value = b.title;
  document.getElementById('edit-book-author').value = b.author;
  document.getElementById('edit-book-price').value = b.price;
  document.getElementById('edit-book-cat').value = b.cat || 'Book';
  document.getElementById('edit-book-desc').value = b.desc || '';
  openModal('modal-edit-book');
}

function saveEditBook() {
  const id = document.getElementById('edit-book-id').value;
  const b = DB.books.find(x => x.id === id);
  if (!b) return;
  b.title = document.getElementById('edit-book-title').value.trim() || b.title;
  b.author = document.getElementById('edit-book-author').value.trim() || b.author;
  b.price = parseFloat(document.getElementById('edit-book-price').value) || 0;
  b.cat = document.getElementById('edit-book-cat').value;
  b.desc = document.getElementById('edit-book-desc').value.trim();
  closeModal('modal-edit-book');
  renderLandBooks();
  renderBooksGrid('books-grid', true);
  showToast('Book updated!');
}

// ── ADMIN ORDERS TABLE ──
function renderAdminOrders() {
  const el = document.getElementById('admin-orders-table');
  if (!el) return;
  if (!bookstoreOrders.length) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--slate)">No orders yet.</td></tr>';
    return;
  }
  el.innerHTML = bookstoreOrders.map((o, i) => `<tr>
    <td style="font-family:monospace;font-size:11px">${o.id}</td>
    <td><strong>${o.name}</strong><div style="font-size:11px;color:var(--slate)">${o.email}</div></td>
    <td style="font-size:12px">${o.items.map(x => x.title).join(', ')}</td>
    <td style="font-weight:600">AU$${o.total}</td>
    <td><span class="badge bg-${o.status === 'Confirmed' ? 'success' : o.status === 'Rejected' ? 'danger' : 'warn'}">${o.status}</span></td>
    <td style="white-space:nowrap">
      <button class="btn-sm btn-golden" onclick="confirmOrder(${i})">Confirm</button>
      <button class="btn-sm btn-danger" style="margin-left:4px" onclick="rejectOrder(${i})">Reject</button>
    </td>
  </tr>`).join('');
}

function confirmOrder(i) {
  if (bookstoreOrders[i]) bookstoreOrders[i].status = 'Confirmed';
  renderAdminOrders();
  showToast('Order confirmed!');
}

function rejectOrder(i) {
  if (bookstoreOrders[i]) bookstoreOrders[i].status = 'Rejected';
  renderAdminOrders();
  showToast('Order rejected.');
}


// ═══ BOOKSTORE LOGIN FROM FOOTER ═══
function openBsLoginFromFooter() {
  if (currentBookstoreUser) {
    // Already logged in — scroll to bookstore and show cart
    scroll2('bookstore-land');
    setTimeout(() => { showToast('Welcome back, ' + currentBookstoreUser.username + '! Your cart is ready.'); }, 300);
  } else {
    // Open login modal
    openModal('modal-bs-login');
  }
}

// ═══ ADMIN: RENDER CART ACTIVITY ═══
function renderAdminCarts() {
  const el = document.getElementById('admin-carts-table');
  const countEl = document.getElementById('admin-cart-count');
  if (!el) return;

  // Gather all bookstore accounts that have items in the shared cart
  // Since cart is shared (single session), show current cart + all registered accounts
  const rows = [];

  // Current active cart (whoever is browsing)
  if (cart && cart.length) {
    const user = currentBookstoreUser;
    const total = cart.reduce((s, c) => s + (parseFloat(c.price) * c.qty), 0);
    rows.push({
      name: user ? user.name : 'Guest',
      email: user ? user.email : '—',
      items: cart.map(c => c.title + ' x' + c.qty).join(', '),
      total: 'AU$' + total.toFixed(2),
      status: 'Active',
    });
  }

  // Orders that are pending (submitted but not confirmed)
  const pending = bookstoreOrders.filter(o => o.status === 'Pending');
  pending.forEach(o => {
    rows.push({
      name: o.name,
      email: o.email,
      items: o.items.map(c => c.title + ' x' + c.qty).join(', '),
      total: 'AU$' + o.total,
      status: 'Pending Payment',
    });
  });

  if (countEl) countEl.textContent = rows.length ? rows.length : '';

  if (!rows.length) {
    el.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--slate)">No active carts or pending orders.</td></tr>';
    return;
  }

  el.innerHTML = rows.map(r => `<tr>
    <td><strong>${r.name}</strong><div style="font-size:11px;color:var(--slate)">${r.email}</div></td>
    <td style="font-size:12px;color:var(--slate)">${r.items}</td>
    <td style="font-weight:600;color:var(--navy)">${r.total}</td>
    <td><span class="badge bg-${r.status === 'Active' ? 'info' : 'warn'}">${r.status}</span></td>
  </tr>`).join('');
}

// Boot
document.getElementById('view-landing').classList.add('active');
renderLandEvents();









