// Render candidates in a clean, perfectly aligned table layout

var tableHTML = 
  '<div style="max-height: calc(100vh - 220px); overflow-y: auto;">' +
  '<table class="data-table" style="width: 100%; border-collapse: collapse;">' +
    '<thead style="position: sticky; top: 0; background: white; z-index: 10; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">' +
      '<tr>' +
        '<th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Candidate</th>' +
        '<th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Source</th>' +
        '<th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Stage</th>' +
        '<th style="text-align: right; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Status</th>' +
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

tableHTML += '</tbody></table></div>';

document.getElementById("candidateList").innerHTML = tableHTML;