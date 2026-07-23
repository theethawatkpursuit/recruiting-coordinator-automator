// Render auto-generated tasks from CANDIDATES data
function renderTasksPage() {
  const tasks = getDynamicTasks();

  const overdueEl = document.getElementById("overdueTasks");
  const todayEl = document.getElementById("todayTasks");
  const upcomingEl = document.getElementById("upcomingTasks");

  if (overdueEl) {
    overdueEl.innerHTML = tasks.overdue.length > 0
      ? tasks.overdue.map(t => `<li><span class="dot overdue"></span>${t}</li>`).join('')
      : '<li><em>No overdue tasks!</em></li>';
  }

  if (todayEl) {
    todayEl.innerHTML = tasks.today.length > 0
      ? tasks.today.map(t => `<li><span class="dot"></span>${t}</li>`).join('')
      : '<li><em>No tasks due today.</em></li>';
  }

  if (upcomingEl) {
    upcomingEl.innerHTML = tasks.upcoming.length > 0
      ? tasks.upcoming.map(t => `<li><span class="dot"></span>${t}</li>`).join('')
      : '<li><em>No upcoming tasks.</em></li>';
  }
}

renderTasksPage();