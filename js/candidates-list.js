// Build a clickable row for every candidate in the data

var listHTML = "";

// Go through every candidate in CANDIDATES from data.js
for (var i = 0; i < CANDIDATES.length; i++) {
  var c = CANDIDATES[i];
  var b = statusBadge(c.status);

  // The whole row is a link to that candidate's detail page
  listHTML = listHTML +
    '<a class="candidate-row" href="candidate.html?id=' + c.id + '">' +
      '<div class="candidate-main">' +
        '<div class="candidate-name">' + c.name + '</div>' +
        '<div class="candidate-sub">' + c.role + ' - ' + c.dept + '</div>' +
      '</div>' +
      '<div class="candidate-stage">' + c.stage + '</div>' +
      '<span class="badge ' + b.cls + '">' + b.text + '</span>' +
    '</a>';
}

// Put all rows inside the list box on candidates-list.html
document.getElementById("candidateList").innerHTML = listHTML;