// ---------- Stat Cards ----------
// Calculate counts for at-risk and waiting-for-feedback candidates.
// CANDIDATES, isAtRisk, isActiveCandidate, getOpenRolesCount, effectiveStatus,
// statusBadge, normalizeSource, ALL_STAGES, and getDynamicTasks are defined in js/data.js.
const atRisk = CANDIDATES.filter(c => isAtRisk(c)).length;
const waiting = CANDIDATES.filter(c => c.status === "wait" && !isAtRisk(c)).length;

// Define the five stat cards shown at the top of the dashboard.
const stats = [
  { num: getOpenRolesCount(), label: "Open Roles" },
  { num: CANDIDATES.filter(c => isActiveCandidate(c)).length, label: "Active Candidates" },
  { num: atRisk, label: "At-Risk Candidates", cls: "warning" },
  { num: 18, label: "Interviews This Week" },
  { num: waiting, label: "Waiting for Feedback" }
];

// Render the stat cards into the #statsGrid container.
// getOpenRolesCount and isActiveCandidate are defined in js/data.js.
// #statsGrid is defined in dashboard.html.
document.getElementById("statsGrid").innerHTML = stats.map(s => `
  <div class="stat-card ${s.cls || ''}">
    <div class="num">${s.num}</div>
    <div class="label">${s.label}</div>
  </div>
`).join("");

// ---------- Priority Alerts ----------
// Build a sorted list of active candidates who are not "ok" (i.e. need attention).
// Sort by a priority score: risk adds 100, action adds 50, plus days since last contact.
// isActiveCandidate and effectiveStatus are defined in js/data.js.
const alerts = CANDIDATES
  .filter(c => isActiveCandidate(c) && (effectiveStatus(c) !== "ok"))
  .sort((a, b) => {
    let scoreA = a.lastContact + (effectiveStatus(a) === "risk" ? 100 : (effectiveStatus(a) === "action" ? 50 : 0));
    let scoreB = b.lastContact + (effectiveStatus(b) === "risk" ? 100 : (effectiveStatus(b) === "action" ? 50 : 0));
    return scoreB - scoreA;
  })
  .slice(0, 10);

// Render the top 10 priority alerts into the alerts table.
// statusBadge, effectiveStatus, isAtRisk, and normalizeSource are defined in js/data.js.
// #alertsTable is defined in dashboard.html.
document.querySelector("#alertsTable tbody").innerHTML = alerts.map(c => {
  const b = statusBadge(effectiveStatus(c));
  const issue = isAtRisk(c)
    ? `No update in ${c.lastContact} days`
    : c.nextStep;
  return `
    <tr>
      <td>${c.name}</td>
      <td>${c.role}</td>
      <td><span class="badge ${b.cls}">${issue}</span></td>
      <td><span class="source-tag">${normalizeSource(c.source)}</span></td>
      <td><a class="btn-secondary btn-small" href="candidate.html?id=${c.id}">Review</a></td>
    </tr>`;
}).join("");

// ---------- Pipeline Overview ----------
// Count how many candidates are in each hiring stage.
// ALL_STAGES is defined in js/data.js.
const stageCounts = {};
ALL_STAGES.forEach(s => stageCounts[s] = 0);
CANDIDATES.forEach(c => { stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1; });

// Render the stage counts as a list with stage name and count.
// #stageList is defined in dashboard.html.
document.getElementById("stageList").innerHTML = Object.entries(stageCounts).map(
  ([stage, count]) => `<li><span>${stage}</span><span class="count">${count}</span></li>`
).join("");

// ---------- Upcoming Tasks Preview ----------
// Get dynamic tasks and combine overdue, today, and upcoming into one preview list (max 5).
// getDynamicTasks is defined in js/data.js.
const dynamicTasks = getDynamicTasks();
const preview = [
  ...dynamicTasks.overdue.map(t => ({ t, overdue: true })),
  ...dynamicTasks.today.map(t => ({ t, overdue: false })),
  ...dynamicTasks.upcoming.map(t => ({ t, overdue: false }))
].slice(0, 5);

// Render the task preview list with colored dots (red for overdue).
// #taskPreview is defined in dashboard.html.
document.getElementById("taskPreview").innerHTML = preview.map(item => `
  <li><span class="dot ${item.overdue ? 'overdue' : ''}"></span>${item.t}</li>
`).join("");
