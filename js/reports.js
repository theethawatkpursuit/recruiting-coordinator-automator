// ---------- Report Stat Cards ----------

// Count actual candidates currently in the system
var totalCandidates = CANDIDATES.length;

// Add up all hires from every source
var totalHires = 0;
for (var i = 0; i < SOURCES.length; i++) {
  totalHires = totalHires + SOURCES[i].hires;
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

// Build a lookup from SOURCES for pipeline data, mapping display names to HR dataset names
var sourceLookup = {};
var hrToDisplay = { "Employee Referral": "Referrals" };
for (var i = 0; i < SOURCES.length; i++) {
  sourceLookup[SOURCES[i].source] = SOURCES[i];
}

// Collect all source names: start with HR_SOURCE_STATS keys, then add any SOURCES not yet covered
var allSourceNames = [];
var addedKeys = {};

if (typeof HR_SOURCE_STATS !== "undefined") {
  for (var key in HR_SOURCE_STATS) {
    if (HR_SOURCE_STATS.hasOwnProperty(key)) {
      allSourceNames.push(key);
      addedKeys[key] = true;
    }
  }
}

// Add any SOURCES entries that weren't in HR_SOURCE_STATS (e.g. "Agency")
for (var i = 0; i < SOURCES.length; i++) {
  var mappedKey = SOURCES[i].source;
  if (mappedKey === "Referrals") mappedKey = "Employee Referral";
  if (!addedKeys[mappedKey]) {
    allSourceNames.push(mappedKey);
    addedKeys[mappedKey] = true;
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