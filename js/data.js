// Shared candidate data used across all pages.
var CANDIDATES = [
  {
    id: 1, name: "Maya Chen", role: "UX Designer", dept: "Product",
    source: "LinkedIn", stage: "Interview", lastContact: 10,
    manager: "Ravi Shah", nextStep: "Schedule 2nd interview",
    status: "risk", interviewDate: "Pending",
    notes: "Strong portfolio. Completed first interview. Waiting on hiring manager availability."
  },
  {
    id: 2, name: "Jordan Lee", role: "Backend Engineer", dept: "Engineering",
    source: "Employee Referral", stage: "Final Round", lastContact: 4,
    manager: "Ana Torres", nextStep: "Request hiring manager feedback",
    status: "wait", interviewDate: "Completed May 2",
    notes: "Excellent system design round. Awaiting feedback from panel."
  },
  {
    id: 3, name: "Sam Patel", role: "Product Manager", dept: "Product",
    source: "Indeed", stage: "Screen", lastContact: 2,
    manager: "Ravi Shah", nextStep: "Schedule first interview",
    status: "action", interviewDate: "Not scheduled",
    notes: "Passed recruiter screen. Needs interview scheduled with hiring manager."
  },
  {
    id: 4, name: "Ava Smith", role: "Sales Associate", dept: "Sales",
    source: "LinkedIn", stage: "New Applicant", lastContact: 1,
    manager: "Dan Kim", nextStep: "Review application",
    status: "ok", interviewDate: "Not scheduled",
    notes: "New application received. Not yet reviewed."
  },
  {
    id: 5, name: "Leo Brown", role: "Backend Engineer", dept: "Engineering",
    source: "Google Search", stage: "New Applicant", lastContact: 3,
    manager: "Ana Torres", nextStep: "Review application",
    status: "ok", interviewDate: "Not scheduled",
    notes: "Google Search-sourced candidate. Resume looks promising."
  },
  {
    id: 6, name: "Emma Wilson", role: "UX Designer", dept: "Product",
    source: "Employee Referral", stage: "Offer", lastContact: 1,
    manager: "Ravi Shah", nextStep: "Follow up on offer decision",
    status: "ok", interviewDate: "Completed Apr 28",
    notes: "Offer extended. Awaiting candidate decision."
  },
  {
    id: 7, name: "Noah King", role: "Product Manager", dept: "Product",
    source: "Indeed", stage: "Interview", lastContact: 12,
    manager: "Ravi Shah", nextStep: "Send status update to candidate",
    status: "risk", interviewDate: "Completed Apr 25",
    notes: "No contact in 12 days. High risk of going cold — reach out ASAP."
  },
  {
    id: 8, name: "Marcus Tan", role: "Sales Associate", dept: "Sales",
    source: "LinkedIn", stage: "Screen", lastContact: 5,
    manager: "Dan Kim", nextStep: "Schedule screen call",
    status: "action", interviewDate: "Not scheduled",
    notes: "Applied via LinkedIn. Needs recruiter screen scheduled."
  },
  {
    id: 9, name: "Karen Lopez", role: "UX Designer", dept: "Product",
    source: "Other", stage: "New Applicant", lastContact: 5,
    manager: "Kissy Sullivan", nextStep: "Schedule first interview",
    status: "risk", interviewDate: "Not scheduled",
    notes: "Requires visa sponsorship."
  },
  {
    id: 10, name: "Thomas Garcia", role: "Sales Associate", dept: "Sales",
    source: "CareerBuilder", stage: "Final Round", lastContact: 1,
    manager: "Michael Albert", nextStep: "Review application",
    status: "risk", interviewDate: "Completed May 16",
    notes: "Waiting for feedback from the panel."
  },
  {
    id: 11, name: "Linda Taylor", role: "Product Manager", dept: "Product",
    source: "Other", stage: "New Applicant", lastContact: 13,
    manager: "Ravi Shah", nextStep: "Schedule screen call",
    status: "ok", interviewDate: "Not scheduled",
    notes: "Requires visa sponsorship."
  },
  {
    id: 12, name: "Patricia Lopez", role: "HR Manager", dept: "HR",
    source: "CareerBuilder", stage: "Final Round", lastContact: 14,
    manager: "Kissy Sullivan", nextStep: "Request hiring manager feedback",
    status: "risk", interviewDate: "Completed May 5",
    notes: "Salary expectations are too high."
  },
  {
    id: 13, name: "William Smith", role: "Data Scientist", dept: "Engineering",
    source: "On-line Web application", stage: "Final Round", lastContact: 4,
    manager: "Dan Kim", nextStep: "Schedule first interview",
    status: "ok", interviewDate: "Completed May 18",
    notes: "Needs to improve technical skills."
  },
  {
    id: 14, name: "Susan Smith", role: "Software Engineer", dept: "Engineering",
    source: "Other", stage: "Interview", lastContact: 13,
    manager: "Kissy Sullivan", nextStep: "Send rejection email",
    status: "ok", interviewDate: "Completed May 7",
    notes: "Salary expectations are too high."
  },
  {
    id: 15, name: "Michael Thomas", role: "Software Engineer", dept: "Engineering",
    source: "Website", stage: "Offer", lastContact: 11,
    manager: "Michael Albert", nextStep: "Schedule 2nd interview",
    status: "ok", interviewDate: "Completed May 4",
    notes: "Very enthusiastic and eager to learn."
  },
  {
    id: 16, name: "Mary Brown", role: "Software Engineer", dept: "Engineering",
    source: "Other", stage: "Interview", lastContact: 5,
    manager: "Dan Kim", nextStep: "Request hiring manager feedback",
    status: "ok", interviewDate: "Completed May 17",
    notes: "Looks promising based on resume."
  },
  {
    id: 17, name: "Barbara Martin", role: "HR Manager", dept: "HR",
    source: "CareerBuilder", stage: "Final Round", lastContact: 2,
    manager: "Ana Torres", nextStep: "Follow up on offer decision",
    status: "action", interviewDate: "Completed May 10",
    notes: "Excellent communication skills."
  },
  {
    id: 18, name: "Jessica Gonzalez", role: "Data Scientist", dept: "Engineering",
    source: "Other", stage: "Offer", lastContact: 5,
    manager: "Michael Albert", nextStep: "Send rejection email",
    status: "risk", interviewDate: "Completed May 19",
    notes: "Waiting for feedback from the panel."
  },
  {
    id: 19, name: "Michael Smith", role: "UX Designer", dept: "Product",
    source: "Website", stage: "Screen", lastContact: 11,
    manager: "Dan Kim", nextStep: "Prepare offer letter",
    status: "wait", interviewDate: "Not scheduled",
    notes: "Requires visa sponsorship."
  },
  {
    id: 20, name: "Robert Thomas", role: "Product Manager", dept: "Product",
    source: "Diversity Job Fair", stage: "Offer", lastContact: 13,
    manager: "Dan Kim", nextStep: "Request hiring manager feedback",
    status: "ok", interviewDate: "Completed May 20",
    notes: "Did not pass the initial screening."
  },
  {
    id: 21, name: "Michael Jackson", role: "Software Engineer", dept: "Engineering",
    source: "On-line Web application", stage: "New Applicant", lastContact: 12,
    manager: "Dan Kim", nextStep: "Schedule first interview",
    status: "ok", interviewDate: "Not scheduled",
    notes: "Very enthusiastic and eager to learn."
  },
  {
    id: 22, name: "Robert Miller", role: "Sales Associate", dept: "Sales",
    source: "CareerBuilder", stage: "Interview", lastContact: 12,
    manager: "Ana Torres", nextStep: "Request hiring manager feedback",
    status: "action", interviewDate: "Completed May 12",
    notes: "Waiting for feedback from the panel."
  },
  {
    id: 23, name: "Charles Wilson", role: "HR Manager", dept: "HR",
    source: "Diversity Job Fair", stage: "Final Round", lastContact: 3,
    manager: "Dan Kim", nextStep: "Prepare offer letter",
    status: "action", interviewDate: "Completed May 10",
    notes: "Needs to improve technical skills."
  },
  {
    id: 24, name: "Robert Martinez", role: "Software Engineer", dept: "Engineering",
    source: "On-line Web application", stage: "Screen", lastContact: 7,
    manager: "Michael Albert", nextStep: "Review application",
    status: "ok", interviewDate: "Not scheduled",
    notes: "Salary expectations are too high."
  },
  {
    id: 25, name: "Patricia Martin", role: "Product Manager", dept: "Product",
    source: "Website", stage: "Offer", lastContact: 15,
    manager: "Dan Kim", nextStep: "Review application",
    status: "risk", interviewDate: "Completed May 19",
    notes: "Has a lot of relevant experience."
  },
  {
    id: 26, name: "Patricia Martinez", role: "HR Manager", dept: "HR",
    source: "Website", stage: "Interview", lastContact: 13,
    manager: "Ana Torres", nextStep: "Request hiring manager feedback",
    status: "wait", interviewDate: "Completed May 15",
    notes: "Highly recommended by former manager."
  },
  {
    id: 27, name: "Jennifer Martinez", role: "UX Designer", dept: "Product",
    source: "Website", stage: "Screen", lastContact: 1,
    manager: "Dan Kim", nextStep: "Follow up on offer decision",
    status: "action", interviewDate: "Not scheduled",
    notes: "Very enthusiastic and eager to learn."
  },
  {
    id: 28, name: "Elizabeth Martinez", role: "Software Engineer", dept: "Engineering",
    source: "CareerBuilder", stage: "Interview", lastContact: 7,
    manager: "Kissy Sullivan", nextStep: "Follow up on offer decision",
    status: "wait", interviewDate: "Completed May 13",
    notes: "Very enthusiastic and eager to learn."
  },
  {
    id: 29, name: "Charles Anderson", role: "Data Scientist", dept: "Engineering",
    source: "Other", stage: "New Applicant", lastContact: 13,
    manager: "Ana Torres", nextStep: "Request hiring manager feedback",
    status: "risk", interviewDate: "Not scheduled",
    notes: "Very enthusiastic and eager to learn."
  },
  {
    id: 30, name: "David Martin", role: "Product Manager", dept: "Product",
    source: "CareerBuilder", stage: "Screen", lastContact: 5,
    manager: "Ravi Shah", nextStep: "Follow up on offer decision",
    status: "ok", interviewDate: "Not scheduled",
    notes: "Waiting for feedback from the panel."
  },
  {
    id: 31, name: "Susan Thomas", role: "Sales Associate", dept: "Sales",
    source: "Diversity Job Fair", stage: "Interview", lastContact: 9,
    manager: "Michael Albert", nextStep: "Follow up on offer decision",
    status: "action", interviewDate: "Completed May 1",
    notes: "Did not pass the initial screening."
  },
  {
    id: 32, name: "William Davis", role: "UX Designer", dept: "Product",
    source: "On-line Web application", stage: "Interview", lastContact: 13,
    manager: "Dan Kim", nextStep: "Send rejection email",
    status: "ok", interviewDate: "Completed May 4",
    notes: "Did not pass the initial screening."
  },
  {
    id: 33, name: "William Moore", role: "HR Manager", dept: "HR",
    source: "CareerBuilder", stage: "Screen", lastContact: 1,
    manager: "Kissy Sullivan", nextStep: "Schedule first interview",
    status: "action", interviewDate: "Not scheduled",
    notes: "Has a lot of relevant experience."
  },
  {
    id: 34, name: "William Brown", role: "UX Designer", dept: "Product",
    source: "Diversity Job Fair", stage: "Offer", lastContact: 15,
    manager: "Dan Kim", nextStep: "Follow up on offer decision",
    status: "action", interviewDate: "Completed May 8",
    notes: "Looks promising based on resume."
  },
  {
    id: 35, name: "Richard Taylor", role: "UX Designer", dept: "Product",
    source: "CareerBuilder", stage: "Final Round", lastContact: 2,
    manager: "Ana Torres", nextStep: "Schedule 2nd interview",
    status: "ok", interviewDate: "Completed May 1",
    notes: "Did not pass the initial screening."
  },
  {
    id: 36, name: "Mary Gonzalez", role: "HR Manager", dept: "HR",
    source: "Diversity Job Fair", stage: "Final Round", lastContact: 4,
    manager: "Ana Torres", nextStep: "Follow up on offer decision",
    status: "wait", interviewDate: "Completed May 15",
    notes: "Salary expectations are too high."
  },
  {
    id: 37, name: "Patricia Lopez", role: "UX Designer", dept: "Product",
    source: "Other", stage: "Interview", lastContact: 7,
    manager: "Ravi Shah", nextStep: "Review application",
    status: "wait", interviewDate: "Completed May 12",
    notes: "Requires visa sponsorship."
  },
  {
    id: 38, name: "Jennifer Anderson", role: "Marketing Specialist", dept: "Marketing",
    source: "Website", stage: "Interview", lastContact: 6,
    manager: "Kissy Sullivan", nextStep: "Send status update to candidate",
    status: "wait", interviewDate: "Completed May 18",
    notes: "Waiting for feedback from the panel."
  }

];

const STAGES = ["New Applicant", "Screen", "Interview", "Final Round", "Offer"];

const SOURCES = [
  { source: "LinkedIn",  candidates: 35, hires: 4, dropOff: "20%" },
  { source: "Indeed",    candidates: 28, hires: 2, dropOff: "35%" },
  { source: "Employee Referral", candidates: 12, hires: 5, dropOff: "8%"  },
  { source: "Google Search",    candidates: 9,  hires: 1, dropOff: "40%" }
];

function statusBadge(status) {
  switch (status) {
    case "risk":   return { text: "At Risk",          cls: "badge-risk" };
    case "wait":   return { text: "Waiting Feedback",  cls: "badge-wait" };
    case "action": return { text: "Needs Action",      cls: "badge-action" };
    default:       return { text: "On Track",          cls: "badge-ok" };
  }
}

function saveCandidates() {
  localStorage.setItem("recruitflowCandidates", JSON.stringify(CANDIDATES));
}

function loadSavedCandidates() {
  var saved = localStorage.getItem("recruitflowCandidates");
  if (saved !== null) {
    var parsed = JSON.parse(saved);
    // If we have added new candidates to the static array, overwrite the local storage cache
    if (parsed.length < CANDIDATES.length) {
      saveCandidates();
    } else {
      CANDIDATES = parsed;
    }
  }
}

// Generate real-time task items based on candidate statuses & contact dates
function getDynamicTasks() {
  const overdue = [];
  const today = [];
  const upcoming = [];

  CANDIDATES.forEach(c => {
    if (c.status === "risk" || c.lastContact >= 7) {
      overdue.push(`Send update to ${c.name} (no contact in ${c.lastContact} days)`);
    } else if (c.status === "action" || c.status === "wait") {
      today.push(`${c.nextStep} for ${c.name}`);
    } else {
      upcoming.push(`${c.nextStep} for ${c.name}`);
    }
  });

  return { overdue, today, upcoming };
}

loadSavedCandidates();

// Parse a single line of CSV taking quotes into account (shared utility)
function parseCSVLine(text) {
  var ret = [];
  var inQuote = false;
  var value = "";
  for (var i = 0; i < text.length; i++) {
    var char = text[i];
    if (inQuote) {
      if (char === '"') {
        if (i < text.length - 1 && text[i+1] === '"') {
          value += '"';
          i++; // skip escaped quote
        } else {
          inQuote = false;
        }
      } else {
        value += char;
      }
    } else {
      if (char === '"') {
        inQuote = true;
      } else if (char === ',') {
        ret.push(value);
        value = "";
      } else {
        value += char;
      }
    }
  }
  ret.push(value);
  return ret;
}
