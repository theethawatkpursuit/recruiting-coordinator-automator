// Populate filter dropdowns from data
function fillFilter(id, values) {
  const sel = document.getElementById(id);
  [...new Set(values)].forEach(v => {
    const opt = document.createElement("option");
    opt.value = v; opt.textContent = v;
    sel.appendChild(opt);
  });
}
fillFilter("filterRole", CANDIDATES.map(c => c.role));
fillFilter("filterDept", CANDIDATES.map(c => c.dept));
fillFilter("filterSource", CANDIDATES.map(c => c.source));

// Render the Kanban board, applying any active filters
function renderBoard() {
  const role = document.getElementById("filterRole").value;
  const dept = document.getElementById("filterDept").value;
  const source = document.getElementById("filterSource").value;

  const filtered = CANDIDATES.filter(c =>
    (!role   || c.role === role) &&
    (!dept   || c.dept === dept) &&
    (!source || c.source === source)
  );

  document.getElementById("kanban").innerHTML = STAGES.map(stage => {
    const cards = filtered.filter(c => c.stage === stage).map(c => {
      const b = statusBadge(c.status);
      return `
        <div class="kanban-card" onclick="location.href='candidate.html?id=${c.id}'">
          <div class="name">${c.name}</div>
          <div class="role">${c.role}</div>
          <span class="badge ${b.cls}">${b.text}</span>
        </div>`;
    }).join("");
    return `
      <div class="kanban-col">
        <h3>${stage}</h3>
        ${cards || '<p style="font-size:12px;color:#9CA3AF;">No candidates</p>'}
      </div>`;
  }).join("");
}

// Re-render whenever a filter changes
["filterRole", "filterDept", "filterSource"].forEach(id =>
  document.getElementById(id).addEventListener("change", renderBoard)
);

renderBoard();