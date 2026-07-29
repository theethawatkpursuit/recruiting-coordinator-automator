// This runs when the user clicks the "Import" button
function importFile() {
  var fileInput = document.getElementById("fileInput");
  var message = document.getElementById("importMessage");

  if (fileInput.files.length === 0) {
    message.textContent = "Please choose a CSV file first.";
    message.className = "import-message error";
    return;
  }

  var file = fileInput.files[0];
  var reader = new FileReader();

  reader.onload = function (event) {
    var text = event.target.result;
    processCSV(text);
  };

  reader.readAsText(file);
}


// Turn the raw CSV text into candidate objects
function processCSV(text) {
  var message = document.getElementById("importMessage");

  var lines = text.split("\n");

  if (lines.length < 2) {
    message.textContent = "That file has no candidate rows. Check the format.";
    message.className = "import-message error";
    return;
  }

  var headers = parseCSVLine(lines[0]);

  var nameIndex = findColumn(headers, "name");
  var roleIndex = findColumn(headers, "role");
  var deptIndex = findColumn(headers, "dept");
  var sourceIndex = findColumn(headers, "source");
  var stageIndex = findColumn(headers, "stage");

  if (nameIndex === -1 || roleIndex === -1) {
    message.textContent = "Missing required columns. You need at least 'name' and 'role'.";
    message.className = "import-message error";
    return;
  }

  var importedCount = 0;
  var duplicateCount = 0;
  var addedCandidates = [];

  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();

    if (line === "") {
      continue;
    }

    var cells = parseCSVLine(line);
    var newName = cleanCell(cells[nameIndex]);

    var isDuplicate = false;
    for (var j = 0; j < CANDIDATES.length; j++) {
      if (CANDIDATES[j].name.toLowerCase() === newName.toLowerCase()) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      duplicateCount++;
      continue;
    }

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

    CANDIDATES.push(newCandidate);
    addedCandidates.push(newCandidate);
    importedCount++;
  }

  // This is the important new part:
  if (importedCount > 0) {
    saveCandidates();
  }

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


// Find which column number a header name is in
function findColumn(headers, name) {
  for (var i = 0; i < headers.length; i++) {
    if (cleanCell(headers[i]).toLowerCase() === name.toLowerCase()) {
      return i;
    }
  }

  return -1;
}


// Remove spaces, quotes, and stray carriage returns from a cell
function cleanCell(value) {
  if (value === undefined) {
    return "";
  }

  var cleaned = value.trim();
  cleaned = cleaned.replace(/^"|"$/g, "");

  return cleaned;
}


// Build the preview table showing all candidates
function showPreview(candidatesToShow) {
  var list = candidatesToShow || CANDIDATES;
  var panel = document.getElementById("previewPanel");
  var body = document.querySelector("#previewTable tbody");

  var rowsHTML = "";

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