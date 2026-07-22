// Get the candidate id from the URL
// Example: candidate.html?id=3
var params = new URLSearchParams(window.location.search);
var candidateId = Number(params.get("id"));

var selectedCandidate = null;

// Find the candidate with this id
for (var i = 0; i < CANDIDATES.length; i++) {
  if (CANDIDATES[i].id === candidateId) {
    selectedCandidate = CANDIDATES[i];
  }
}

// If no matching candidate is found, show an error
if (selectedCandidate === null) {
  document.getElementById("candidateDetail").innerHTML =
    '<section class="panel">' +
      '<h2>Candidate Not Found</h2>' +
      '<p>This candidate may have been deleted or the link is incorrect.</p>' +
      '<a href="candidates-list.html" class="btn-secondary">Back to All Candidates</a>' +
    '</section>';
} else {
  showCandidateDetail(selectedCandidate);
}


// Display the candidate detail card
function showCandidateDetail(candidate) {
  var detailHTML = "";

  detailHTML = detailHTML +
    '<section class="panel candidate-profile">' +
      '<div class="profile-header">' +
        '<div>' +
          '<h2>' + candidate.name + '</h2>' +
          '<p>' + candidate.role + ' — ' + candidate.dept + '</p>' +
        '</div>' +
        '<span class="badge ' + statusBadge(candidate.status).cls + '">' +
          statusBadge(candidate.status).text +
        '</span>' +
      '</div>' +

      '<div class="detail-grid">' +
        '<div class="detail-item">' +
          '<strong>Stage</strong>' +
          '<span>' + candidate.stage + '</span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Source</strong>' +
          '<span>' + candidate.source + '</span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Hiring Manager</strong>' +
          '<span>' + candidate.manager + '</span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Last Contact</strong>' +
          '<span>' + candidate.lastContact + ' days ago</span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Interview Date</strong>' +
          '<span>' + candidate.interviewDate + '</span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Next Step</strong>' +
          '<span>' + candidate.nextStep + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="notes-box">' +
        '<h3>Notes</h3>' +
        '<p>' + candidate.notes + '</p>' +
      '</div>' +

      '<div class="candidate-actions">' +
        '<a href="candidates-list.html" class="btn-secondary">Back to All Candidates</a>' +
        '<button class="btn-danger" onclick="deleteCandidate(' + candidate.id + ')">Delete Candidate</button>' +
      '</div>' +
    '</section>';

  document.getElementById("candidateDetail").innerHTML = detailHTML;
}


// Delete the selected candidate
function deleteCandidate(id) {
  var confirmDelete = confirm("Are you sure you want to delete this candidate? This cannot be undone.");

  if (confirmDelete === false) {
    return;
  }

  // Find the candidate position in the array
  var deleteIndex = -1;

  for (var i = 0; i < CANDIDATES.length; i++) {
    if (CANDIDATES[i].id === id) {
      deleteIndex = i;
    }
  }

  // If found, remove from the array
  if (deleteIndex !== -1) {
    CANDIDATES.splice(deleteIndex, 1);

    // Save updated list to localStorage
    saveCandidates();

    // Go back to the list page
    window.location.href = "candidates-list.html";
  }
}