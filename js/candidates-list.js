// Render candidates in a clean, perfectly aligned table layout

var tableHTML = 
  '<table class="data-table" style="width: 100%; border-collapse: collapse;">' +
    '<thead>' +
      '<tr>' +
        '<th style="text-align: left; padding: 12px 16px;">Candidate</th>' +
        '<th style="text-align: left; padding: 12px 16px;">Source</th>' +
        '<th style="text-align: left; padding: 12px 16px;">Stage</th>' +
        '<th style="text-align: right; padding: 12px 16px;">Status</th>' +
      '</tr>' +
    '</thead>' +
    '<tbody>';

for (var i = 0; i < CANDIDATES.length; i++) {
  var c = CANDIDATES[i];
  var b = statusBadge(c.status);

  tableHTML +=
    '<tr onclick="window.location=\'candidate.html?id=' + c.id + '\'" style="cursor: pointer;" class="candidate-row-tr">' +
      '<td style="padding: 12px 16px;">' +
        '<div style="font-weight: 600;">' + c.name + '</div>' +
        '<div style="font-size: 13px; color: #6B7280;">' + c.role + ' - ' + c.dept + '</div>' +
      '</td>' +
      '<td style="padding: 12px 16px;"><span class="source-tag">' + c.source + '</span></td>' +
      '<td style="padding: 12px 16px;">' + c.stage + '</td>' +
      '<td style="padding: 12px 16px; text-align: right;">' +
        '<span class="badge ' + b.cls + '">' + b.text + '</span>' +
      '</td>' +
    '</tr>';
}

tableHTML += '</tbody></table>';

document.getElementById("candidateList").innerHTML = tableHTML;