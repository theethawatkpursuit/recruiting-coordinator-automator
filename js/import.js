// ---------- Candidate Import ----------
// This runs when the user clicks the "Import Candidates" button.
// It reads the selected CSV file from the candidate file input and passes its text to processCSV.
// #candidateFileInput and #candidateImportMessage are defined in import.html.
function importFile() {
  var fileInput = document.getElementById("candidateFileInput");
  var message = document.getElementById("candidateImportMessage");

  // If no file was selected, show an error and stop.
  if (fileInput.files.length === 0) {
    message.textContent = "Please choose a CSV file first.";
    message.className = "import-message error";
    return;
  }

  // Read the file contents as text using a FileReader.
  var file = fileInput.files[0];
  var reader = new FileReader();

  // When the file finishes loading, pass the raw text to the CSV processor.
  reader.onload = function (event) {
    var text = event.target.result;
    processCSV(text);
  };

  reader.readAsText(file);
}


// Turn the raw CSV text into candidate objects.
// Parses headers, validates that ALL required columns are present, skips duplicates, and saves new candidates.
// Required columns: name, role, dept, source, stage — all five must be present or the file is rejected.
// #candidateImportMessage, #previewPanel, and #previewTable are defined in import.html.
function processCSV(text) {
  var message = document.getElementById("candidateImportMessage");

  // Split the CSV into individual lines.
  var lines = text.split("\n");

  // Need at least a header row and one data row.
  if (lines.length < 2) {
    message.textContent = "That file has no candidate rows. Check the format.";
    message.className = "import-message error";
    return;
  }

  // Parse the header row and find the column index for each required field.
  // parseCSVLine is defined in js/data.js.
  var headers = parseCSVLine(lines[0]);

  var nameIndex = findColumn(headers, "name");
  var roleIndex = findColumn(headers, "role");
  var deptIndex = findColumn(headers, "dept");
  var sourceIndex = findColumn(headers, "source");
  var stageIndex = findColumn(headers, "stage");

  // All five columns are required; abort if any is missing.
  if (nameIndex === -1 || roleIndex === -1 || deptIndex === -1 || sourceIndex === -1 || stageIndex === -1) {
    message.textContent = "Missing required columns. You need all of: name, role, dept, source, stage.";
    message.className = "import-message error";
    return;
  }

  // Track how many candidates were imported vs. skipped as duplicates.
  var importedCount = 0;
  var duplicateCount = 0;
  var addedCandidates = [];

  // Process each data row (skip the header at index 0).
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();

    // Skip blank lines.
    if (line === "") {
      continue;
    }

    var cells = parseCSVLine(line);
    var newName = cleanCell(cells[nameIndex]);

    // Skip rows with an empty name.
    if (newName === "") {
      continue;
    }

    // Check if a candidate with the same name (case-insensitive) already exists.
    // CANDIDATES is the global candidate array defined in js/data.js.
    var isDuplicate = false;
    for (var j = 0; j < CANDIDATES.length; j++) {
      if (CANDIDATES[j].name.toLowerCase() === newName.toLowerCase()) {
        isDuplicate = true;
        break;
      }
    }

    // Skip duplicates and increment the duplicate counter.
    if (isDuplicate) {
      duplicateCount++;
      continue;
    }

    // Build a new candidate object with sensible defaults for missing optional columns.
    // normalizeSource is defined in js/data.js.
    var newCandidate = {
      id: typeof getNextCandidateId === 'function' ? getNextCandidateId() : (CANDIDATES.length > 0 ? Math.max.apply(Math, CANDIDATES.map(function (c) { return c.id; })) + 1 : 1),
      name: newName,
      role: cleanCell(cells[roleIndex]),
      dept: cleanCell(cells[deptIndex]),
      source: normalizeSource(cleanCell(cells[sourceIndex])),
      stage: cleanCell(cells[stageIndex]),
      lastContact: 0,
      manager: "Unassigned",
      nextStep: "Review application",
      status: "ok",
      interviewDate: "Not scheduled",
      notes: "Added via spreadsheet import."
    };

    // Add the new candidate to the global array and to the preview list.
    CANDIDATES.push(newCandidate);
    addedCandidates.push(newCandidate);
    importedCount++;
  }

  // Persist the updated candidate list to localStorage if any were imported.
  // saveCandidates is defined in js/data.js.
  if (importedCount > 0) {
    saveCandidates();
  }

  // Show appropriate success/error messages based on import and duplicate counts.
  // #previewPanel is defined in import.html.
  if (importedCount > 0 && duplicateCount === 0) {
    message.textContent = "Successfully imported " + importedCount + " candidate(s)! They are now saved.";
    message.className = "import-message success";
    showCandidatePreview(addedCandidates);
  } else if (importedCount > 0 && duplicateCount > 0) {
    message.textContent = "Successfully imported " + importedCount + " candidate(s). " + duplicateCount + " duplicate(s) were skipped.";
    message.className = "import-message success";
    showCandidatePreview(addedCandidates);
  } else if (importedCount === 0 && duplicateCount > 0) {
    message.textContent = "All " + duplicateCount + " candidate(s) in the file are duplicates and were skipped.";
    message.className = "import-message error";
    document.getElementById("previewPanel").style.display = "none";
  } else {
    message.textContent = "No valid candidates found to import.";
    message.className = "import-message error";
    document.getElementById("previewPanel").style.display = "none";
  }
}


// ---------- HR Data Import ----------
// This runs when the user clicks the "Import HR Data" button.
// It reads the selected CSV file from the HR file input and passes its text to processHRCSV.
// #hrFileInput and #hrImportMessage are defined in import.html.
function importHRFile() {
  var fileInput = document.getElementById("hrFileInput");
  var message = document.getElementById("hrImportMessage");

  // If no file was selected, show an error and stop.
  if (fileInput.files.length === 0) {
    message.textContent = "Please choose a CSV file first.";
    message.className = "import-message error";
    return;
  }

  // Read the file contents as text using a FileReader.
  var file = fileInput.files[0];
  var reader = new FileReader();

  // When the file finishes loading, pass the raw text to the HR CSV processor.
  reader.onload = function (event) {
    var text = event.target.result;
    processHRCSV(text);
  };

  reader.readAsText(file);
}


// Turn the raw CSV text into per-source HR statistics and persist them.
// Required columns: RecruitmentSource, EngagementSurvey, Termd — all three must be present
// for avg. engagement and turnover rate to work, or the file is rejected.
// #hrImportMessage, #previewPanel, and #previewTable are defined in import.html.
function processHRCSV(text) {
  var message = document.getElementById("hrImportMessage");

  // Split the CSV into individual lines.
  var lines = text.split("\n");

  // Need at least a header row and one data row.
  if (lines.length < 2) {
    message.textContent = "That file has no HR data rows. Check the format.";
    message.className = "import-message error";
    return;
  }

  // Parse the header row and find the column index for each required field.
  // parseCSVLine is defined in js/data.js.
  var headers = parseCSVLine(lines[0]);

  var srcIndex = findColumn(headers, "RecruitmentSource");
  var engIndex = findColumn(headers, "EngagementSurvey");
  var termIndex = findColumn(headers, "Termd");

  // All three columns are required for avg. engagement and turnover rate; abort if any is missing.
  if (srcIndex === -1 || engIndex === -1 || termIndex === -1) {
    message.textContent = "Missing required columns. You need all of: RecruitmentSource, EngagementSurvey, Termd.";
    message.className = "import-message error";
    return;
  }

  // Temporary accumulator: one entry per source with running sums and counts.
  var stats = {};
  var rowCount = 0;

  // Loop over every data row (skipping the header at index 0).
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();

    // Skip blank lines.
    if (line === "") {
      continue;
    }

    var cells = parseCSVLine(line);
    // Normalize the raw HR source name so it matches the applicant-facing source labels.
    // normalizeSource is defined in js/data.js.
    var src = normalizeSource(cleanCell(cells[srcIndex]));

    // Skip rows with an empty source.
    if (src === "") {
      continue;
    }

    var eng = parseFloat(cleanCell(cells[engIndex])) || 0;
    var term = parseInt(cleanCell(cells[termIndex]), 10) || 0;

    // Initialize the accumulator for this source on first encounter.
    if (!stats[src]) {
      stats[src] = { count: 0, sumEng: 0, terminated: 0 };
    }
    // Accumulate counts and sums for averages and turnover calculation.
    stats[src].count++;
    stats[src].sumEng += eng;
    stats[src].terminated += term;
    rowCount++;
  }

  // If no valid data rows were found, reject the file.
  if (rowCount === 0) {
    message.textContent = "No valid HR data rows found to import.";
    message.className = "import-message error";
    return;
  }

  // Convert the accumulated sums into final averages and percentages,
  // storing them in the global HR_SOURCE_STATS object.
  // HR_SOURCE_STATS is defined in js/hr-data.js.
  if (typeof window.HR_SOURCE_STATS === "undefined") {
    window.HR_SOURCE_STATS = {};
  }
  // Clear any previous stats so the new import fully replaces old data.
  window.HR_SOURCE_STATS = {};

  var previewRows = [];

  for (var key in stats) {
    var s = stats[key];
    window.HR_SOURCE_STATS[key] = {
      count: s.count,
      avgEngagement: Number((s.sumEng / s.count).toFixed(2)),
      terminated: s.terminated,
      turnoverPct: Number(((s.terminated / s.count) * 100).toFixed(1))
    };
    previewRows.push({
      source: key,
      count: s.count,
      avgEngagement: window.HR_SOURCE_STATS[key].avgEngagement,
      terminated: s.terminated,
      turnoverPct: window.HR_SOURCE_STATS[key].turnoverPct
    });
  }

  // Persist the imported HR stats to localStorage so they survive page reloads.
  localStorage.setItem("recruitflowHRStats", JSON.stringify(window.HR_SOURCE_STATS));

  // Show a success message and a preview of the aggregated per-source stats.
  message.textContent = "Successfully imported HR data for " + Object.keys(window.HR_SOURCE_STATS).length + " source(s)! The Source Effectiveness report has been updated.";
  message.className = "import-message success";
  showHRPreview(previewRows);
}


// ---------- Shared Utilities ----------
// Find which column number a header name is in (case-insensitive).
// Returns the index, or -1 if the header is not found.
function findColumn(headers, name) {
  for (var i = 0; i < headers.length; i++) {
    if (cleanCell(headers[i]).toLowerCase() === name.toLowerCase()) {
      return i;
    }
  }

  return -1;
}


// Remove spaces, quotes, and stray carriage returns from a cell value.
function cleanCell(value) {
  if (value === undefined) {
    return "";
  }

  var cleaned = value.trim();
  cleaned = cleaned.replace(/^"|"$/g, "");

  return cleaned;
}


// ---------- Preview Renderers ----------
// Build the preview table showing all imported candidates.
// Makes the hidden preview panel visible and fills its table head and body with rows.
// #previewPanel, #previewTitle, #previewHead, and #previewTable are defined in import.html.
function showCandidatePreview(candidatesToShow) {
  var list = candidatesToShow || CANDIDATES;
  var panel = document.getElementById("previewPanel");
  var title = document.getElementById("previewTitle");
  var head = document.getElementById("previewHead");
  var body = document.querySelector("#previewTable tbody");

  // Set the title and header row for candidate data.
  title.textContent = "Imported Candidates";
  head.innerHTML = "<tr><th>Name</th><th>Role</th><th>Department</th><th>Source</th><th>Stage</th></tr>";

  var rowsHTML = "";

  // Build an HTML row for each candidate in the list.
  for (var i = 0; i < list.length; i++) {
    var c = list[i];

    rowsHTML = rowsHTML +
      "<tr>" +
      "<td>" + c.name + "</td>" +
      "<td>" + c.role + "</td>" +
      "<td>" + c.dept + "</td>" +
      "<td>" + c.source + "</td>" +
      "<td>" + c.stage + "</td>" +
      "</tr>";
  }

  body.innerHTML = rowsHTML;
  panel.style.display = "block";
}


// Build the preview table showing aggregated per-source HR stats.
// Makes the hidden preview panel visible and fills its table head and body with rows.
// #previewPanel, #previewTitle, #previewHead, and #previewTable are defined in import.html.
function showHRPreview(rowsToShow) {
  var panel = document.getElementById("previewPanel");
  var title = document.getElementById("previewTitle");
  var head = document.getElementById("previewHead");
  var body = document.querySelector("#previewTable tbody");

  // Set the title and header row for HR data.
  title.textContent = "Imported HR Data (Aggregated by Source)";
  head.innerHTML = "<tr><th>Source</th><th>Employees</th><th>Avg. Engagement</th><th>Terminated</th><th>Turnover Rate</th></tr>";

  var rowsHTML = "";

  // Build an HTML row for each source in the list.
  for (var i = 0; i < rowsToShow.length; i++) {
    var r = rowsToShow[i];

    rowsHTML = rowsHTML +
      "<tr>" +
      "<td>" + r.source + "</td>" +
      "<td>" + r.count + "</td>" +
      "<td>" + r.avgEngagement.toFixed(2) + " / 5</td>" +
      "<td>" + r.terminated + "</td>" +
      "<td>" + r.turnoverPct + "%</td>" +
      "</tr>";
  }

  body.innerHTML = rowsHTML;
  panel.style.display = "block";
}