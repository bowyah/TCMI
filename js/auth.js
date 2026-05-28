// auth.js — login/logout and app init
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
    window.currentUser = res.user;

    if (window.syncAdminData) {
      window.syncAdminData().catch(e => console.log(e));
    }

    initApp(window.currentUser);
    switchView('view-app');
  } catch (e) {
    err.style.color = 'var(--danger)';
    err.textContent = e.message || 'Invalid email or password';
  }
}
function doLogout() {
  window.TCMI_API.logout();
  window.currentUser = null;
  switchView('view-landing');
}

function initApp(u) {
  setAvatarEl('sb-avatar', u);
  setAvatarEl('topbar-pic', u);
  document.getElementById('sb-name').textContent = u.name;
  document.getElementById('sb-role').textContent = cap(u.role);
  document.getElementById('welcome-msg').textContent = 'Welcome back, ' + u.name.split(' ')[0] + '!';
  document.getElementById('welcome-sub').textContent = u.role === 'admin' ? "Here's your institutional overview for today." : u.role === 'faculty' ? "Review your teaching dashboard and pending tasks." : "Track your spiritual growth and academic progress.";
  const fn = document.getElementById('c-faculty-note'); if (fn) fn.style.display = u.role === 'faculty' ? 'block' : 'none';
  const ab = document.getElementById('approval-btn'); if (ab) ab.style.display = u.role === 'admin' ? 'flex' : 'none';
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

if (typeof window !== 'undefined') {
  window.doLogin = doLogin;
  window.doLogout = doLogout;
  window.initApp = initApp;
  window.setAvatarEl = setAvatarEl;
}
