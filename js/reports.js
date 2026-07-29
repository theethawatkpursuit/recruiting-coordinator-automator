// ---------- Report Stat Cards ----------

var totalCandidates = CANDIDATES.filter(function(c) { return isActiveCandidate(c); }).length;

var totalHires = 0;
for (var i = 0; i < CANDIDATES.length; i++) {
  if (isHired(CANDIDATES[i])) {
    totalHires++;
  }
}

var riskCount = 0;
for (var i = 0; i < CANDIDATES.length; i++) {
  if (isAtRisk(CANDIDATES[i])) {
    riskCount++;
  }
}

var reportStats = [
  { num: getOpenRolesCount(), label: "Open Roles", cls: "" },
  { num: totalCandidates, label: "Candidates in Process", cls: "" },
  { num: riskCount, label: "At-Risk Candidates", cls: "warning" },
  { num: "28 days", label: "Avg. Time-to-Hire", cls: "" },
  { num: totalHires, label: "Total Hires", cls: "success" }
];

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

var sourceLookup = {};
var hrToDisplay = {};

for (var i = 0; i < CANDIDATES.length; i++) {
  var c = CANDIDATES[i];
  var src = normalizeSource(c.source);

  if (!sourceLookup[src]) {
    sourceLookup[src] = { candidates: 0, hires: 0, firstRoundDropouts: 0 };
  }
  sourceLookup[src].candidates++;

  if (isHired(c)) {
    sourceLookup[src].hires++;
  }
  if (isFirstRoundDropout(c)) {
    sourceLookup[src].firstRoundDropouts++;
  }
}

for (var key in sourceLookup) {
  var s = sourceLookup[key];
  s.dropOff = s.candidates > 0
    ? Math.round((s.firstRoundDropouts / s.candidates) * 100) + "%"
    : "0%";
}

var allSourceNames = [];
var addedKeys = {};

if (window.hrDataPromise) {
  window.hrDataPromise.then(function() {
    renderSourceTable();
  });
} else {
  renderSourceTable();
}

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

  var tableHTML = "";
  for (var i = 0; i < allSourceNames.length; i++) {
    var hrKey = allSourceNames[i];
    var displayName = hrToDisplay[hrKey] || hrKey;
    var pipelineData = sourceLookup[displayName] || sourceLookup[hrKey] || null;

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

  var headers = ["ID", "Name", "Role", "Department", "Source", "Stage", "Status", "Last Contact (Days)", "Hiring Manager", "Next Step", "Notes"];

  var csvRows = [headers.join(",")];

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
