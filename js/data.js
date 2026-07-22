// Shared candidate data used across all pages.
// In a real app this would come from a database/API.

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
    source: "Referral", stage: "Final Round", lastContact: 4,
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
    source: "Agency", stage: "New Applicant", lastContact: 3,
    manager: "Ana Torres", nextStep: "Review application",
    status: "ok", interviewDate: "Not scheduled",
    notes: "Agency-sourced candidate. Resume looks promising."
  },
  {
    id: 6, name: "Emma Wilson", role: "UX Designer", dept: "Product",
    source: "Referral", stage: "Offer", lastContact: 1,
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
  }
];

// The stages, in order, used by the pipeline board.
const STAGES = ["New Applicant", "Screen", "Interview", "Final Round", "Offer"];

// Source effectiveness data used by the reports page.
const SOURCES = [
  { source: "LinkedIn",  candidates: 35, hires: 4, dropOff: "20%" },
  { source: "Indeed",    candidates: 28, hires: 2, dropOff: "35%" },
  { source: "Referrals", candidates: 12, hires: 5, dropOff: "8%"  },
  { source: "Agency",    candidates: 9,  hires: 1, dropOff: "40%" }
];

// Tasks used by the tasks page.
const TASKS = {
  overdue: [
    "Send update to Maya Chen (no contact in 10 days)",
    "Send status update to Noah King (no contact in 12 days)",
    "Request feedback for Jordan Lee"
  ],
  today: [
    "Schedule interview for Sam Patel",
    "Review new applicants for Sales Associate"
  ],
  upcoming: [
    "Follow up with Emma Wilson on offer",
    "Schedule screen call with Marcus Tan"
  ]
};

// Helper: map a status code to a readable label + badge class.
function statusBadge(status) {
  switch (status) {
    case "risk":   return { text: "At Risk",          cls: "badge-risk" };
    case "wait":   return { text: "Waiting Feedback",  cls: "badge-wait" };
    case "action": return { text: "Needs Action",      cls: "badge-action" };
    default:       return { text: "On Track",          cls: "badge-ok" };
  }
}

// Save the current candidate list to the browser
function saveCandidates() {
  localStorage.setItem("recruitflowCandidates", JSON.stringify(CANDIDATES));
}

// Load saved candidates from the browser, if they exist
function loadSavedCandidates() {
  var saved = localStorage.getItem("recruitflowCandidates");

  if (saved !== null) {
    CANDIDATES = JSON.parse(saved);
  }
}

// Get the next available ID number
function getNextCandidateId() {
  var highestId = 0;

  for (var i = 0; i < CANDIDATES.length; i++) {
    if (CANDIDATES[i].id > highestId) {
      highestId = CANDIDATES[i].id;
    }
  }

  return highestId + 1;
}

// Automatically load saved candidates whenever data.js loads
loadSavedCandidates();