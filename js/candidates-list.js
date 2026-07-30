// Render candidates in a clean, perfectly aligned table layout with filters.
// Builds an HTML table string with a sticky header and one clickable row per candidate,
// then injects it into the #candidateList container on the All Candidates page.
// CANDIDATES, statusBadge, effectiveStatus, normalizeSource, and ALL_STAGES are defined in js/data.js.

// IDs of the filter dropdowns and the clear button in candidates-list.html.
var FILTER_IDS = ["filterPosition", "filterDepartment", "filterSource", "filterStage", "filterStatus"];

// Friendly labels for the effective status values returned by effectiveStatus().
var STATUS_LABELS = {
  risk: "At Risk",
  wait: "Waiting Feedback",
  action: "Needs Action",
  ok: "On Track"
};

// Return a sorted array of unique values for a given field across all candidates.
// The accessor function maps a candidate to the value to compare/store.
function uniqueValues(accessor) {
  var seen = {};
  var list = [];
  for (var i = 0; i < CANDIDATES.length; i++) {
    var val = accessor(CANDIDATES[i]);
    if (val !== undefined && val !== null && val !== "" && !seen[val]) {
      seen[val] = true;
      list.push(val);
    }
  }
  list.sort();
  return list;
}

// Populate a <select> element with <option> elements for each provided value,
// preserving the existing "All ..." placeholder option.
function populateSelect(id, values) {
  var sel = document.getElementById(id);
  if (!sel) return;
  // Keep the first (placeholder) option, remove any dynamically added options.
  while (sel.options.length > 1) {
    sel.remove(1);
  }
  for (var i = 0; i < values.length; i++) {
    var opt = document.createElement("option");
    opt.value = values[i];
    opt.textContent = values[i];
    sel.appendChild(opt);
  }
}

// Populate all filter dropdowns with unique values derived from the candidate data.
function populateFilters() {
  populateSelect("filterPosition", uniqueValues(function(c) { return c.role; }));
  populateSelect("filterDepartment", uniqueValues(function(c) { return c.dept; }));
  // Source filter uses the normalized display name so it matches what is shown in the table.
  populateSelect("filterSource", uniqueValues(function(c) { return normalizeSource(c.source); }));
  // Stage filter uses the canonical stage list order (active then terminal stages).
  populateSelect("filterStage", ALL_STAGES.slice());
  // Status filter shows the friendly labels used across the app (e.g. "At Risk"),
  // while the option value stays the internal status key used for comparison.
  var statusKeys = Object.keys(STATUS_LABELS);
  var statusSel = document.getElementById("filterStatus");
  if (statusSel) {
    while (statusSel.options.length > 1) {
      statusSel.remove(1);
    }
    for (var i = 0; i < statusKeys.length; i++) {
      var opt = document.createElement("option");
      opt.value = statusKeys[i];
      opt.textContent = STATUS_LABELS[statusKeys[i]];
      statusSel.appendChild(opt);
    }
  }
}

// Read the currently selected value from a filter dropdown (empty string = no filter).
function getFilterValue(id) {
  var sel = document.getElementById(id);
  return sel ? sel.value : "";
}

// Return the subset of candidates matching all currently selected filters.
function getFilteredCandidates() {
  var pos = getFilterValue("filterPosition");
  var dept = getFilterValue("filterDepartment");
  var src = getFilterValue("filterSource");
  var stage = getFilterValue("filterStage");
  var status = getFilterValue("filterStatus");

  var result = [];
  for (var i = 0; i < CANDIDATES.length; i++) {
    var c = CANDIDATES[i];
    if (pos && c.role !== pos) continue;
    if (dept && c.dept !== dept) continue;
    if (src && normalizeSource(c.source) !== src) continue;
    if (stage && c.stage !== stage) continue;
    if (status && effectiveStatus(c) !== status) continue;
    result.push(c);
  }
  return result;
}

// Build the table HTML for a given array of candidates and inject it into #candidateList.
// Shows an empty-state message when there are no matching candidates.
function renderTable(candidates) {
  // Start building the table HTML: a scrollable wrapper, the table element, and a sticky header row.
  var html =
    '<div style="max-height: calc(100vh - 220px); overflow-y: auto;">' +
    '<table class="data-table" style="width: 100%; border-collapse: collapse;">' +
      '<thead style="position: sticky; top: 0; background: white; z-index: 10; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">' +
        '<tr>' +
          '<th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Candidate</th>' +
          '<th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Source</th>' +
          '<th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Stage</th>' +
          '<th style="text-align: right; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Status</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>';

  if (candidates.length === 0) {
    // Empty state: a single full-width row telling the user no candidates match the filters.
    html +=
      '<tr><td colspan="4" style="padding: 40px 16px; text-align: center; color: #6B7280;">' +
      'No candidates match the selected filters.</td></tr>';
  } else {
    // Loop through every candidate and build a clickable row that navigates to their profile.
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      // Get the badge text and CSS class for this candidate's effective status.
      var b = statusBadge(effectiveStatus(c));

      html +=
        '<tr onclick="window.location=\'candidate.html?id=' + c.id + '\'" style="cursor: pointer;" class="candidate-row-tr">' +
          '<td style="padding: 12px 16px;">' +
            '<div style="font-weight: 600;">' + c.name + '</div>' +
            '<div style="font-size: 13px; color: #6B7280;">' + c.role + ' - ' + c.dept + '</div>' +
          '</td>' +
          '<td style="padding: 12px 16px;"><span class="source-tag">' + normalizeSource(c.source) + '</span></td>' +
          '<td style="padding: 12px 16px;">' + c.stage + '</td>' +
          '<td style="padding: 12px 16px; text-align: right;">' +
            '<span class="badge ' + b.cls + '">' + b.text + '</span>' +
          '</td>' +
        '</tr>';
    }
  }

  // Close the table and wrapper, then inject the finished HTML into the page.
  html += '</tbody></table></div>';

  document.getElementById("candidateList").innerHTML = html;
}

// Re-render the candidate table using the currently selected filters.
function applyFilters() {
  renderTable(getFilteredCandidates());
}

// Reset all filter dropdowns to their placeholder ("All ...") option and re-render.
function clearFilters() {
  for (var i = 0; i < FILTER_IDS.length; i++) {
    var sel = document.getElementById(FILTER_IDS[i]);
    if (sel) sel.selectedIndex = 0;
  }
  applyFilters();
}

// Initialize the page: populate dropdowns, render the full list, and wire up events.
populateFilters();
applyFilters();

// Re-render whenever any filter dropdown changes.
for (var i = 0; i < FILTER_IDS.length; i++) {
  var sel = document.getElementById(FILTER_IDS[i]);
  if (sel) sel.addEventListener("change", applyFilters);
}

// Wire up the clear button to reset all filters.
var clearBtn = document.getElementById("clearFilters");
if (clearBtn) clearBtn.addEventListener("click", clearFilters);