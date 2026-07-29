// ---------- Report Stat Cards ----------

// Count actual candidates currently in the system
var totalCandidates = CANDIDATES.length;

// Add up all hires from the active CANDIDATES array
var totalHires = 0;
for (var i = 0; i < CANDIDATES.length; i++) {
  if (CANDIDATES[i].stage === "Offer") {
    totalHires++;
  }
}

// Count at-risk candidates
var riskCount = 0;
for (var i = 0; i < CANDIDATES.length; i++) {
  if (CANDIDATES[i].status === "risk") {
    riskCount = riskCount + 1;
  }
}

// Build the list of stat cards
var reportStats = [
  { num: 12, label: "Open Roles", cls: "" },
  { num: totalCandidates, label: "Candidates in Process", cls: "" },
  { num: riskCount, label: "At-Risk Candidates", cls: "warning" },
  { num: "28 days", label: "Avg. Time-to-Hire", cls: "" },
  { num: totalHires, label: "Total Hires", cls: "success" }
];

// Turn each stat into HTML
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

// Build a lookup dynamically from the CANDIDATES array
var sourceLookup = {};
var hrToDisplay = {};

for (var i = 0; i < CANDIDATES.length; i++) {
  var c = CANDIDATES[i];
  if (!sourceLookup[c.source]) {
    sourceLookup[c.source] = { candidates: 0, hires: 0, dropOffs: 0 };
  }
  sourceLookup[c.source].candidates++;
  
  if (c.stage === "Offer") {
    sourceLookup[c.source].hires++;
  }
  if (c.status === "risk") {
    sourceLookup[c.source].dropOffs++;
  }
}

for (var key in sourceLookup) {
  var s = sourceLookup[key];
  s.dropOff = Math.round((s.dropOffs / s.candidates) * 100) + "%";
}

// Collect all source names: start with HR_SOURCE_STATS keys, then add any SOURCES not yet covered
var allSourceNames = [];
var addedKeys = {};

if (window.hrDataPromise) {
  window.hrDataPromise.then(function() {
    renderSourceTable();
  });
} else {
  // Fallback if promise isn't defined
  renderSourceTable();
}

function renderSourceTable() {
  if (typeof HR_SOURCE_STATS !== "undefined") {
    for (var key in HR_SOURCE_STATS) {
      if (HR_SOURCE_STATS.hasOwnProperty(key)) {
        allSourceNames.push(key);
        addedKeys[key] = true;
      }
    }
  }

  // Add any sources from CANDIDATES that weren't in HR_SOURCE_STATS
  for (var key in sourceLookup) {
    if (sourceLookup.hasOwnProperty(key) && !addedKeys[key]) {
      allSourceNames.push(key);
      addedKeys[key] = true;
    }
  }

var tableHTML = "";
for (var i = 0; i < allSourceNames.length; i++) {
  var hrKey = allSourceNames[i];
  var displayName = hrToDisplay[hrKey] || hrKey;

  // Try to find matching pipeline data from SOURCES
  var pipelineData = sourceLookup[displayName] || sourceLookup[hrKey] || null;

  // Pipeline columns
  var candidatesCell, hireCell, dropCell;
  if (pipelineData) {
    candidatesCell = "<td>" + pipelineData.candidates + "</td>";

    var rate = (pipelineData.hires / pipelineData.candidates) * 100;
    if (rate >= 40) {
      hireCell = '<td style="color:#16A34A;font-weight:600;">' + pipelineData.hires + "</td>";
    } else {
      hireCell = "<td>" + pipelineData.hires + "</td>";
    }

    if (parseInt(pipelineData.dropOff) >= 35) {
      dropCell = '<td style="color:#DC2626;font-weight:600;">' + pipelineData.dropOff + "</td>";
    } else {
      dropCell = "<td>" + pipelineData.dropOff + "</td>";
    }
  } else {
    candidatesCell = "<td>—</td>";
    hireCell = "<td>—</td>";
    dropCell = "<td>—</td>";
  }

  // Predictive metrics from HR_SOURCE_STATS
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
  document.querySelector("#sourceTable tbody").innerHTML = tableHTML;
}

// ---------- Export Report Function ----------

function exportCandidatesCSV() {
  if (!CANDIDATES || CANDIDATES.length === 0) {
    alert("No candidate data available to export.");
    return;
  }

  // 1. Column Headers
  var headers = ["ID", "Name", "Role", "Department", "Source", "Stage", "Status", "Last Contact (Days)", "Hiring Manager", "Next Step", "Notes"];

  // 2. Build Rows
  var csvRows = [headers.join(",")];

  for (var i = 0; i < CANDIDATES.length; i++) {
    var c = CANDIDATES[i];
    var row = [
      c.id,
      '"' + (c.name || '') + '"',
      '"' + (c.role || '') + '"',
      '"' + (c.dept || '') + '"',
      '"' + (c.source || '') + '"',
      '"' + (c.stage || '') + '"',
      '"' + (c.status || '') + '"',
      c.lastContact,
      '"' + (c.manager || '') + '"',
      '"' + (c.nextStep || '') + '"',
      '"' + (c.notes || '').replace(/"/g, '""') + '"'
    ];
    csvRows.push(row.join(","));
  }

  // 3. Create blob and download
  var csvString = csvRows.join("\n");
  var blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  var today = new Date().toISOString().split('T')[0];

  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "candidate_report_" + today + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}