// Auto-generated from HRDataset_v14.csv
// Source-level predictive analytics

window.HR_SOURCE_STATS = {};

// We expose a promise so other scripts (like reports.js) can wait for the data
window.hrDataPromise = Promise.resolve().then(() => {
    var text = window.RAW_CSV_DATA;
    var lines = text.trim().split('\n');
    var headers = parseCSVLine(lines[0]);
    var srcIndex = headers.indexOf('RecruitmentSource');
    var engIndex = headers.indexOf('EngagementSurvey');
    var satIndex = headers.indexOf('EmpSatisfaction');
    var termIndex = headers.indexOf('Termd');

    if (srcIndex === -1 || engIndex === -1 || satIndex === -1 || termIndex === -1) {
      console.error("Missing expected headers in CSV");
      return;
    }

    var stats = {};

    for (var i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      var cols = parseCSVLine(lines[i]);
      // Normalize the raw HR source name so it matches the applicant-facing
      // source labels (e.g. "Website" / "On-line Web application" -> "Company Website").
      var src = normalizeSource(cols[srcIndex]);
      var eng = parseFloat(cols[engIndex]) || 0;
      var sat = parseFloat(cols[satIndex]) || 0;
      var term = parseInt(cols[termIndex], 10) || 0;

      if (!stats[src]) {
        stats[src] = { count: 0, sumEng: 0, sumSat: 0, terminated: 0 };
      }
      stats[src].count++;
      stats[src].sumEng += eng;
      stats[src].sumSat += sat;
      stats[src].terminated += term;
    }

    for (var key in stats) {
      var s = stats[key];
      // Format properties like the static object had
      window.HR_SOURCE_STATS[key] = {
        count: s.count,
        avgEngagement: Number((s.sumEng / s.count).toFixed(2)),
        avgSatisfaction: Number((s.sumSat / s.count).toFixed(2)),
        terminated: s.terminated,
        turnoverPct: Number(((s.terminated / s.count) * 100).toFixed(1))
      };
    }
    
    return window.HR_SOURCE_STATS;
  })
  .catch(err => console.error("Error loading HR dataset:", err));
