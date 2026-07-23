// js/candidate.js

// Get the candidate id from the URL (e.g. candidate.html?id=3)
var params = new URLSearchParams(window.location.search);
var candidateId = Number(params.get("id"));

var selectedCandidate = null;
var isEditing = false; // Tracks whether edit mode is active

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
  renderPage();
}


// Decide whether to render view mode or edit mode
function renderPage() {
  if (isEditing) {
    showEditForm(selectedCandidate);
  } else {
    showCandidateDetail(selectedCandidate);
  }
}


// Convert days ago integer into YYYY-MM-DD string format for edit date input
function getLastContactDateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - (daysAgo || 0));
  return d.toISOString().split('T')[0];
}


// --- VIEW MODE ---
function showCandidateDetail(candidate) {
  var hasDate = candidate.interviewDate && 
                candidate.interviewDate !== "" && 
                candidate.interviewDate !== "Not scheduled" && 
                candidate.interviewDate !== "Pending";

  var displayDate = "Not scheduled";
  if (hasDate) {
    var d = new Date(candidate.interviewDate);
    if (!isNaN(d.getTime())) {
      displayDate = d.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      displayDate = candidate.interviewDate;
    }
  }

  var pickerValue = hasDate ? candidate.interviewDate : "";

  var detailHTML = "";

  detailHTML +=
    '<section class="panel candidate-profile">' +
      '<div class="profile-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">' +
        '<div>' +
          '<h2>' + candidate.name + '</h2>' +
          '<p>' + candidate.role + ' — ' + candidate.dept + '</p>' +
        '</div>' +
        '<div style="display: flex; gap: 10px; align-items: center;">' +
          '<span class="badge ' + statusBadge(candidate.status).cls + '">' +
            statusBadge(candidate.status).text +
          '</span>' +
          '<button class="btn-secondary" onclick="toggleEditMode(true)">Edit Profile</button>' +
        '</div>' +
      '</div>' +

      '<div class="detail-grid">' +
        '<div class="detail-item">' +
          '<strong>Stage</strong>' +
          '<span>' + candidate.stage + '</span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Source</strong>' +
          '<span><span class="source-tag">' + candidate.source + '</span></span>' +
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
          '<span>' + displayDate + '</span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Next Step</strong>' +
          '<span>' + candidate.nextStep + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="notes-box" style="margin-top: 20px;">' +
        '<h3>Notes</h3>' +
        '<p>' + (candidate.notes || "No notes added yet.") + '</p>' +
      '</div>' +

      '<!-- Schedule Interview Section -->' +
      '<div class="schedule-box" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">' +
        '<h3>Schedule Interview</h3>' +
        '<p style="margin-bottom: 10px; color: #666;">Select a date and time to place this interview on the Calendar:</p>' +
        '<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">' +
          '<input type="datetime-local" id="interviewPicker" value="' + pickerValue + '" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px;">' +
          '<button class="btn-primary" onclick="scheduleInterview(' + candidate.id + ')">' +
            (hasDate ? 'Reschedule Interview' : 'Schedule Interview') +
          '</button>';

  if (hasDate) {
    detailHTML += '<button class="btn-secondary" onclick="cancelInterview(' + candidate.id + ')">Cancel Schedule</button>';
  }

  detailHTML +=
        '</div>' +
      '</div>' +

      '<div class="candidate-actions" style="margin-top: 25px;">' +
        '<a href="candidates-list.html" class="btn-secondary">Back to All Candidates</a>' +
        '<button class="btn-danger" onclick="deleteCandidate(' + candidate.id + ')">Delete Candidate</button>' +
      '</div>' +
    '</section>';

  document.getElementById("candidateDetail").innerHTML = detailHTML;
}


// --- EDIT MODE FORM ---
function showEditForm(candidate) {
  var stageOptions = "";
  for (var s = 0; s < STAGES.length; s++) {
    var selected = STAGES[s] === candidate.stage ? " selected" : "";
    stageOptions += '<option value="' + STAGES[s] + '"' + selected + '>' + STAGES[s] + '</option>';
  }

  var statusOptions =
    '<option value="ok"' + (candidate.status === "ok" ? " selected" : "") + '>On Track</option>' +
    '<option value="action"' + (candidate.status === "action" ? " selected" : "") + '>Needs Action</option>' +
    '<option value="wait"' + (candidate.status === "wait" ? " selected" : "") + '>Waiting Feedback</option>' +
    '<option value="risk"' + (candidate.status === "risk" ? " selected" : "") + '>At Risk</option>';

  var editHTML =
    '<section class="panel candidate-profile">' +
      '<h2>Edit Candidate Details</h2>' +
      '<form onsubmit="saveCandidateEdits(event)" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">' +
        
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">' +
          '<div>' +
            '<label><strong>Full Name</strong></label>' +
            '<input type="text" id="editName" value="' + candidate.name + '" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
          '</div>' +
          '<div>' +
            '<label><strong>Role</strong></label>' +
            '<input type="text" id="editRole" value="' + candidate.role + '" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
          '</div>' +
        '</div>' +

        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">' +
          '<div>' +
            '<label><strong>Department</strong></label>' +
            '<input type="text" id="editDept" value="' + candidate.dept + '" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
          '</div>' +
          '<div>' +
            '<label><strong>Source</strong></label>' +
            '<input type="text" id="editSource" value="' + candidate.source + '" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
          '</div>' +
        '</div>' +

        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">' +
          '<div>' +
            '<label><strong>Stage</strong></label>' +
            '<select id="editStage" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' + stageOptions + '</select>' +
          '</div>' +
          '<div>' +
            '<label><strong>Status Alert</strong></label>' +
            '<select id="editStatus" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' + statusOptions + '</select>' +
          '</div>' +
        '</div>' +

        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">' +
          '<div>' +
            '<label><strong>Hiring Manager</strong></label>' +
            '<input type="text" id="editManager" value="' + candidate.manager + '" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
          '</div>' +
          '<div>' +
            '<label><strong>Last Contact Date</strong></label>' +
            '<input type="date" id="editLastContactDate" value="' + getLastContactDateString(candidate.lastContact) + '" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
          '</div>' +
        '</div>' +

        '<div>' +
          '<label><strong>Next Step</strong></label>' +
          '<input type="text" id="editNextStep" value="' + candidate.nextStep + '" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
        '</div>' +

        '<div>' +
          '<label><strong>Notes</strong></label>' +
          '<textarea id="editNotes" rows="4" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' + candidate.notes + '</textarea>' +
        '</div>' +

        '<div style="display: flex; gap: 10px; margin-top: 10px;">' +
          '<button type="submit" class="btn-primary">Save Changes</button>' +
          '<button type="button" class="btn-secondary" onclick="toggleEditMode(false)">Cancel</button>' +
        '</div>' +

      '</form>' +
    '</section>';

  document.getElementById("candidateDetail").innerHTML = editHTML;
}


// Switch between View Mode and Edit Mode
function toggleEditMode(enable) {
  isEditing = enable;
  renderPage();
}


// Save form updates back to CANDIDATES and localStorage
function saveCandidateEdits(event) {
  event.preventDefault();

  selectedCandidate.name = document.getElementById("editName").value;
  selectedCandidate.role = document.getElementById("editRole").value;
  selectedCandidate.dept = document.getElementById("editDept").value;
  selectedCandidate.source = document.getElementById("editSource").value;
  selectedCandidate.stage = document.getElementById("editStage").value;
  selectedCandidate.status = document.getElementById("editStatus").value;
  selectedCandidate.manager = document.getElementById("editManager").value;
  selectedCandidate.nextStep = document.getElementById("editNextStep").value;
  selectedCandidate.notes = document.getElementById("editNotes").value;

  // Process Last Contact Date calculation in Edit Mode
  var contactDateVal = document.getElementById("editLastContactDate").value;
  if (contactDateVal) {
    var selDate = new Date(contactDateVal);
    var now = new Date();
    var diffMs = Math.max(0, now - selDate);
    var daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    selectedCandidate.lastContact = daysAgo;

    // Auto-set risk status if 7+ days ago
    if (daysAgo >= 7) {
      selectedCandidate.status = "risk";
    }
  }

  // Persist update in localStorage
  saveCandidates();

  // Exit edit mode and re-render profile
  isEditing = false;
  renderPage();
}


// Schedule or reschedule an interview
function scheduleInterview(id) {
  var picker = document.getElementById("interviewPicker");
  var selectedDate = picker.value;

  if (!selectedDate) {
    alert("Please select a date and time before saving.");
    return;
  }

  for (var i = 0; i < CANDIDATES.length; i++) {
    if (CANDIDATES[i].id === id) {
      CANDIDATES[i].interviewDate = selectedDate;

      if (CANDIDATES[i].stage === "New Applicant" || CANDIDATES[i].stage === "Screen") {
        CANDIDATES[i].stage = "Interview";
      }

      selectedCandidate = CANDIDATES[i];
      break;
    }
  }

  saveCandidates();
  renderPage();
}


// Cancel a scheduled interview
function cancelInterview(id) {
  var confirmCancel = confirm("Are you sure you want to cancel this scheduled interview?");

  if (confirmCancel === false) {
    return;
  }

  for (var i = 0; i < CANDIDATES.length; i++) {
    if (CANDIDATES[i].id === id) {
      CANDIDATES[i].interviewDate = "";
      selectedCandidate = CANDIDATES[i];
      break;
    }
  }

  saveCandidates();
  renderPage();
}


// Delete the selected candidate
function deleteCandidate(id) {
  var confirmDelete = confirm("Are you sure you want to delete this candidate? This cannot be undone.");

  if (confirmDelete === false) {
    return;
  }

  var deleteIndex = -1;

  for (var i = 0; i < CANDIDATES.length; i++) {
    if (CANDIDATES[i].id === id) {
      deleteIndex = i;
    }
  }

  if (deleteIndex !== -1) {
    CANDIDATES.splice(deleteIndex, 1);
    saveCandidates();
    window.location.href = "candidates-list.html";
  }
}