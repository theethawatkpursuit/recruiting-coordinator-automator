// js/sidebar.js
// Build the sidebar once, reuse it on every page.
// Each page sets a variable called ACTIVE_PAGE before loading this file.

var links = [
  { href: "dashboard.html",       label: "Dashboard" },
  { href: "pipeline.html",        label: "Pipeline" },
  { href: "candidates-list.html", label: "All Candidates" },
  { href: "calendar.html",        label: "Calendar" }, // <-- Added Calendar page link
  { href: "import.html",          label: "Import" },
  { href: "tasks.html",           label: "Tasks" },
  { href: "reports.html",         label: "Reports" }
];

var navHTML = '<h2 class="logo-small">RecruitFlow</h2>';

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

navHTML = navHTML +
  '<div class="sidebar-footer">' +
    '<span>Priya N.</span>' +
    '<a href="index.html" class="logout">Log Out</a>' +
  '</div>';

// Drop the finished sidebar into the page
document.querySelector(".sidebar").innerHTML = navHTML;