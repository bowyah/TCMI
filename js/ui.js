// ui.js — UI helpers: toasts, modals, notifications, helpers
function addNotif(text, color) { window.DB.notifications.unshift({ text, time: 'Just now', color, read: false }); renderNotifications(); }

function renderNotifications() {
  const unread = window.DB.notifications.filter(n => !n.read).length;
  const dot = document.getElementById('notif-dot'); if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
  const listEl = document.getElementById('notif-list');
  if (!listEl) return;
  listEl.innerHTML = window.DB.notifications.slice(0, 12).map(n => `
    <div class="notif-item" onclick="n.read=true;renderNotifications()">
      <div class="notif-circle" style="background:${n.color}"></div>
      <div><div class="notif-text" style="font-weight:${n.read ? 400 : 600}">${n.text}</div><div class="notif-time">${n.time}</div></div>
    </div>`).join('') || '<div style="padding:20px;text-align:center;color:var(--slate);font-size:12px">No notifications</div>';
}

function clearNotifs() { window.DB.notifications.forEach(n => n.read = true); renderNotifications(); closeNotif(); }
function toggleNotif() { document.getElementById('notif-panel')?.classList.toggle('open'); }
function closeNotif() { document.getElementById('notif-panel')?.classList.remove('open'); }

function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  if (id === 'modal-add-faculty') initAddFacultyModal();
  if (id === 'modal-add-student') initAddStudentModal();
}
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function showToast(msg, type = '') {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.className = 'toast show' + (type === 'err' ? ' err' : '');
  clearTimeout(t._to); t._to = setTimeout(() => t.classList.remove('show'), 3500);
}

function showFilePrev(inp, previewId) {
  const el = document.getElementById(previewId); if (!el) return;
  if (inp.files.length) { el.style.display = 'flex'; el.innerHTML = ' ' + Array.from(inp.files).map(f => f.name).join(', '); }
  else { el.style.display = 'none'; }
}

function populateCourseDropdowns() {
  const pub = window.DB.courses.filter(c => c.status === 'published');
  ['a-course', 'ex-course', 'lesson-course'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = pub.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
  });
}

function populateMentorSelect() {
  const el = document.getElementById('ns-mentor'); if (!el) return;
  el.innerHTML = window.DB.faculty.map(f => `<option value="${f.email}">${f.name}</option>`).join('');
}

function switchTab(btn, contentId) {
  const nav = btn.closest('.tab-nav');
  nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
  let el = nav.nextElementSibling; while (el) { if (el.classList?.contains('tab-content')) el.classList.remove('active'); el = el.nextElementSibling; }
  document.getElementById(contentId)?.classList.add('active');
}

function ini(name) { return (name || '').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'; }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function av(obj, size = 34) {
  const i = obj.initials || ini(obj.name || ''); const fs = Math.floor(size * .38);
  if (obj.pic) return `<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;flex-shrink:0"><img src="${obj.pic}" style="width:100%;height:100%;object-fit:cover"></div>`;
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--navy);color:var(--gold-light);display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:700;flex-shrink:0">${i}</div>`;
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.addNotif = addNotif;
}
