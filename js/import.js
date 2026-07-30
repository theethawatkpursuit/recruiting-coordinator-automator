// This runs when the user clicks the "Import" button.
// It reads the selected CSV file from the file input and passes its text to processCSV.
// #fileInput and #importMessage are defined in import.html.
function importFile() {
  var fileInput = document.getElementById("fileInput");
  var message = document.getElementById("importMessage");

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
// Parses headers, validates required columns, skips duplicates, and saves new candidates.
// #importMessage, #previewPanel, and #previewTable are defined in import.html.
function processCSV(text) {
  var message = document.getElementById("importMessage");

  // Split the CSV into individual lines.
  var lines = text.split("\n");

  // Need at least a header row and one data row.
  if (lines.length < 2) {
    message.textContent = "That file has no candidate rows. Check the format.";
    message.className = "import-message error";
    return;
  }

  // Parse the header row and find the column index for each expected field.
  // parseCSVLine is defined in js/data.js.
  var headers = parseCSVLine(lines[0]);

  var nameIndex = findColumn(headers, "name");
  var roleIndex = findColumn(headers, "role");
  var deptIndex = findColumn(headers, "dept");
  var sourceIndex = findColumn(headers, "source");
  var stageIndex = findColumn(headers, "stage");

  // Name and role are required; abort if either is missing.
  if (nameIndex === -1 || roleIndex === -1) {
    message.textContent = "Missing required columns. You need at least 'name' and 'role'.";
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
      dept: deptIndex !== -1 ? cleanCell(cells[deptIndex]) : "Unassigned",
      source: sourceIndex !== -1 ? normalizeSource(cleanCell(cells[sourceIndex])) : "Import",
      stage: stageIndex !== -1 ? cleanCell(cells[stageIndex]) : "New Applicant",
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
    showPreview(addedCandidates);
  } else if (importedCount > 0 && duplicateCount > 0) {
    message.textContent = "Successfully imported " + importedCount + " candidate(s). " + duplicateCount + " duplicate(s) were skipped.";
    message.className = "import-message success";
    showPreview(addedCandidates);
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


// Build the preview table showing all imported candidates.
// Makes the hidden preview panel visible and fills its table body with rows.
// #previewPanel and #previewTable are defined in import.html.
function showPreview(candidatesToShow) {
  var list = candidatesToShow || CANDIDATES;
  var panel = document.getElementById("previewPanel");
  var body = document.querySelector("#previewTable tbody");

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
