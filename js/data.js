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

const STAGES = ["New Applicant", "Screen", "Interview", "Final Round", "Offer"];

const SOURCES = [
  { source: "LinkedIn",  candidates: 35, hires: 4, dropOff: "20%" },
  { source: "Indeed",    candidates: 28, hires: 2, dropOff: "35%" },
  { source: "Referrals", candidates: 12, hires: 5, dropOff: "8%"  },
  { source: "Agency",    candidates: 9,  hires: 1, dropOff: "40%" }
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
    CANDIDATES = JSON.parse(saved);
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