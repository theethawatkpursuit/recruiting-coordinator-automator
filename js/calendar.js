// js/calendar.js

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  // Convert CANDIDATES array into FullCalendar event objects
  var scheduledEvents = CANDIDATES
    .filter(function(c) { 
      // Filter out empty dates or legacy text placeholders
      return c.interviewDate && 
             c.interviewDate !== "Not scheduled" && 
             c.interviewDate !== "Pending"; 
    })
    .map(function(c) {
      return {
        id: c.id,
        title: c.name + " (" + c.role + ")",
        start: c.interviewDate,
        url: "candidate.html?id=" + c.id // Clicking an event opens candidate profile
      };
    });

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
  
    // Custom button icons using standard unicode arrows
    buttonText: {
      prev: '‹',
      next: '›',
      today: 'Today'
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: scheduledEvents,
    slotMinTime: '08:00:00', // Grid starts at 8:00 AM
    slotMaxTime: '19:00:00', // Grid ends at 7:00 PM
    height: 'auto'
  });

  calendar.render();
});