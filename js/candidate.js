// js/candidate.js
// Logic for the single candidate profile page: view details, edit, schedule/cancel
// interviews, and delete the candidate. The candidate is identified by the ?id= URL param.
// CANDIDATES, ALL_STAGES, FIRST_ROUND_STAGES, COLD_CONTACT_DAYS, statusBadge,
// effectiveStatus, normalizeSource, isAtRisk, isActiveCandidate, and saveCandidates
// are defined in js/data.js.

// Get the candidate id from the URL (e.g. candidate.html?id=3)
var params = new URLSearchParams(window.location.search);
var candidateId = Number(params.get("id"));

// Will hold the candidate object once found; isEditing tracks view vs. edit mode.
var selectedCandidate = null;
var isEditing = false; // Tracks whether edit mode is active

// Find the candidate with this id in the global CANDIDATES array.
// CANDIDATES is defined in js/data.js.
for (var i = 0; i < CANDIDATES.length; i++) {
  if (CANDIDATES[i].id === candidateId) {
    selectedCandidate = CANDIDATES[i];
  }
}

// If no matching candidate is found, show an error panel with a back link.
// #candidateDetail is defined in candidate.html.
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


// Decide whether to render view mode or edit mode based on the isEditing flag.
function renderPage() {
  if (isEditing) {
    showEditForm(selectedCandidate);
  } else {
    showCandidateDetail(selectedCandidate);
  }
}


// Convert a "days ago" integer into a YYYY-MM-DD string for the edit form's date input.
function getLastContactDateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - (daysAgo || 0));
  return d.toISOString().split('T')[0];
}


// --- VIEW MODE ---
// Render the read-only candidate profile: header, detail grid, notes, interview
// scheduler, and action buttons (back, delete).
function showCandidateDetail(candidate) {
  // Determine whether the candidate has a real interview date (not a placeholder).
  var hasDate = candidate.interviewDate && 
                candidate.interviewDate !== "" && 
                candidate.interviewDate !== "Not scheduled" && 
                candidate.interviewDate !== "Pending";

  // Format the interview date for display, or fall back to "Not scheduled".
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

  // Value to pre-fill the datetime-local picker (empty if no date).
  var pickerValue = hasDate ? candidate.interviewDate : "";

  var detailHTML = "";

  // Profile header: name, role/dept, status badge, and Edit button.
  // statusBadge and effectiveStatus are defined in js/data.js.
  detailHTML +=
    '<section class="panel candidate-profile">' +
      '<div class="profile-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">' +
        '<div>' +
          '<h2>' + candidate.name + '</h2>' +
          '<p>' + candidate.role + ' — ' + candidate.dept + '</p>' +
        '</div>' +
        '<div style="display: flex; gap: 10px; align-items: center;">' +
          '<span class="badge ' + statusBadge(effectiveStatus(candidate)).cls + '">' +
            statusBadge(effectiveStatus(candidate)).text +
          '</span>' +
          '<button class="btn-secondary" onclick="toggleEditMode(true)">Edit Profile</button>' +
        '</div>' +
      '</div>' +

      // Detail grid: stage, source, manager, last contact, interview date, next step.
      '<div class="detail-grid">' +
        '<div class="detail-item">' +
          '<strong>Stage</strong>' +
          '<span>' + candidate.stage + '</span>' +
        '</div>' +

        // normalizeSource is defined in js/data.js.
        '<div class="detail-item">' +
          '<strong>Source</strong>' +
          '<span><span class="source-tag">' + normalizeSource(candidate.source) + '</span></span>' +
        '</div>' +

        '<div class="detail-item">' +
          '<strong>Hiring Manager</strong>' +
          '<span>' + candidate.manager + '</span>' +
        '</div>' +

        // isAtRisk is defined in js/data.js.
        '<div class="detail-item">' +
          '<strong>Last Contact</strong>' +
          '<span>' + candidate.lastContact + ' days ago' +
            (isAtRisk(candidate) ? ' <span class="badge badge-risk" style="margin-left:8px;">Going Cold</span>' : '') +
          '</span>' +
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

      // Notes section.
      '<div class="notes-box" style="margin-top: 20px;">' +
        '<h3>Notes</h3>' +
        '<p>' + (candidate.notes || "No notes added yet.") + '</p>' +
      '</div>' +

      // Schedule Interview section: datetime picker, schedule/reschedule, and cancel buttons.
      '<!-- Schedule Interview Section -->' +
      '<div class="schedule-box" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">' +
        '<h3>Schedule Interview</h3>' +
        '<p style="margin-bottom: 10px; color: #666;">Select a date and time to place this interview on the Calendar:</p>' +
        '<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">' +
          '<input type="datetime-local" id="interviewPicker" value="' + pickerValue + '" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px;">' +
          '<button class="btn-primary" onclick="scheduleInterview(' + candidate.id + ')">' +
            (hasDate ? 'Reschedule Interview' : 'Schedule Interview') +
          '</button>';

  // Only show the Cancel button if an interview is already scheduled.
  if (hasDate) {
    detailHTML += '<button class="btn-secondary" onclick="cancelInterview(' + candidate.id + ')">Cancel Schedule</button>';
  }

  detailHTML +=
        '</div>' +
      '</div>' +

      // Action buttons: back to list and delete candidate.
      '<div class="candidate-actions" style="margin-top: 25px;">' +
        '<a href="candidates-list.html" class="btn-secondary">Back to All Candidates</a>' +
        '<button class="btn-danger" onclick="deleteCandidate(' + candidate.id + ')">Delete Candidate</button>' +
      '</div>' +
    '</section>';

  // #candidateDetail is defined in candidate.html.
  document.getElementById("candidateDetail").innerHTML = detailHTML;
}


// --- EDIT MODE FORM ---
// Render the editable form for the candidate with fields for all properties.
// Includes conditional fields: "Dropped Off After" shows only for Rejected stage,
// and "Status Alert" shows for all other non-terminal stages.
function showEditForm(candidate) {
  // Build the stage dropdown options, marking the current stage as selected.
  // ALL_STAGES is defined in js/data.js.
  var stageOptions = "";
  for (var s = 0; s < ALL_STAGES.length; s++) {
    var selected = ALL_STAGES[s] === candidate.stage ? " selected" : "";
    stageOptions += '<option value="' + ALL_STAGES[s] + '"' + selected + '>' + ALL_STAGES[s] + '</option>';
  }

  // Build the rejected-at-stage dropdown options (first-round stages only).
  // FIRST_ROUND_STAGES is defined in js/data.js.
  var rejectedStageOptions = "";
  for (var r = 0; r < FIRST_ROUND_STAGES.length; r++) {
    var rejSelected = candidate.rejectedAtStage === FIRST_ROUND_STAGES[r] ? " selected" : "";
    rejectedStageOptions += '<option value="' + FIRST_ROUND_STAGES[r] + '"' + rejSelected + '>' + FIRST_ROUND_STAGES[r] + '</option>';
  }

  // The rejected-at-stage field is only visible when the stage is "Rejected".
  var showRejectedAt = candidate.stage === "Rejected";

  // Build the status alert dropdown options.
  var statusOptions =
    '<option value="ok"' + (candidate.status === "ok" ? " selected" : "") + '>On Track</option>' +
    '<option value="action"' + (candidate.status === "action" ? " selected" : "") + '>Needs Action</option>' +
    '<option value="wait"' + (candidate.status === "wait" ? " selected" : "") + '>Waiting Feedback</option>' +
    '<option value="risk"' + (candidate.status === "risk" ? " selected" : "") + '>At Risk</option>';

  // Build the full edit form HTML with a two-column grid layout.
  var editHTML =
    '<section class="panel candidate-profile">' +
      '<h2>Edit Candidate Details</h2>' +
      '<form onsubmit="saveCandidateEdits(event)" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">' +
        
        // Row 1: Full Name and Role.
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

        // Row 2: Department and Source.
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

        // Row 3: Stage, conditional Rejected-At-Stage or Status Alert.
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">' +
          '<div>' +
            '<label><strong>Stage</strong></label>' +
            '<select id="editStage" onchange="toggleRejectedAtStage()" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' + stageOptions + '</select>' +
          '</div>' +
          '<div id="rejectedAtStageField" style="' + (showRejectedAt ? '' : 'display:none;') + '">' +
            '<label><strong>Dropped Off After</strong></label>' +
            '<select id="editRejectedAtStage" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' + rejectedStageOptions + '</select>' +
          '</div>' +
          '<div id="statusAlertField" style="' + (showRejectedAt ? 'display:none;' : '') + '">' +
            '<label><strong>Status Alert</strong></label>' +
            '<select id="editStatus" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' + statusOptions + '</select>' +
          '</div>' +
        '</div>' +

        // Row 4: Hiring Manager and Last Contact Date.
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

        // Next Step field (full width).
        '<div>' +
          '<label><strong>Next Step</strong></label>' +
          '<input type="text" id="editNextStep" value="' + candidate.nextStep + '" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' +
        '</div>' +

        // Notes textarea (full width).
        '<div>' +
          '<label><strong>Notes</strong></label>' +
          '<textarea id="editNotes" rows="4" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">' + candidate.notes + '</textarea>' +
        '</div>' +

        // Form action buttons: Save and Cancel.
        '<div style="display: flex; gap: 10px; margin-top: 10px;">' +
          '<button type="submit" class="btn-primary">Save Changes</button>' +
          '<button type="button" class="btn-secondary" onclick="toggleEditMode(false)">Cancel</button>' +
        '</div>' +

      '</form>' +
    '</section>';

  // #candidateDetail is defined in candidate.html.
  document.getElementById("candidateDetail").innerHTML = editHTML;
}


// Show/hide the rejected-at-stage field and status alert field when the stage
// dropdown changes in the edit form. Rejected shows rejected-at-stage; others show status.
// #editStage, #rejectedAtStageField, and #statusAlertField are dynamically created
// by showEditForm() in this file (js/candidate.js).
function toggleRejectedAtStage() {
  var stage = document.getElementById("editStage").value;
  var rejectedField = document.getElementById("rejectedAtStageField");
  var statusField = document.getElementById("statusAlertField");
  if (rejectedField) rejectedField.style.display = stage === "Rejected" ? "" : "none";
  if (statusField) statusField.style.display = stage === "Rejected" ? "none" : "";
}


// Switch between View Mode and Edit Mode, then re-render the page.
function toggleEditMode(enable) {
  isEditing = enable;
  renderPage();
}


// Save form updates back to the CANDIDATES array and localStorage.
// Reads all form fields, handles stage-specific logic (rejected/hired), and
// recalculates lastContact days and risk status from the contact date.
// All #edit* elements are dynamically created by showEditForm() in this file (js/candidate.js).
function saveCandidateEdits(event) {
  event.preventDefault();

  // Read text fields from the form.
  selectedCandidate.name = document.getElementById("editName").value;
  selectedCandidate.role = document.getElementById("editRole").value;
  selectedCandidate.dept = document.getElementById("editDept").value;
  selectedCandidate.stage = document.getElementById("editStage").value;
  selectedCandidate.source = document.getElementById("editSource").value;

  // Handle stage-specific fields: Rejected stores rejectedAtStage, Hired forces ok status.
  if (selectedCandidate.stage === "Rejected") {
    var rejectedEl = document.getElementById("editRejectedAtStage");
    selectedCandidate.rejectedAtStage = rejectedEl ? rejectedEl.value : "Screen";
    delete selectedCandidate.status;
  } else if (selectedCandidate.stage === "Hired") {
    delete selectedCandidate.rejectedAtStage;
    selectedCandidate.status = "ok";
  } else {
    delete selectedCandidate.rejectedAtStage;
    selectedCandidate.status = document.getElementById("editStatus").value;
  }
  selectedCandidate.manager = document.getElementById("editManager").value;
  selectedCandidate.nextStep = document.getElementById("editNextStep").value;
  selectedCandidate.notes = document.getElementById("editNotes").value;

  // Process Last Contact Date: convert the picked date into a "days ago" integer.
  // COLD_CONTACT_DAYS and isActiveCandidate are defined in js/data.js.
  var contactDateVal = document.getElementById("editLastContactDate").value;
  if (contactDateVal) {
    var selDate = new Date(contactDateVal);
    var now = new Date();
    var diffMs = Math.max(0, now - selDate);
    var daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    selectedCandidate.lastContact = daysAgo;

    // Auto-set risk status if contact is too old, or clear it if recently contacted.
    if (daysAgo >= COLD_CONTACT_DAYS && isActiveCandidate(selectedCandidate)) {
      selectedCandidate.status = "risk";
    } else if (selectedCandidate.status === "risk" && daysAgo < COLD_CONTACT_DAYS) {
      selectedCandidate.status = "ok";
    }
  }

  // Persist update in localStorage.
  // saveCandidates is defined in js/data.js.
  saveCandidates();

  // Exit edit mode and re-render the profile in view mode.
  isEditing = false;
  renderPage();
}


// Schedule or reschedule an interview for the candidate.
// Reads the datetime picker, saves the date, and auto-advances the stage to
// "Interview" if the candidate was still in New Applicant or Screen.
// #interviewPicker is dynamically created by showCandidateDetail() in this file (js/candidate.js).
function scheduleInterview(id) {
  var picker = document.getElementById("interviewPicker");
  var selectedDate = picker.value;

  // Require a date/time before saving.
  if (!selectedDate) {
    alert("Please select a date and time before saving.");
    return;
  }

  // Find the candidate by id, update their interview date, and advance stage if needed.
  // CANDIDATES and saveCandidates are defined in js/data.js.
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


// Cancel a scheduled interview after user confirmation.
// Clears the interviewDate field and re-renders the profile.
function cancelInterview(id) {
  var confirmCancel = confirm("Are you sure you want to cancel this scheduled interview?");

  if (confirmCancel === false) {
    return;
  }

  // Find the candidate by id and clear their interview date.
  // CANDIDATES and saveCandidates are defined in js/data.js.
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


// Delete the selected candidate after user confirmation.
// Removes them from the array, saves, and redirects to the candidates list.
function deleteCandidate(id) {
  var confirmDelete = confirm("Are you sure you want to delete this candidate? This cannot be undone.");

  if (confirmDelete === false) {
    return;
  }

  // Find the array index of the candidate to delete.
  // CANDIDATES and saveCandidates are defined in js/data.js.
  var deleteIndex = -1;

  for (var i = 0; i < CANDIDATES.length; i++) {
    if (CANDIDATES[i].id === id) {
      deleteIndex = i;
    }
  }

  // Remove the candidate, persist, and navigate back to the list.
  if (deleteIndex !== -1) {
    CANDIDATES.splice(deleteIndex, 1);
    saveCandidates();
    window.location.href = "candidates-list.html";
  }
}
