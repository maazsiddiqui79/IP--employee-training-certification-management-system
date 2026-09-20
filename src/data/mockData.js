// ============================================================
// Mock Relational Database — Extended Schema
// Suitable for Java/Spring Boot REST API migration.
// ============================================================

export const designations = [
  { id: 1, name: "Software Developer" },
  { id: 2, name: "QA Engineer" },
  { id: 3, name: "Project Manager" },
  { id: 4, name: "Business Analyst" },
  { id: 5, name: "DevOps Engineer" },
];

export const employees = [
  { id: 1, name: "Alice Johnson",  email: "alice@example.com",  designationId: 1, phone: "555-0101", dateOfJoining: "2024-01-15" },
  { id: 2, name: "Bob Smith",      email: "bob@example.com",    designationId: 2, phone: "555-0102", dateOfJoining: "2024-02-20" },
  { id: 3, name: "Carol Williams", email: "carol@example.com",  designationId: 3, phone: "555-0103", dateOfJoining: "2024-03-10" },
  { id: 4, name: "David Brown",    email: "david@example.com",  designationId: 4, phone: "555-0104", dateOfJoining: "2024-04-05" },
  { id: 5, name: "Eve Davis",      email: "eve@example.com",    designationId: 5, phone: "555-0105", dateOfJoining: "2024-05-12" },
];

export const users = [
  { id: 1, employeeId: null, email: "admin@example.com", password: process.env.REACT_APP_MOCK_ADMIN_PASSWORD, role: "ADMIN",    lastLogin: null },
  { id: 2, employeeId: 1,   email: "alice@example.com",  password: process.env.REACT_APP_MOCK_ALICE_PASSWORD, role: "EMPLOYEE", lastLogin: null },
  { id: 3, employeeId: 2,   email: "bob@example.com",    password: process.env.REACT_APP_MOCK_BOB_PASSWORD,   role: "EMPLOYEE", lastLogin: null },
  { id: 4, employeeId: 3,   email: "carol@example.com",  password: process.env.REACT_APP_MOCK_CAROL_PASSWORD, role: "EMPLOYEE", lastLogin: null },
  { id: 5, employeeId: 4,   email: "david@example.com",  password: process.env.REACT_APP_MOCK_DAVID_PASSWORD, role: "EMPLOYEE", lastLogin: null },
  { id: 6, employeeId: 5,   email: "eve@example.com",    password: process.env.REACT_APP_MOCK_EVE_PASSWORD,   role: "EMPLOYEE", lastLogin: null },
];

// ── uploadedCertificates ─────────────────────────────────────
// Unified certificate record. status: "PENDING" | "APPROVED" | "REJECTED"
// fileData is null for seed records (no real file); set by FileReader on upload.
export const uploadedCertificates = [
  // Alice — 3 APPROVED, 1 REJECTED
  {
    id: 1, employeeId: 1,
    certificateName: "Python Training Certificate", organization: "TechCorp Academy",
    issueDate: "2025-08-20", expiryDate: "2028-08-20",
    certificateId: "TC-PY-001", verificationUrl: null,
    fileName: "python-cert.pdf", fileType: "application/pdf", fileData: null,
    status: "APPROVED", rejectionReason: null,
    uploadedAt: "2025-08-22", verifiedAt: "2025-08-25", verifiedBy: "Administrator",
  },
  {
    id: 2, employeeId: 1,
    certificateName: "React Developer Certificate", organization: "Web Academy",
    issueDate: "2025-10-15", expiryDate: "2027-10-15",
    certificateId: "WA-REACT-042", verificationUrl: "https://webacademy.com/verify/WA-REACT-042",
    fileName: "react-cert.pdf", fileType: "application/pdf", fileData: null,
    status: "APPROVED", rejectionReason: null,
    uploadedAt: "2025-10-18", verifiedAt: "2025-10-20", verifiedBy: "Administrator",
  },
  {
    id: 3, employeeId: 1,
    certificateName: "AWS Cloud Practitioner Certificate", organization: "Amazon Web Services",
    issueDate: "2026-01-10", expiryDate: "2029-01-10",
    certificateId: "AWS-CP-7891", verificationUrl: "https://aws.amazon.com/verify",
    fileName: "aws-cert.pdf", fileType: "application/pdf", fileData: null,
    status: "APPROVED", rejectionReason: null,
    uploadedAt: "2026-01-12", verifiedAt: "2026-01-15", verifiedBy: "Administrator",
  },
  {
    id: 4, employeeId: 1,
    certificateName: "Kubernetes Administrator", organization: "Linux Foundation",
    issueDate: "2026-06-15", expiryDate: null,
    certificateId: "LF-CKA-XXXX", verificationUrl: null,
    fileName: "cka-cert.jpg", fileType: "image/jpeg", fileData: null,
    status: "REJECTED",
    rejectionReason: "Certificate ID could not be verified with the Linux Foundation registry. Please resubmit with a valid credential ID.",
    uploadedAt: "2026-07-01", verifiedAt: "2026-07-05", verifiedBy: "Administrator",
  },
  // Bob — 2 APPROVED, 1 PENDING
  {
    id: 5, employeeId: 2,
    certificateName: "Selenium QA Certificate", organization: "QA Institute",
    issueDate: "2025-09-05", expiryDate: "2027-09-05",
    certificateId: "QA-SEL-102", verificationUrl: null,
    fileName: "selenium-cert.jpg", fileType: "image/jpeg", fileData: null,
    status: "APPROVED", rejectionReason: null,
    uploadedAt: "2025-09-07", verifiedAt: "2025-09-10", verifiedBy: "Administrator",
  },
  {
    id: 6, employeeId: 2,
    certificateName: "JIRA Certified Professional", organization: "Atlassian",
    issueDate: "2025-12-22", expiryDate: "2027-12-22",
    certificateId: "ATL-JIRA-556", verificationUrl: "https://atlassian.com/verify/ATL-JIRA-556",
    fileName: "jira-cert.png", fileType: "image/png", fileData: null,
    status: "APPROVED", rejectionReason: null,
    uploadedAt: "2025-12-24", verifiedAt: "2025-12-26", verifiedBy: "Administrator",
  },
  {
    id: 7, employeeId: 2,
    certificateName: "Docker Certified Associate", organization: "Docker Inc.",
    issueDate: "2026-08-01", expiryDate: "2028-08-01",
    certificateId: "DCA-2026-77812", verificationUrl: "https://docker.com/verify/DCA-2026-77812",
    fileName: "docker-cert.pdf", fileType: "application/pdf", fileData: null,
    status: "PENDING", rejectionReason: null,
    uploadedAt: "2026-09-01", verifiedAt: null, verifiedBy: null,
  },
  // Carol — 1 PENDING (no approved → empty official record)
  {
    id: 8, employeeId: 3,
    certificateName: "PMP Certification", organization: "Project Management Institute",
    issueDate: "2026-08-01", expiryDate: "2029-08-01",
    certificateId: "PMI-PMP-2026-44521", verificationUrl: "https://pmi.org/certifications/verify/PMI-PMP-2026-44521",
    fileName: "pmp-cert.pdf", fileType: "application/pdf", fileData: null,
    status: "PENDING", rejectionReason: null,
    uploadedAt: "2026-09-01", verifiedAt: null, verifiedBy: null,
  },
  // David — 1 APPROVED
  {
    id: 9, employeeId: 4,
    certificateName: "CBAP Preparation Certificate", organization: "BA Institute",
    issueDate: "2026-03-01", expiryDate: null,
    certificateId: null, verificationUrl: null,
    fileName: "cbap-cert.pdf", fileType: "application/pdf", fileData: null,
    status: "APPROVED", rejectionReason: null,
    uploadedAt: "2026-03-03", verifiedAt: "2026-03-05", verifiedBy: "Administrator",
  },
  // Eve — 1 APPROVED, 1 PENDING
  {
    id: 10, employeeId: 5,
    certificateName: "Linux Administration Certificate", organization: "Linux Foundation",
    issueDate: "2025-11-20", expiryDate: "2028-11-20",
    certificateId: "LF-LA-5523", verificationUrl: null,
    fileName: "linux-cert.pdf", fileType: "application/pdf", fileData: null,
    status: "APPROVED", rejectionReason: null,
    uploadedAt: "2025-11-22", verifiedAt: "2025-11-25", verifiedBy: "Administrator",
  },
  {
    id: 11, employeeId: 5,
    certificateName: "Docker & Kubernetes Professional", organization: "Cloud Native Foundation",
    issueDate: "2026-07-10", expiryDate: "2029-07-10",
    certificateId: "CNF-DKP-2026", verificationUrl: null,
    fileName: "dkp-cert.png", fileType: "image/png", fileData: null,
    status: "PENDING", rejectionReason: null,
    uploadedAt: "2026-08-01", verifiedAt: null, verifiedBy: null,
  },
];

// ── adminAssessments ──────────────────────────────────────────
// Assessment definitions created by Admin.
export const adminAssessments = [
  {
    id: 1,
    title: "Python Technical Assessment",
    description: "Offline technical assessment covering Python fundamentals and OOP concepts.",
    courseName: "Python Training",
    assessmentDate: "2026-09-10",
    maximumMarks: 100,
    assignedEmployeeIds: [1, 2],
    createdAt: "2026-09-05",
  },
  {
    id: 2,
    title: "QA Tools Evaluation",
    description: "Practical evaluation on Selenium WebDriver and JIRA project management.",
    courseName: "Selenium Testing",
    assessmentDate: "2026-09-15",
    maximumMarks: 50,
    assignedEmployeeIds: [2, 3],
    createdAt: "2026-09-08",
  },
  {
    id: 3,
    title: "Business Analysis Case Study",
    description: "Case study presentation on requirements gathering and stakeholder communication.",
    courseName: "Business Analysis",
    assessmentDate: "2026-09-20",
    maximumMarks: 100,
    assignedEmployeeIds: [4],
    createdAt: "2026-09-12",
  },
];

// ── assessmentResults ─────────────────────────────────────────
// Per-employee results for each assessment. status: "PENDING" | "COMPLETED"
export const assessmentResults = [
  { id: 1, assessmentId: 1, employeeId: 1, marks: 92, remarks: "Excellent understanding of Python and OOP.", status: "COMPLETED" },
  { id: 2, assessmentId: 1, employeeId: 2, marks: 81, remarks: "Good performance. Improve advanced OOP skills.", status: "COMPLETED" },
  { id: 3, assessmentId: 2, employeeId: 2, marks: 44, remarks: "Strong Selenium skills. JIRA knowledge satisfactory.", status: "COMPLETED" },
  { id: 4, assessmentId: 2, employeeId: 3, marks: null, remarks: null, status: "PENDING" },
  { id: 5, assessmentId: 3, employeeId: 4, marks: 77, remarks: "Good presentation. Requirements gathering needs practice.", status: "COMPLETED" },
];

export const recentActivity = [
  { id: 1, text: "System initialized.", date: "2026-09-01T10:00:00Z" }
];
