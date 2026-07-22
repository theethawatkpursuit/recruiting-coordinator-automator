// This runs when the user clicks the "Import" button
function importFile() {
  var fileInput = document.getElementById("fileInput");
  var message = document.getElementById("importMessage");

  // Decision point: Did the user actually choose a file?
  if (fileInput.files.length === 0) {
    message.textContent = "Please choose a CSV file first.";
    message.className = "import-message error";
    return;
  }

  var file = fileInput.files[0];

  // FileReader lets the browser read the file's text
  var reader = new FileReader();

  // This function runs once the file has finished loading
  reader.onload = function (event) {
    var text = event.target.result;
    processCSV(text);
  };

  // Start reading the file as plain text
  reader.readAsText(file);
}


// Turn the raw CSV text into candidate objects
function processCSV(text) {
  var message = document.getElementById("importMessage");

  // Split the file into lines (rows)
  var lines = text.split("\n");

  // Decision point: Is the file empty or missing rows?
  if (lines.length < 2) {
    message.textContent = "That file has no candidate rows. Check the format.";
    message.className = "import-message error";
    return;
  }

  // The first line is the header row (name, role, dept, ...)
  var headers = lines[0].split(",");

  // Work out which column number holds each field
  var nameIndex = findColumn(headers, "name");
  var roleIndex = findColumn(headers, "role");
  var deptIndex = findColumn(headers, "dept");
  var sourceIndex = findColumn(headers, "source");
  var stageIndex = findColumn(headers, "stage");

  // Decision point: Are the required columns present?
  if (nameIndex === -1 || roleIndex === -1) {
    message.textContent = "Missing required columns. You need at least 'name' and 'role'.";
    message.className = "import-message error";
    return;
  }

  var importedCount = 0;

  // Go through every row after the header
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();

    // Skip blank lines
    if (line === "") {
      continue;
    }

    var cells = line.split(",");

    // Build a new candidate object from this row
    var newCandidate = {
      id: CANDIDATES.length + 1,
      name: cleanCell(cells[nameIndex]),
      role: cleanCell(cells[roleIndex]),
      dept: deptIndex !== -1 ? cleanCell(cells[deptIndex]) : "Unassigned",
      source: sourceIndex !== -1 ? cleanCell(cells[sourceIndex]) : "Import",
      stage: stageIndex !== -1 ? cleanCell(cells[stageIndex]) : "New Applicant",
      lastContact: 0,
      manager: "Unassigned",
      nextStep: "Review application",
      status: "ok",
      interviewDate: "Not scheduled",
      notes: "Added via spreadsheet import."
    };

    // Add it to the main candidate list
    CANDIDATES.push(newCandidate);
    importedCount = importedCount + 1;
  }

  // Show a success message
  message.textContent = "Successfully imported " + importedCount + " candidate(s)!";
  message.className = "import-message success";

  // Show a preview table of everyone now in the system
  showPreview();
}


// Find which column number a header name is in (-1 if not found)
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
  // Remove surrounding quotation marks if present
  cleaned = cleaned.replace(/^"|"$/g, "");
  return cleaned;
}


// Build the preview table showing all candidates
function showPreview() {
  var panel = document.getElementById("previewPanel");
  var body = document.querySelector("#previewTable tbody");

  var rowsHTML = "";
  for (var i = 0; i < CANDIDATES.length; i++) {
    var c = CANDIDATES[i];
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