// assign.js — Assign mentors functionality
async function renderAssign() {
  const table = document.getElementById('assign-table'); if (!table) return;
  table.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--slate)">Loading...</td></tr>';

  try {
    let users = [];
    try { users = await window.TCMI_API.admin.getUsers(); } catch (e) { users = []; }

    if (users && users.length) {
      window.DB.students = users.filter(u => u.role === 'student');
      window.DB.faculty = users.filter(u => u.role === 'faculty');
    }

    table.innerHTML = window.DB.students.map(s => {
      const cur = window.DB.faculty.find(f => f.email === s.mentor);
      return `<tr>
      <td><strong>${s.name}</strong></td>
      <td>${cur ? cur.name : '<span style="color:var(--danger)">Unassigned</span>'}</td>
      <td><select class="fs" style="width:auto;padding:5px 9px;font-size:12px" id="ms-${s.id}">
        <option value="">-- Select --</option>
        ${window.DB.faculty.map(f => `<option value="${f.email}" ${s.mentor === f.email ? 'selected' : ''}>${f.name}</option>`).join('')}
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
  const s = window.DB.students.find(x => x.id === sid); if (!s) return;
  s.mentor = mEmail; if (window.DB.users && window.DB.users[s.email]) window.DB.users[s.email].mentor = mEmail;
  const m = window.DB.faculty.find(f => f.email === mEmail);
  showToast(`${s.name} assigned to ${m ? m.name : 'mentor'}`);
  addNotif(`${s.name} assigned to ${m ? m.name : 'a mentor'}`, 'var(--success)');
}

if (typeof window !== 'undefined') {
  window.renderAssign = renderAssign;
  window.saveAssign = saveAssign;
}
