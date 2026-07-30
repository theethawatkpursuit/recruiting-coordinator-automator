// js/sidebar.js
// Build the sidebar once, reuse it on every page.
// Each page sets a variable called ACTIVE_PAGE before loading this file
// so the current page's link can be highlighted as active.

// Define the navigation links shown in the sidebar.
var links = [
  { href: "dashboard.html",       label: "Dashboard" },
  { href: "pipeline.html",        label: "Pipeline" },
  { href: "candidates-list.html", label: "All Candidates" },
  { href: "calendar.html",        label: "Calendar" }, // <-- Added Calendar page link
  { href: "import.html",          label: "Import" },
  { href: "tasks.html",           label: "Tasks" },
  { href: "reports.html",         label: "Reports" }
];

// Start building the sidebar HTML with the logo/brand name.
var navHTML = '<h2 class="logo-small">RecruitFlow</h2>';

// Loop through each link and build an <a> tag, adding the "active" class
// to the link that matches the current page (ACTIVE_PAGE).
for (var i = 0; i < links.length; i++) {
  var link = links[i];

  // Mark the current page's link as active
  var activeClass = "";
  if (link.href === ACTIVE_PAGE) {
    activeClass = ' class="active"';
  }

  navHTML = navHTML +
    '<a href="' + link.href + '"' + activeClass + '>' + link.label + '</a>';
}

// Add the sidebar footer with the user's name and a logout link.
navHTML = navHTML +
  '<div class="sidebar-footer">' +
    '<span>Priya N.</span>' +
    '<a href="index.html" class="logout">Log Out</a>' +
  '</div>';

// Drop the finished sidebar into the page's .sidebar container.
// The .sidebar element is defined in every HTML page (dashboard.html, pipeline.html,
// candidates-list.html, candidate.html, calendar.html, tasks.html, reports.html, import.html).
document.querySelector(".sidebar").innerHTML = navHTML;
