// Populate a filter dropdown (<select>) with unique values from the candidate data.
// CANDIDATES, STAGES, statusBadge, and effectiveStatus are defined in js/data.js.
// The dropdown elements (#filterRole, #filterDept, #filterSource) are defined in pipeline.html.
function fillFilter(id, values) {
  const sel = document.getElementById(id);
  // Use a Set to get unique values, then create an <option> for each.
  [...new Set(values)].forEach(v => {
    const opt = document.createElement("option");
    opt.value = v; opt.textContent = v;
    sel.appendChild(opt);
  });
}

// Fill the three filter dropdowns with roles, departments, and sources from the data.
// CANDIDATES is defined in js/data.js.
fillFilter("filterRole", CANDIDATES.map(c => c.role));
fillFilter("filterDept", CANDIDATES.map(c => c.dept));
fillFilter("filterSource", CANDIDATES.map(c => c.source));

// Render the Kanban board, applying any active filters.
// Creates one column per hiring stage and fills it with candidate cards.
function renderBoard() {
  // Read the current filter values (empty string means "all").
  // #filterRole, #filterDept, and #filterSource are defined in pipeline.html.
  const role = document.getElementById("filterRole").value;
  const dept = document.getElementById("filterDept").value;
  const source = document.getElementById("filterSource").value;

  // Filter candidates based on the selected role, department, and source.
  const filtered = CANDIDATES.filter(c =>
    (!role   || c.role === role) &&
    (!dept   || c.dept === dept) &&
    (!source || c.source === source)
  );

  // Build the Kanban board: one column per stage, with candidate cards inside.
  // STAGES is defined in js/data.js.
  // #kanban is defined in pipeline.html.
  document.getElementById("kanban").innerHTML = STAGES.map(stage => {
    // Build cards for candidates in this stage.
    // statusBadge and effectiveStatus are defined in js/data.js.
    const cards = filtered.filter(c => c.stage === stage).map(c => {
      const b = statusBadge(effectiveStatus(c));
      return `
        <div class="kanban-card" onclick="location.href='candidate.html?id=${c.id}'">
          <div class="name">${c.name}</div>
          <div class="role">${c.role}</div>
          <span class="badge ${b.cls}">${b.text}</span>
        </div>`;
    }).join("");
    // Return the column HTML; show "No candidates" placeholder if empty.
    return `
      <div class="kanban-col">
        <h3>${stage}</h3>
        ${cards || '<p style="font-size:12px;color:#9CA3AF;">No candidates</p>'}
      </div>`;
  }).join("");
}

// Re-render the board whenever any filter dropdown changes.
// #filterRole, #filterDept, and #filterSource are defined in pipeline.html.
["filterRole", "filterDept", "filterSource"].forEach(id =>
  document.getElementById(id).addEventListener("change", renderBoard)
);

// Initial render of the Kanban board on page load.
renderBoard();
