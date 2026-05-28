// users.js — student/faculty management
async function initAddFacultyModal() {
  const users = await window.TCMI_API.admin.getUsers().catch(() => []);
  const facCount = users.filter(u => u.role === 'faculty').length;
  document.getElementById('nf-id-preview').textContent = 'TCMI-FAC-' + String(facCount + 1).padStart(4, '0');
  document.getElementById('nf-pw').value = genPassword();
  ['nf-name', 'nf-email', 'nf-login-email'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

async function initAddStudentModal() {
  const users = await window.TCMI_API.admin.getUsers().catch(() => []);
  const stuCount = users.filter(u => u.role === 'student').length;
  document.getElementById('ns-id-preview').textContent = 'TCMI-STU-' + String(stuCount + 1).padStart(4, '0');
  document.getElementById('ns-pw').value = genPassword();
  ['ns-name', 'ns-email', 'ns-login-email'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

async function renderFaculty() {
  const tbody = document.getElementById('faculty-table'); if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--slate)">Loading faculty...</td></tr>';

  try {
    const users = await window.TCMI_API.admin.getUsers();
    const faculty = users.filter(u => u.role === 'faculty');
    const students = users.filter(u => u.role === 'student');
    const courses = await window.TCMI_API.admin.getAllCourses().catch(() => []);

    if (!faculty.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--slate)">No faculty members added yet.</td></tr>';
      return;
    }

    tbody.innerHTML = faculty.map((f, i) => `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:9px">
          ${av(f, 32)}
          <div>
            <strong>${f.name}</strong>
            <div style="font-size:10px;font-family:monospace;color:var(--gold);margin-top:1px">${f.tcmiId || '—'}</div>
          </div>
        </div>
      </td>
      <td style="font-size:12px;color:var(--slate)">${f.position}</td>
      <td style="font-size:12px">${courses.filter(c => c.instructor === f.email).length}</td>
      <td style="font-size:12px">${students.filter(s => s.mentor === f.email).length}</td>
      <td style="font-size:11px;font-family:monospace;color:var(--slate)">${f.email}</td>
      <td><span class="badge bg-success">Active</span></td>
      <td style="white-space:nowrap">
        <button class="btn-sm btn-danger" style="margin-left:4px" onclick="deleteFaculty(${f.id})">Delete</button>
      </td>
    </tr>`).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--danger)">Error loading faculty.</td></tr>';
  }
}

async function addFaculty() {
  const name = document.getElementById('nf-name').value.trim();
  const email = document.getElementById('nf-email').value.trim();
  const pos = document.getElementById('nf-pos').value;
  const pw = document.getElementById('nf-pw').value.trim();
  const loginEmail = document.getElementById('nf-login-email').value.trim() || email;
  if (!name || !email) { showToast('Name and email required', 'err'); return; }
  if (!pw) { showToast('Password required', 'err'); return; }
  const tcmiId = document.getElementById('nf-id-preview').textContent;

  try {
    await window.TCMI_API.admin.addUser({
      name,
      email: loginEmail,
      password: pw,
      role: 'faculty',
      position: pos,
      tcmiId,
      status: 'Active'
    });
    showToast('Faculty member added! ID: ' + tcmiId);
    addNotif('New faculty: ' + name + ' (' + tcmiId + ')', 'var(--info)');
    closeModal('modal-add-faculty');
    renderFaculty();
  } catch (e) {
    showToast('Failed to add faculty: ' + e.message, 'err');
  }
}

async function renderStudents() {
  updateAppBadge();
  const tbody = document.getElementById('students-table'); if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--slate)">Loading students...</td></tr>';

  try {
    const users = await window.TCMI_API.admin.getUsers();
    const students = users.filter(u => u.role === 'student');
    const faculty = users.filter(u => u.role === 'faculty');

    if (!students.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--slate)">No students enrolled yet.</td></tr>';
      return;
    }

    tbody.innerHTML = students.map((s, i) => {
      const m = faculty.find(f => f.email === s.mentor);
      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:9px">
            ${av(s, 32)}
            <div>
              <strong>${s.name}</strong>
              <div style="font-size:10px;font-family:monospace;color:var(--gold);margin-top:1px">${s.tcmiId || s.id || '—'}</div>
            </div>
          </div>
        </td>
        <td style="font-size:11px;font-family:monospace;color:var(--slate)">${s.tcmiId || s.id}</td>
        <td style="font-size:12px">${s.track}</td>
        <td style="font-size:12px">${m ? m.name : 'Unassigned'}</td>
        <td style="font-size:12px">${s.gpa ? Number(s.gpa).toFixed(2) : '—'}</td>
        <td><span class="badge bg-${s.status === 'Active' ? 'success' : 'warn'}">${s.status || 'Active'}</span></td>
        <td style="white-space:nowrap">
          <button class="btn-sm btn-danger" style="margin-left:4px" onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      </tr>`;
    }).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--danger)">Error loading students.</td></tr>';
  }
}

async function addStudent() {
  const name = document.getElementById('ns-name').value.trim();
  const email = document.getElementById('ns-email').value.trim();
  if (!name || !email) { showToast('Name and email required', 'err'); return; }
  const pw = document.getElementById('ns-pw').value.trim();
  const loginEmail = document.getElementById('ns-login-email').value.trim() || email;
  if (!pw) { showToast('Password required', 'err'); return; }
  const track = document.getElementById('ns-track').value;
  const mentor = document.getElementById('ns-mentor').value;
  const tcmiId = document.getElementById('ns-id-preview').textContent;

  try {
    await window.TCMI_API.admin.addUser({
      name,
      email: loginEmail,
      password: pw,
      role: 'student',
      track,
      mentor,
      tcmiId,
      status: 'Active'
    });
    showToast('Student enrolled! ID: ' + tcmiId);
    addNotif('New student: ' + name + ' (' + tcmiId + ')', 'var(--success)');
    closeModal('modal-add-student');
    renderStudents(); // Refresh from DB
  } catch (e) {
    console.error('Failed to add student (full error):', e);
    showToast('Failed to add student: ' + (e.message || e), 'err');
  }
}

function deleteFaculty(id) {
  if (!confirm('Delete this faculty member? Their login access will also be removed.')) return;
  window.TCMI_API.admin.deleteUser(id).then(() => { showToast('Faculty member removed.'); renderFaculty(); }).catch(e => showToast('Failed to delete faculty: ' + e.message, 'err'));
}

function deleteStudent(id) {
  if (!confirm('Remove this student from the directory? Their login access will also be removed.')) return;
  window.TCMI_API.admin.deleteUser(id).then(() => { showToast('Student removed from records.'); renderStudents(); }).catch(e => showToast('Failed to delete student: ' + e.message, 'err'));
}

if (typeof window !== 'undefined') {
  window.initAddFacultyModal = initAddFacultyModal;
  window.initAddStudentModal = initAddStudentModal;
  window.renderFaculty = renderFaculty;
  window.renderStudents = renderStudents;
  window.addFaculty = addFaculty;
  window.addStudent = addStudent;
  window.deleteFaculty = deleteFaculty;
  window.deleteStudent = deleteStudent;
}
