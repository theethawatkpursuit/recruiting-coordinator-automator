var listHTML = "";

for (var i = 0; i < CANDIDATES.length; i++) {
  var c = CANDIDATES[i];
  var b = statusBadge(c.status);

  listHTML = listHTML +
    '<a class="candidate-row" href="candidate.html?id=' + c.id + '">' +
      '<div class="candidate-main">' +
        '<div class="candidate-name">' + c.name + '</div>' +
        '<div class="candidate-sub">' + c.role + ' - ' + c.dept + '</div>' +
      '</div>' +
      '<div class="candidate-source"><span class="source-tag">' + c.source + '</span></div>' +
      '<div class="candidate-stage">' + c.stage + '</div>' +
      '<span class="badge ' + b.cls + '">' + b.text + '</span>' +
    '</a>';
}

document.getElementById("candidateList").innerHTML = listHTML;