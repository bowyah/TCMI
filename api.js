// api.js — Drop this file alongside index.html on your server
// This replaces all in-memory DB calls with real API calls to the backend.
// Set API_BASE to your backend URL before uploading.

'use strict';

// Debug: confirm api.js is loaded
if (typeof window !== 'undefined' && window.console) console.log('api.js loaded (compat shims active)');

// ── API BASE (reads from .env via api/config.js) ────────────────────
// api/config.js.php injects window.TCMI_CONFIG from the server .env.
// Fallback: auto-detect from the page URL so local dev still works
// even without the config script tag.
const API_BASE = (
  (window.TCMI_CONFIG && window.TCMI_CONFIG.apiBase) ||
  (window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/api')
).replace(/\/+$/, '');
// ────────────────────────────────────────────────────────────────────


// Token management
const token = {
  get:    ()    => localStorage.getItem('tcmi_token'),
  set:    (t)   => localStorage.setItem('tcmi_token', t),
  clear:  ()    => localStorage.removeItem('tcmi_token'),
};

// Core fetch wrapper
async function api(method, path, body, isFormData = false) {
  const headers = {};
  const tok = token.get();
  if (tok) headers['Authorization'] = `Bearer ${tok}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 401) { token.clear(); return null; }
  if (!res.ok) {
    // Try to parse JSON error, but fall back to raw text for clarity
    let errText = '';
    try {
      const js = await res.json();
      errText = js.error || JSON.stringify(js);
    } catch (e) {
      errText = await res.text().catch(() => 'Unknown error');
    }
    const msg = `HTTP ${res.status}: ${errText}`;
    console.error('API error:', { method, path, status: res.status, body: errText });
    throw new Error(msg);
  }
  // Parse JSON response (may throw if body empty)
  return res.json().catch(() => null);
}

// ── PUBLIC API (no auth needed) ──────────────────────────────────────
const API = {
  // Auth
  login: (email, pw)      => api('POST', '/api/auth/login', { email, password: pw }),
  me:    ()               => api('GET',  '/api/auth/me'),
  logout:()               => { token.clear(); },
  changePassword:(cur, nw)=> api('POST', '/api/auth/change-password', { current_password: cur, new_password: nw }),

  // Public content (landing page)
  getTeam:          ()     => api('GET', '/api/team'),
  getCofounder:     ()     => api('GET', '/api/cofounder'),
  getEvents:        ()     => api('GET', '/api/events'),
  registerEvent:    (id,d) => api('POST',`/api/events/${id}/register`, d),
  getGallery:       ()     => api('GET', '/api/gallery'),
  getTestimonials:  ()     => api('GET', '/api/testimonials'),
  getSponsors:      ()     => api('GET', '/api/sponsors'),
  getBooks:         (q,cat)=> api('GET', `/api/books${q||cat?'?':''}${q?'q='+q:''}${q&&cat?'&':''}${cat?'category='+cat:''}`),
  getMedia:         ()     => api('GET', '/api/media'),
  getCourses:       ()     => api('GET', '/api/courses'),
  getSettings:      ()     => api('GET', '/api/settings'),
  verifyId:         (id)   => api('GET', `/api/verify/${id}`),

  // Applications (public)
  submitApplication:  (d)  => api('POST', '/api/applications', d),
  submitMenteeReg:    (d)  => api('POST', '/api/mentee-registrations', d),
  submitMentorReg:    (d)  => api('POST', '/api/mentor-registrations', d),

  // Bookstore orders (public)
  placeOrder: (d) => api('POST', '/api/orders', d),

  // ── ADMIN ──────────────────────────────────────────────────────────
  admin: {
    // Team
    addTeamMember:    (fd)    => api('POST', '/api/team', fd, true),
    updateTeamMember: (id,fd) => api('PUT',  `/api/team/${id}`, fd, true),
    deleteTeamMember: (id)    => api('DELETE',`/api/team/${id}`),

    // Co-founder
    updateCofounder: (fd) => api('PUT', '/api/cofounder', fd, true),

    // Events
    addEvent:    (d)   => api('POST',  '/api/events', d),
    updateEvent: (id,d)=> api('PUT',   `/api/events/${id}`, d),
    deleteEvent: (id)  => api('DELETE',`/api/events/${id}`),
    getEventRegs:(id)  => api('GET',   `/api/events/${id}/registrations`),

    // Gallery
    addPhoto:   (fd)   => api('POST',  '/api/gallery', fd, true),
    deletePhoto:(id)   => api('DELETE',`/api/gallery/${id}`),

    // Testimonials
    addTestimonial:    (fd)   => api('POST',  '/api/testimonials', fd, true),
    deleteTestimonial: (id)   => api('DELETE',`/api/testimonials/${id}`),

    // Sponsors
    addSponsor:    (fd)   => api('POST',  '/api/sponsors', fd, true),
    deleteSponsor: (id)   => api('DELETE',`/api/sponsors/${id}`),

    // Books
    addBook:    (fd)   => api('POST',  '/api/books', fd, true),
    updateBook: (id,fd)=> api('PUT',   `/api/books/${id}`, fd, true),
    deleteBook: (id)   => api('DELETE',`/api/books/${id}`),

    // Media
    addMedia:    (d)  => api('POST',  '/api/media', d),
    deleteMedia: (id) => api('DELETE',`/api/media/${id}`),

    // Users
    getUsers:    ()       => api('GET',   '/api/users'),
    addUser:     (d)      => api('POST',  '/api/users', d),
    updateUser:  (id,d)   => api('PUT',   `/api/users/${id}`, d),
    deleteUser:  (id)     => api('DELETE',`/api/users/${id}`),

    // Courses
    getAllCourses:   ()      => api('GET',   '/api/courses'),
    addCourse:      (d)     => api('POST',  '/api/courses', d),
    updateCourse:   (id,d)  => api('PUT',   `/api/courses/${id}`, d),
    deleteCourse:   (id)    => api('DELETE',`/api/courses/${id}`),

    // Lessons
    getLessons:    (cid)   => api('GET',   `/api/lessons${cid?'?course_id='+cid:''}`),
    addLesson:     (fd)    => api('POST',  '/api/lessons', fd, true),
    deleteLesson:  (id)    => api('DELETE',`/api/lessons/${id}`),

    // Assignments
    getAssignments: (cid)  => api('GET',   `/api/assignments${cid?'?course_id='+cid:''}`),
    addAssignment:  (d)    => api('POST',  '/api/assignments', d),
    submitAssignment:(id,d)=> api('POST',  `/api/assignments/${id}/submit`, d),

    // Exams
    getExams:   ()      => api('GET',   '/api/exams'),
    addExam:    (d)     => api('POST',  '/api/exams', d),
    grantExam:  (id,d)  => api('POST',  `/api/exams/${id}/grant`, d),

    // Grades
    getGrades:    (email,cid)=> api('GET',  `/api/grades?student_email=${email||''}&course_id=${cid||''}`),
    saveGrade:    (d)        => api('POST', '/api/grades', d),

    // Orders
    getOrders:         ()       => api('GET', '/api/orders'),
    updateOrderStatus: (id,st)  => api('PUT', `/api/orders/${id}/status`, { status: st }),

    // Announcements
    getAnnouncements:  ()       => api('GET',   '/api/announcements'),
    addAnnouncement:   (d)      => api('POST',  '/api/announcements', d),
    replyAnnouncement: (id,d)   => api('POST',  `/api/announcements/${id}/replies`, d),
    deleteAnnouncement:(id)     => api('DELETE',`/api/announcements/${id}`),

    // Messages
    getContacts:   ()           => api('GET',  '/api/messages/contacts'),
    getMessages:   (email)      => api('GET',  `/api/messages?with=${email}`),
    sendMessage:   (to, body)   => api('POST', '/api/messages', { to_email: to, body }),
    unreadCount:   ()           => api('GET',  '/api/messages/unread-count'),

    // Settings
    getAdminSettings: ()    => api('GET', '/api/settings'),
    saveSettings:     (d)   => api('PUT', '/api/settings', d),

    // Applications
    getApplications:   () => api('GET', '/api/applications'),
    getMenteeRegs:     () => api('GET', '/api/mentee-registrations'),
    getMentorRegs:     () => api('GET', '/api/mentor-registrations'),
  },

  // Token helpers
  setToken: token.set,
  getToken: token.get,
  clearToken: token.clear,
};

// Attach to window so index.html can use it
if (typeof window !== 'undefined') window.TCMI_API = API;

// Backwards compatibility shims for older versions of `app.js`
// Some app.js files expect `window.TCMI_API.public.*` and a generic
// `window.TCMI_API.api(method, path, body)` function. Expose these so
// both old and new code paths work without editing the frontend.
API.public = {
  getTeam: API.getTeam,
  getCofounder: API.getCofounder,
  getEvents: API.getEvents,
  registerEvent: API.registerEvent,
  getGallery: API.getGallery,
  getTestimonials: API.getTestimonials,
  getSponsors: API.getSponsors,
  getBooks: API.getBooks,
  getMedia: API.getMedia,
  getCourses: API.getCourses,
  getSettings: API.getSettings,
  verifyId: API.verifyId,
  submitApplication: API.submitApplication,
  submitMenteeReg: API.submitMenteeReg,
  submitMentorReg: API.submitMentorReg,
  placeOrder: API.placeOrder
};

// Expose the low-level `api` function for callers that use it directly
API.api = api;

// Also make the low-level api available as admin.api for older app.js usages
if (!API.admin) API.admin = {};
API.admin.api = api;
