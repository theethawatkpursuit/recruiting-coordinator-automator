// Render auto-generated tasks from CANDIDATES data.
// Gets the dynamic task lists (overdue, today, upcoming) and fills the three
// task panels on the Tasks page. Shows fallback messages when lists are empty.
// getDynamicTasks is defined in js/data.js.
function renderTasksPage() {
  // Get the auto-generated task lists from the shared data module.
  // getDynamicTasks is defined in js/data.js.
  const tasks = getDynamicTasks();

  // Get the three list container elements from the page.
  // #overdueTasks, #todayTasks, and #upcomingTasks are defined in tasks.html.
  const overdueEl = document.getElementById("overdueTasks");
  const todayEl = document.getElementById("todayTasks");
  const upcomingEl = document.getElementById("upcomingTasks");

  // Render overdue tasks with red dots, or a "no overdue" message.
  if (overdueEl) {
    overdueEl.innerHTML = tasks.overdue.length > 0
      ? tasks.overdue.map(t => `<li><span class="dot overdue"></span>${t}</li>`).join('')
      : '<li><em>No overdue tasks!</em></li>';
  }

  // Render today's tasks with blue dots, or a "no tasks today" message.
  if (todayEl) {
    todayEl.innerHTML = tasks.today.length > 0
      ? tasks.today.map(t => `<li><span class="dot"></span>${t}</li>`).join('')
      : '<li><em>No tasks due today.</em></li>';
  }

  // Render upcoming tasks with blue dots, or a "no upcoming" message.
  if (upcomingEl) {
    upcomingEl.innerHTML = tasks.upcoming.length > 0
      ? tasks.upcoming.map(t => `<li><span class="dot"></span>${t}</li>`).join('')
      : '<li><em>No upcoming tasks.</em></li>';
  }
}

// Render the tasks page on load.
renderTasksPage();
