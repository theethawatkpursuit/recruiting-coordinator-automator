// js/calendar.js
// Initializes a FullCalendar instance on the Calendar page, displaying scheduled
// candidate interviews as events. Clicking an event navigates to the candidate profile.
// CANDIDATES is defined in js/data.js.

// Wait for the DOM to be fully loaded before initializing the calendar.
// #calendar is defined in calendar.html.
document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  // Convert CANDIDATES array into FullCalendar event objects.
  // Only include candidates with a real interview date (skip placeholders).
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

  // Create the FullCalendar instance with month/week/day views and custom toolbar.
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
  
    // Custom button icons using standard unicode arrows
    buttonText: {
      prev: '‹',
      next: '›',
      today: 'Today'
    },
    // Toolbar layout: navigation on left, title in center, view switcher on right.
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

  // Render the calendar into the #calendar div.
  calendar.render();
});
