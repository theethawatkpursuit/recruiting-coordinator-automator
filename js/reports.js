// ---------- Report Stat Cards ----------

// Add up all candidates and all hires from every source
var totalCandidates = 0;
var totalHires = 0;
for (var i = 0; i < SOURCES.length; i++) {
  totalCandidates = totalCandidates + SOURCES[i].candidates;
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

var tableHTML = "";
for (var i = 0; i < SOURCES.length; i++) {
  var s = SOURCES[i];

  // Work out the hire rate as a percentage
  var rate = (s.hires / s.candidates) * 100;

  // Best hire rates shown in green
  var hireCell;
  if (rate >= 40) {
    hireCell = '<td style="color:#16A34A;font-weight:600;">' + s.hires + "</td>";
  } else {
    hireCell = "<td>" + s.hires + "</td>";
  }

  // High drop-off rates shown in red
  var dropCell;
  if (parseInt(s.dropOff) >= 35) {
    dropCell = '<td style="color:#DC2626;font-weight:600;">' + s.dropOff + "</td>";
  } else {
    dropCell = "<td>" + s.dropOff + "</td>";
  }

  tableHTML = tableHTML +
    "<tr>" +
      "<td>" + s.source + "</td>" +
      "<td>" + s.candidates + "</td>" +
      hireCell +
      dropCell +
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