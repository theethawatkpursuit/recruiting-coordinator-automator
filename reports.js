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
// Highlights which sources produce the best hires (Priya's key question)

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