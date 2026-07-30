// ---------- Report Stat Cards ----------
// Calculate summary metrics for the report page: active candidates, hires, and at-risk count.
// CANDIDATES, isActiveCandidate, isHired, isAtRisk, getOpenRolesCount, normalizeSource,
// isHired, isFirstRoundDropout, and effectiveStatus are defined in js/data.js.
// HR_SOURCE_STATS and hrDataPromise are defined in js/hr-data.js.

// Count candidates still in the pipeline (not hired or rejected).
// isActiveCandidate is defined in js/data.js.
var totalCandidates = CANDIDATES.filter(function(c) { return isActiveCandidate(c); }).length;

// Count total hired candidates by looping through the array.
// isHired is defined in js/data.js.
var totalHires = 0;
for (var i = 0; i < CANDIDATES.length; i++) {
  if (isHired(CANDIDATES[i])) {
    totalHires++;
  }
}

// Count at-risk candidates (active with stale contact).
// isAtRisk is defined in js/data.js.
var riskCount = 0;
for (var i = 0; i < CANDIDATES.length; i++) {
  if (isAtRisk(CANDIDATES[i])) {
    riskCount++;
  }
}

// Define the five report stat cards with their values and CSS classes.
// getOpenRolesCount is defined in js/data.js.
var reportStats = [
  { num: getOpenRolesCount(), label: "Open Roles", cls: "" },
  { num: totalCandidates, label: "Candidates in Process", cls: "" },
  { num: riskCount, label: "At-Risk Candidates", cls: "warning" },
  { num: "28 days", label: "Avg. Time-to-Hire", cls: "" },
  { num: totalHires, label: "Total Hires", cls: "success" }
];

// Build the stat card HTML and inject it into the #reportStats container.
// #reportStats is defined in reports.html.
var statsHTML = "";
for (var i = 0; i < reportStats.length; i++) {
  var s = reportStats[i];
  statsHTML = statsHTML +
    '<div class="stat-card ' + s.cls + '">' +
      '<div class="num">' + s.num + '</div>' +
      '<div class="label">' + s.label + '</div>' +
    '</div>';
}
document.getElementById("reportStats").innerHTML = statsHTML;


// ---------- Source Effectiveness Table ----------
// Aggregate pipeline data per recruitment source: candidate count, hires, and
// first-round drop-offs. Then merge with HR dataset stats (engagement, turnover).

var sourceLookup = {};
var hrToDisplay = {};

// Loop through all candidates and accumulate per-source metrics.
// normalizeSource, isHired, and isFirstRoundDropout are defined in js/data.js.
for (var i = 0; i < CANDIDATES.length; i++) {
  var c = CANDIDATES[i];
  var src = normalizeSource(c.source);

  // Initialize the source entry on first encounter.
  if (!sourceLookup[src]) {
    sourceLookup[src] = { candidates: 0, hires: 0, firstRoundDropouts: 0 };
  }
  sourceLookup[src].candidates++;

  // Count hires and first-round dropouts for this source.
  if (isHired(c)) {
    sourceLookup[src].hires++;
  }
  if (isFirstRoundDropout(c)) {
    sourceLookup[src].firstRoundDropouts++;
  }
}

// Calculate the drop-off percentage for each source.
for (var key in sourceLookup) {
  var s = sourceLookup[key];
  s.dropOff = s.candidates > 0
    ? Math.round((s.firstRoundDropouts / s.candidates) * 100) + "%"
    : "0%";
}

// Track which sources have been added to the table to avoid duplicates.
var allSourceNames = [];
var addedKeys = {};

// Wait for the HR dataset promise to resolve before rendering, so engagement
// and turnover data is available. If no promise exists, render immediately.
// hrDataPromise and HR_SOURCE_STATS are defined in js/hr-data.js.
if (window.hrDataPromise) {
  window.hrDataPromise.then(function() {
    renderSourceTable();
  });
} else {
  renderSourceTable();
}

// Render the source effectiveness table: only includes sources present in BOTH
// the HR dataset and the applicant pipeline. Highlights high/low values with color.
function renderSourceTable() {
  // Collect the set of sources present in the HR dataset.
  var hrSourceKeys = {};
  if (typeof HR_SOURCE_STATS !== "undefined") {
    for (var key in HR_SOURCE_STATS) {
      if (HR_SOURCE_STATS.hasOwnProperty(key)) {
        hrSourceKeys[key] = true;
      }
    }
  }

  // Only show sources that appear in BOTH the HR dataset and the applicant
  // pipeline (i.e. sources shared between the two datasets).
  for (var key in sourceLookup) {
    if (sourceLookup.hasOwnProperty(key) && hrSourceKeys[key] && !addedKeys[key]) {
      allSourceNames.push(key);
      addedKeys[key] = true;
    }
  }

  // First pass: find the highest hire count and highest drop-off percentage across
  // all shared sources so we can automatically highlight only the top source in each.
  var maxHires = 0;
  var maxDropOff = -1;
  for (var i = 0; i < allSourceNames.length; i++) {
    var hrKey0 = allSourceNames[i];
    var displayName0 = hrToDisplay[hrKey0] || hrKey0;
    var pipelineData0 = sourceLookup[displayName0] || sourceLookup[hrKey0] || null;
    if (pipelineData0) {
      if (pipelineData0.hires > maxHires) {
        maxHires = pipelineData0.hires;
      }
      var dropPct0 = parseInt(pipelineData0.dropOff, 10);
      if (dropPct0 > maxDropOff) {
        maxDropOff = dropPct0;
      }
    }
  }

  // Build table rows for each shared source.
  var tableHTML = "";
  for (var i = 0; i < allSourceNames.length; i++) {
    var hrKey = allSourceNames[i];
    var displayName = hrToDisplay[hrKey] || hrKey;
    var pipelineData = sourceLookup[displayName] || sourceLookup[hrKey] || null;

    // Build the candidates, hires, and drop-off cells from pipeline data.
    // Highlight the single highest hire count in green and the highest drop-off in red.
    var candidatesCell, hireCell, dropCell;
    if (pipelineData) {
      candidatesCell = "<td>" + pipelineData.candidates + "</td>";

      // Only the source with the highest hire count gets the green highlight.
      if (maxHires > 0 && pipelineData.hires === maxHires) {
        hireCell = '<td style="color:#16A34A;font-weight:600;">' + pipelineData.hires + "</td>";
      } else {
        hireCell = "<td>" + pipelineData.hires + "</td>";
      }

      // Only the source with the highest drop-off percentage gets the red highlight.
      if (maxDropOff > 0 && parseInt(pipelineData.dropOff, 10) === maxDropOff) {
        dropCell = '<td style="color:#DC2626;font-weight:600;">' + pipelineData.dropOff + "</td>";
      } else {
        dropCell = "<td>" + pipelineData.dropOff + "</td>";
      }
    } else {
      // No pipeline data for this source; show em dashes.
      candidatesCell = "<td>—</td>";
      hireCell = "<td>—</td>";
      dropCell = "<td>—</td>";
    }

    // Build the engagement and turnover cells from HR dataset stats.
    // Highlight low engagement (<4.0) and high turnover (>=30%) in red.
    var engagementCell = "<td>N/A</td>";
    var turnoverCell = "<td>N/A</td>";
    var stats = (typeof HR_SOURCE_STATS !== "undefined") ? HR_SOURCE_STATS[hrKey] : null;

    if (stats && stats.count > 0) {
      var avg = stats.avgEngagement.toFixed(2);
      var turnStr = stats.turnoverPct + "%";

      if (stats.avgEngagement < 4.0) {
        engagementCell = '<td style="color:#DC2626;font-weight:600;">' + avg + ' / 5</td>';
      } else {
        engagementCell = '<td>' + avg + ' / 5</td>';
      }

      if (stats.turnoverPct >= 30) {
        turnoverCell = '<td style="color:#DC2626;font-weight:600;">' + turnStr + '</td>';
      } else {
        turnoverCell = '<td>' + turnStr + '</td>';
      }
    }

    // Assemble the row HTML with all six cells.
    tableHTML = tableHTML +
      "<tr>" +
        "<td>" + displayName + "</td>" +
        candidatesCell +
        hireCell +
        dropCell +
        engagementCell +
        turnoverCell +
      "</tr>";
  }
  // #sourceTable is defined in reports.html.
  document.querySelector("#sourceTable tbody").innerHTML = tableHTML;
}

// ---------- Export Report Function ----------
// Export all candidates to a CSV file and trigger a browser download.
// Escapes double quotes in fields and wraps text fields in quotes.
function exportCandidatesCSV() {
  // Abort if there's no data to export.
  if (!CANDIDATES || CANDIDATES.length === 0) {
    alert("No candidate data available to export.");
    return;
  }

  // Define the CSV column headers.
  var headers = ["ID", "Name", "Role", "Department", "Source", "Stage", "Status", "Last Contact (Days)", "Hiring Manager", "Next Step", "Notes"];

  // Start the CSV with the header row.
  var csvRows = [headers.join(",")];

  // Build a CSV row for each candidate, quoting text fields and escaping inner quotes.
  // normalizeSource and effectiveStatus are defined in js/data.js.
  for (var i = 0; i < CANDIDATES.length; i++) {
    var c = CANDIDATES[i];
    var row = [
      c.id,
      '"' + (c.name || '') + '"',
      '"' + (c.role || '') + '"',
      '"' + (c.dept || '') + '"',
      '"' + (normalizeSource(c.source) || '') + '"',
      '"' + (c.stage || '') + '"',
      '"' + (effectiveStatus(c) || '') + '"',
      c.lastContact,
      '"' + (c.manager || '') + '"',
      '"' + (c.nextStep || '') + '"',
      '"' + (c.notes || '').replace(/"/g, '""') + '"'
    ];
    csvRows.push(row.join(","));
  }

  // Join all rows into a single CSV string and create a downloadable Blob.
  var csvString = csvRows.join("\n");
  var blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  var today = new Date().toISOString().split('T')[0];

  // Trigger the download with a dated filename, then clean up the link element.
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "candidate_report_" + today + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------- Export Source Effectiveness Report Function ----------
// Export the Source Effectiveness table to a CSV file and trigger a browser download.
// Includes one row per shared source with: Source, Candidates, Hires,
// First-Round Drop-Off, Avg. Engagement, and Turnover Rate.
function exportSourceEffectivenessCSV() {
  // Abort if there are no shared sources to export.
  if (!allSourceNames || allSourceNames.length === 0) {
    alert("No source effectiveness data available to export.");
    return;
  }

  // Define the CSV column headers matching the Source Effectiveness table.
  var headers = ["Source", "Candidates", "Hires", "First-Round Drop-Off", "Avg. Engagement", "Turnover Rate"];

  // Start the CSV with the header row.
  var csvRows = [headers.join(",")];

  // Recompute the max values so the exported data matches what's displayed.
  var expMaxHires = 0;
  var expMaxDropOff = -1;
  for (var i = 0; i < allSourceNames.length; i++) {
    var hrKeyE = allSourceNames[i];
    var displayNameE = hrToDisplay[hrKeyE] || hrKeyE;
    var pipelineDataE = sourceLookup[displayNameE] || sourceLookup[hrKeyE] || null;
    if (pipelineDataE) {
      if (pipelineDataE.hires > expMaxHires) expMaxHires = pipelineDataE.hires;
      var dropPctE = parseInt(pipelineDataE.dropOff, 10);
      if (dropPctE > expMaxDropOff) expMaxDropOff = dropPctE;
    }
  }

  // Build a CSV row for each shared source, quoting text fields and escaping inner quotes.
  for (var i = 0; i < allSourceNames.length; i++) {
    var hrKey = allSourceNames[i];
    var displayName = hrToDisplay[hrKey] || hrKey;
    var pipelineData = sourceLookup[displayName] || sourceLookup[hrKey] || null;
    var stats = (typeof HR_SOURCE_STATS !== "undefined") ? HR_SOURCE_STATS[hrKey] : null;

    // Gather the six column values, falling back to "N/A" where data is missing.
    var candidatesVal = pipelineData ? pipelineData.candidates : "N/A";
    var hiresVal = pipelineData ? pipelineData.hires : "N/A";
    var dropOffVal = pipelineData ? pipelineData.dropOff : "N/A";
    var engagementVal = (stats && stats.count > 0) ? (stats.avgEngagement.toFixed(2) + " / 5") : "N/A";
    var turnoverVal = (stats && stats.count > 0) ? (stats.turnoverPct + "%") : "N/A";

    var row = [
      '"' + (displayName || '').replace(/"/g, '""') + '"',
      candidatesVal,
      hiresVal,
      '"' + (dropOffVal + '').replace(/"/g, '""') + '"',
      '"' + (engagementVal + '').replace(/"/g, '""') + '"',
      '"' + (turnoverVal + '').replace(/"/g, '""') + '"'
    ];
    csvRows.push(row.join(","));
  }

  // Join all rows into a single CSV string and create a downloadable Blob.
  var csvString = csvRows.join("\n");
  var blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  var today = new Date().toISOString().split('T')[0];

  // Trigger the download with a dated filename, then clean up the link element.
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "source_effectiveness_report_" + today + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
