// ---------- Stat Cards ----------
const atRisk = CANDIDATES.filter(c => c.status === "risk").length;
const waiting = CANDIDATES.filter(c => c.status === "wait").length;

const stats = [
  { num: 12, label: "Open Roles" },
  { num: CANDIDATES.length, label: "Active Candidates" },
  { num: atRisk, label: "At-Risk Candidates", cls: "warning" },
  { num: 18, label: "Interviews This Week" },
  { num: waiting, label: "Waiting for Feedback" }
];

document.getElementById("statsGrid").innerHTML = stats.map(s => `
  <div class="stat-card ${s.cls || ''}">
    <div class="num">${s.num}</div>
    <div class="label">${s.label}</div>
  </div>
`).join("");

// ---------- Priority Alerts ----------
// Decision point: {Are any candidates at risk or needing action?}
const alerts = CANDIDATES.filter(c => c.status !== "ok");

document.querySelector("#alertsTable tbody").innerHTML = alerts.map(c => {
  const b = statusBadge(c.status);
  const issue = c.status === "risk"
    ? `No update in ${c.lastContact} days`
    : c.nextStep;
  return `
    <tr>
      <td>${c.name}</td>
      <td>${c.role}</td>
      <td><span class="badge ${b.cls}">${issue}</span></td>
      <td><a class="btn-secondary btn-small" href="candidate.html?id=${c.id}">Review</a></td>
    </tr>`;
}).join("");

// ---------- Pipeline Overview ----------
const stageCounts = {};
STAGES.concat(["Hired", "Rejected"]).forEach(s => stageCounts[s] = 0);
CANDIDATES.forEach(c => { stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1; });

document.getElementById("stageList").innerHTML = Object.entries(stageCounts).map(
  ([stage, count]) => `<li><span>${stage}</span><span class="count">${count}</span></li>`
).join("");

// ---------- Upcoming Tasks Preview ----------
const preview = [...TASKS.overdue.map(t => ({ t, overdue: true })),
                 ...TASKS.today.map(t => ({ t, overdue: false }))].slice(0, 5);

document.getElementById("taskPreview").innerHTML = preview.map(item => `
  <li><span class="dot ${item.overdue ? 'overdue' : ''}"></span>${item.t}</li>
`).join("");