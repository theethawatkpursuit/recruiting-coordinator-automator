// Read the candidate id from the web address (?id=)
var params = new URLSearchParams(window.location.search);
var id = parseInt(params.get("id"), 10);

// Find the matching candidate
var c = null;
for (var i = 0; i < CANDIDATES.length; i++) {
  if (CANDIDATES[i].id === id) {
    c = CANDIDATES[i];
  }
}

// If no candidate was found, just show the first one
if (c === null) {
  c = CANDIDATES[0];
}

var b = statusBadge(c.status);

// Decision point: Is candidate at risk? If so, show a warning banner
var riskBanner = "";
if (c.status === "risk") {
  riskBanner =
    '<div class="alert-banner">' +
      "This candidate has had no contact in " + c.lastContact +
      " days and is at risk of going cold. Take action now." +
    "</div>";
}

// Build the whole candidate detail view
var html =
  riskBanner +
  '<div class="panel">' +
    '<div class="detail-header">' +
      "<div>" +
        "<h1>" + c.name + "</h1>" +
        '<p style="color:#6B7280;">' + c.role + " - " + c.dept + "</p>" +
      "</div>" +
      '<span class="badge ' + b.cls + '">' + b.text + "</span>" +
    "</div>" +

    '<div class="detail-grid">' +
      '<div class="field"><div class="k">Source</div><div class="v">' + c.source + "</div></div>" +
      '<div class="field"><div class="k">Current Stage</div><div class="v">' + c.stage + "</div></div>" +
      '<div class="field"><div class="k">Last Contact</div><div class="v">' + c.lastContact + " days ago</div></div>" +
      '<div class="field"><div class="k">Hiring Manager</div><div class="v">' + c.manager + "</div></div>" +
      '<div class="field"><div class="k">Interview</div><div class="v">' + c.interviewDate + "</div></div>" +
      '<div class="field"><div class="k">Next Step</div><div class="v">' + c.nextStep + "</div></div>" +
    "</div>" +

    '<div class="action-row">' +
      '<button class="btn-primary btn-small" onclick="alert(\'Update sent (placeholder)\')">Send Update</button>' +
      '<button class="btn-secondary btn-small" onclick="alert(\'Scheduling... (placeholder)\')">Schedule Interview</button>' +
      '<button class="btn-secondary btn-small" onclick="alert(\'Feedback requested (placeholder)\')">Request Feedback</button>' +
      '<button class="btn-secondary btn-small" onclick="alert(\'Stage moved (placeholder)\')">Move Stage</button>' +
      '<button class="btn-secondary btn-small" onclick="alert(\'Candidate archived (placeholder)\')">Archive</button>' +
    "</div>" +

    '<h2 style="font-size:16px;margin-bottom:8px;">Notes</h2>' +
    '<div class="notes-box">' + c.notes + "</div>" +
  "</div>";

document.getElementById("candidateDetail").innerHTML = html;