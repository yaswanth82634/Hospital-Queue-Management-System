// script.js – queue logic, token increment, smooth UI updates

// ---- Data state ----
let patients = [];               // all patients registered today
let nextToken = 201;             // tokens start from 201 (for realistic feel)
let currentServingIndex = -1;     // index in patients array of who is being served (if any)

// ---- DOM elements ----
const dashboard = {
  total: document.getElementById('totalPatients'),
  waiting: document.getElementById('waitingCount'),
  completed: document.getElementById('completedCount'),
  avgWait: document.getElementById('avgWait')
};

const queueBody = document.getElementById('queueBody');
const registrationForm = document.getElementById('registrationForm');
const callNextBtn = document.getElementById('callNextBtn');
const markCompletedBtn = document.getElementById('markCompletedBtn');
const currentServingTokenSpan = document.getElementById('currentServingToken');
const currentServingNameSpan = document.getElementById('currentServingName');
const queueCountSpan = document.getElementById('queueCount');

// ---- helper: update all UI (cards + table + doctor panel) ----
function refreshDashboard() {
  // totals
  const total = patients.length;
  const waiting = patients.filter(p => p.status === 'waiting').length;
  const completed = patients.filter(p => p.status === 'completed').length;
  const serving = patients.filter(p => p.status === 'serving').length;

  dashboard.total.textContent = total;
  dashboard.waiting.textContent = waiting;
  dashboard.completed.textContent = completed;

  // avg waiting time (mock realistic: 12–22 min based on waiting count)
  let avg = 0;
  if (waiting > 0) {
    avg = Math.min(12 + waiting * 2, 28); // just for demo
  } else if (completed > 0) {
    avg = 14; // base if some completed
  } else {
    avg = 0;
  }
  dashboard.avgWait.textContent = avg + ' min';

  // update queue table
  renderQueueTable();

  // update serving indicator
  const servingPatient = patients.find(p => p.status === 'serving');
  if (servingPatient) {
    currentServingTokenSpan.textContent = servingPatient.token;
    currentServingNameSpan.textContent = servingPatient.name;
  } else {
    currentServingTokenSpan.textContent = '—';
    currentServingNameSpan.textContent = '(no patient)';
  }

  // queue count in header
  const waitingCount = patients.filter(p => p.status !== 'completed').length;
  queueCountSpan.textContent = waitingCount + ' patient' + (waitingCount !== 1 ? 's' : '');
}

// render table rows from patients array (only waiting & serving; completed hidden? but we want all per design? show all but maybe filter? we'll show all for clarity.)
function renderQueueTable() {
  // we show all patients (waiting, serving, completed) to match "Queue Display" spec, but status badge differentiates.
  if (patients.length === 0) {
    queueBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#8b9eb0;">No patients registered today</td></tr>`;
    return;
  }

  // optionally reverse to show newest last? we'll keep chronological (oldest first) – but spec likes any order. keep as inserted order.
  let html = '';
  patients.forEach(p => {
    let statusClass = '';
    if (p.status === 'waiting') statusClass = 'status-waiting';
    else if (p.status === 'serving') statusClass = 'status-serving';
    else statusClass = 'status-completed';

    const statusText = p.status === 'waiting' ? 'Waiting' : (p.status === 'serving' ? 'Serving' : 'Completed');

    html += `<tr>
      <td><strong>#${p.token}</strong></td>
      <td>${p.name}</td>
      <td>${p.department}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
    </tr>`;
  });
  queueBody.innerHTML = html;
}

// ---- registration ----
registrationForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('patientName').value.trim();
  const age = document.getElementById('age').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const dept = document.getElementById('department').value;

  if (!name || !age || !phone || !dept) return; // safety

  const newPatient = {
    token: nextToken,
    name: name,
    age: age,
    phone: phone,
    department: dept,
    status: 'waiting'   // always waiting on registration
  };
  patients.push(newPatient);
  nextToken += 1;

  // reset form
  registrationForm.reset();

  // smooth update
  refreshDashboard();
});

// ---- doctor actions ----

// Call next patient: set first WAITING to 'serving' (if none waiting, ignore)
callNextBtn.addEventListener('click', () => {
  // if there's already a serving patient, do not override (or we could? but typical: only one serving)
  const alreadyServing = patients.find(p => p.status === 'serving');
  if (alreadyServing) {
    alert('A patient is already being served. Please mark them completed first.');
    return;
  }

  const nextWaitingIndex = patients.findIndex(p => p.status === 'waiting');
  if (nextWaitingIndex === -1) {
    alert('No waiting patients.');
    return;
  }

  patients[nextWaitingIndex].status = 'serving';
  refreshDashboard();
});

// Mark current serving patient as completed
markCompletedBtn.addEventListener('click', () => {
  const servingIndex = patients.findIndex(p => p.status === 'serving');
  if (servingIndex === -1) {
    alert('No patient is currently being served.');
    return;
  }

  patients[servingIndex].status = 'completed';
  refreshDashboard();
});

// optional: reset/initial demo entries for better showcase (soft fill)
function addDemoPatients() {
  const demos = [
    { token: 201, name: 'Clara Bennett', department: 'Cardiology', status: 'waiting' },
    { token: 202, name: 'Omar Hassan', department: 'General Medicine', status: 'waiting' },
    { token: 203, name: 'Lisa Wong', department: 'Pediatrics', status: 'completed' },
    { token: 204, name: 'Marcus Reed', department: 'Orthopedics', status: 'waiting' },
  ];
  patients = demos.map(d => ({ ...d, age: '--', phone: '--' })); // dummy fields
  nextToken = 205;
  // no serving by default
  refreshDashboard();
}

// uncomment to seed demo data (feel free to enable)
addDemoPatients();

// ensure smooth initial render
refreshDashboard();

// ---- extra animation for hover (mostly CSS) but JS can add tiny effect ----
// optional: soft dynamic avg waiting time variation (just for demo)
setInterval(() => {
  // no need, static based on data
}, 10000);