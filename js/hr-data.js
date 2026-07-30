// Source-level predictive analytics: aggregates employee engagement, satisfaction,
// and turnover by recruitment source so the Reports page can compare sources.
//
// Data source priority:
//   1. HR stats imported via the Import page (stored in localStorage as "recruitflowHRStats")
//   2. The default HR dataset embedded by hr-dataset-raw.js

// Global object that will hold the computed per-source statistics.
window.HR_SOURCE_STATS = {};

// We expose a promise so other scripts (like reports.js) can wait for the data
// to finish parsing before rendering the source effectiveness table.
window.hrDataPromise = Promise.resolve().then(() => {
    // First, check if the user has imported HR data via the Import page.
    // Imported stats are stored as JSON in localStorage and take precedence
    // over the default embedded dataset.
    var savedHRStats = localStorage.getItem("recruitflowHRStats");
    if (savedHRStats !== null) {
      try {
        window.HR_SOURCE_STATS = JSON.parse(savedHRStats);
        return window.HR_SOURCE_STATS;
      } catch (e) {
        console.error("Error parsing saved HR stats:", e);
        // Fall through to the default dataset if parsing fails.
      }
    }

    // No imported data (or parse error): fall back to the default embedded dataset.
    // Read the raw CSV string embedded by hr-dataset-raw.js and split it into lines.
    var text = window.RAW_CSV_DATA;
    if (!text) {
      console.error("No HR dataset available (neither imported nor default).");
      return;
    }

    var lines = text.trim().split('\n');
    // Parse the header row and locate the column indices we need.
    // parseCSVLine is defined in js/data.js.
    var headers = parseCSVLine(lines[0]);
    var srcIndex = headers.indexOf('RecruitmentSource');
    var engIndex = headers.indexOf('EngagementSurvey');
    var satIndex = headers.indexOf('EmpSatisfaction');
    var termIndex = headers.indexOf('Termd');

    // If any required column is missing, log an error and stop processing.
    if (srcIndex === -1 || engIndex === -1 || satIndex === -1 || termIndex === -1) {
      console.error("Missing expected headers in CSV");
      return;
    }

    // Temporary accumulator: one entry per source with running sums and counts.
    var stats = {};

    // Loop over every data row (skipping the header at index 0).
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      var cols = parseCSVLine(lines[i]);
      // Normalize the raw HR source name so it matches the applicant-facing
      // source labels (e.g. "Website" / "On-line Web application" -> "Company Website").
      // normalizeSource is defined in js/data.js.
      var src = normalizeSource(cols[srcIndex]);
      var eng = parseFloat(cols[engIndex]) || 0;
      var sat = parseFloat(cols[satIndex]) || 0;
      var term = parseInt(cols[termIndex], 10) || 0;

      // Initialize the accumulator for this source on first encounter.
      if (!stats[src]) {
        stats[src] = { count: 0, sumEng: 0, sumSat: 0, terminated: 0 };
      }
      // Accumulate counts and sums for averages and turnover calculation.
      stats[src].count++;
      stats[src].sumEng += eng;
      stats[src].sumSat += sat;
      stats[src].terminated += term;
    }

    // Convert the accumulated sums into final averages and percentages,
    // storing them in the global HR_SOURCE_STATS object.
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