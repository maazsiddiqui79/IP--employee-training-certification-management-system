package com.etcms.config;

import com.etcms.model.*;
import com.etcms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final DesignationRepository designationRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final UploadedCertificateRepository certificateRepository;
    private final AdminAssessmentRepository assessmentRepository;
    private final AssessmentResultRepository resultRepository;
    private final ActivityLogRepository activityLogRepository;

    public DataLoader(
            DesignationRepository designationRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            UploadedCertificateRepository certificateRepository,
            AdminAssessmentRepository assessmentRepository,
            AssessmentResultRepository resultRepository,
            ActivityLogRepository activityLogRepository) {
        this.designationRepository = designationRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.certificateRepository = certificateRepository;
        this.assessmentRepository = assessmentRepository;
        this.resultRepository = resultRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public void run(String... args) {
        if (designationRepository.count() > 0) {
            return; // Data already seeded
        }

        // 1. Seed Designations
        Designation d1 = designationRepository.save(new Designation("Software Developer"));
        Designation d2 = designationRepository.save(new Designation("QA Engineer"));
        Designation d3 = designationRepository.save(new Designation("Project Manager"));
        Designation d4 = designationRepository.save(new Designation("Business Analyst"));
        Designation d5 = designationRepository.save(new Designation("DevOps Engineer"));

        // 2. Seed Employees
        Employee e1 = employeeRepository.save(new Employee(null, "Alice Johnson", "alice@example.com", d1, "555-0101", LocalDate.parse("2024-01-15")));
        Employee e2 = employeeRepository.save(new Employee(null, "Bob Smith", "bob@example.com", d2, "555-0102", LocalDate.parse("2024-02-20")));
        Employee e3 = employeeRepository.save(new Employee(null, "Carol Williams", "carol@example.com", d3, "555-0103", LocalDate.parse("2024-03-10")));
        Employee e4 = employeeRepository.save(new Employee(null, "David Brown", "david@example.com", d4, "555-0104", LocalDate.parse("2024-04-05")));
        Employee e5 = employeeRepository.save(new Employee(null, "Eve Davis", "eve@example.com", d5, "555-0105", LocalDate.parse("2024-05-12")));

        // 3. Seed Users
        userRepository.save(new AppUser(null, null, "admin@example.com", "admin123", "ADMIN", null));
        userRepository.save(new AppUser(null, e1, "alice@example.com", "alice123", "EMPLOYEE", null));
        userRepository.save(new AppUser(null, e2, "bob@example.com", "bob123", "EMPLOYEE", null));
        userRepository.save(new AppUser(null, e3, "carol@example.com", "carol123", "EMPLOYEE", null));
        userRepository.save(new AppUser(null, e4, "david@example.com", "david123", "EMPLOYEE", null));
        userRepository.save(new AppUser(null, e5, "eve@example.com", "eve123", "EMPLOYEE", null));

        // 4. Seed Certificates
        createCert(e1, "Python Training Certificate", "TechCorp Academy", "2025-08-20", "2028-08-20", "TC-PY-001", null, "python-cert.pdf", "application/pdf", "APPROVED", null, "2025-08-22", "2025-08-25", "Administrator");
        createCert(e1, "React Developer Certificate", "Web Academy", "2025-10-15", "2027-10-15", "WA-REACT-042", "https://webacademy.com/verify/WA-REACT-042", "react-cert.pdf", "application/pdf", "APPROVED", null, "2025-10-18", "2025-10-20", "Administrator");
        createCert(e1, "AWS Cloud Practitioner Certificate", "Amazon Web Services", "2026-01-10", "2029-01-10", "AWS-CP-7891", "https://aws.amazon.com/verify", "aws-cert.pdf", "application/pdf", "APPROVED", null, "2026-01-12", "2026-01-15", "Administrator");
        createCert(e1, "Kubernetes Administrator", "Linux Foundation", "2026-06-15", null, "LF-CKA-XXXX", null, "cka-cert.jpg", "image/jpeg", "REJECTED", "Certificate ID could not be verified with the Linux Foundation registry. Please resubmit with a valid credential ID.", "2026-07-01", "2026-07-05", "Administrator");

        createCert(e2, "Selenium QA Certificate", "QA Institute", "2025-09-05", "2027-09-05", "QA-SEL-102", null, "selenium-cert.jpg", "image/jpeg", "APPROVED", null, "2025-09-07", "2025-09-10", "Administrator");
        createCert(e2, "JIRA Certified Professional", "Atlassian", "2025-12-22", "2027-12-22", "ATL-JIRA-556", "https://atlassian.com/verify/ATL-JIRA-556", "jira-cert.png", "image/png", "APPROVED", null, "2025-12-24", "2025-12-26", "Administrator");
        createCert(e2, "Docker Certified Associate", "Docker Inc.", "2026-08-01", "2028-08-01", "DCA-2026-77812", "https://docker.com/verify/DCA-2026-77812", "docker-cert.pdf", "application/pdf", "PENDING", null, "2026-09-01", null, null);

        createCert(e3, "PMP Certification", "Project Management Institute", "2026-08-01", "2029-08-01", "PMI-PMP-2026-44521", "https://pmi.org/certifications/verify/PMI-PMP-2026-44521", "pmp-cert.pdf", "application/pdf", "PENDING", null, "2026-09-01", null, null);
        createCert(e4, "CBAP Preparation Certificate", "BA Institute", "2026-03-01", null, null, null, "cbap-cert.pdf", "application/pdf", "APPROVED", null, "2026-03-03", "2026-03-05", "Administrator");
        createCert(e5, "Linux Administration Certificate", "Linux Foundation", "2025-11-20", "2028-11-20", "LF-LA-5523", null, "linux-cert.pdf", "application/pdf", "APPROVED", null, "2025-11-22", "2025-11-25", "Administrator");
        createCert(e5, "Docker & Kubernetes Professional", "Cloud Native Foundation", "2026-07-10", "2029-07-10", "CNF-DKP-2026", null, "dkp-cert.png", "image/png", "PENDING", null, "2026-08-01", null, null);

        // 5. Seed Admin Assessments
        AdminAssessment a1 = new AdminAssessment();
        a1.setTitle("Python Technical Assessment");
        a1.setDescription("Offline technical assessment covering Python fundamentals and OOP concepts.");
        a1.setCourseName("Python Training");
        a1.setAssessmentDate(LocalDate.parse("2026-09-10"));
        a1.setMaximumMarks(100);
        a1.setCreatedAt(LocalDate.parse("2026-09-05"));
        a1.setAssignedEmployees(new ArrayList<>(List.of(e1, e2)));
        AdminAssessment savedA1 = assessmentRepository.save(a1);

        AdminAssessment a2 = new AdminAssessment();
        a2.setTitle("QA Tools Evaluation");
        a2.setDescription("Practical evaluation on Selenium WebDriver and JIRA project management.");
        a2.setCourseName("Selenium Testing");
        a2.setAssessmentDate(LocalDate.parse("2026-09-15"));
        a2.setMaximumMarks(50);
        a2.setCreatedAt(LocalDate.parse("2026-09-08"));
        a2.setAssignedEmployees(new ArrayList<>(List.of(e2, e3)));
        AdminAssessment savedA2 = assessmentRepository.save(a2);

        AdminAssessment a3 = new AdminAssessment();
        a3.setTitle("Business Analysis Case Study");
        a3.setDescription("Case study presentation on requirements gathering and stakeholder communication.");
        a3.setCourseName("Business Analysis");
        a3.setAssessmentDate(LocalDate.parse("2026-09-20"));
        a3.setMaximumMarks(100);
        a3.setCreatedAt(LocalDate.parse("2026-09-12"));
        a3.setAssignedEmployees(new ArrayList<>(List.of(e4)));
        AdminAssessment savedA3 = assessmentRepository.save(a3);

        // 6. Seed Assessment Results
        resultRepository.save(new AssessmentResult(savedA1, e1, 92, "Excellent understanding of Python and OOP.", "COMPLETED"));
        resultRepository.save(new AssessmentResult(savedA1, e2, 81, "Good performance. Improve advanced OOP skills.", "COMPLETED"));
        resultRepository.save(new AssessmentResult(savedA2, e2, 44, "Strong Selenium skills. JIRA knowledge satisfactory.", "COMPLETED"));
        resultRepository.save(new AssessmentResult(savedA2, e3, null, null, "PENDING"));
        resultRepository.save(new AssessmentResult(savedA3, e4, 77, "Good presentation. Requirements gathering needs practice.", "COMPLETED"));

        // 7. Seed Recent Activity
        activityLogRepository.save(new ActivityLog("System initialized.", "System", LocalDateTime.parse("2026-09-01T10:00:00")));
    }

    private void createCert(
            Employee employee,
            String certName,
            String organization,
            String issueDate,
            String expiryDate,
            String certId,
            String verifyUrl,
            String fileName,
            String fileType,
            String status,
            String rejectionReason,
            String uploadedAt,
            String verifiedAt,
            String verifiedBy) {

        UploadedCertificate cert = new UploadedCertificate();
        cert.setEmployee(employee);
        cert.setCertificateName(certName);
        cert.setOrganization(organization);
        cert.setIssueDate(LocalDate.parse(issueDate));
        if (expiryDate != null) cert.setExpiryDate(LocalDate.parse(expiryDate));
        cert.setCertificateId(certId);
        cert.setVerificationUrl(verifyUrl);
        cert.setFileName(fileName);
        cert.setFileType(fileType);
        cert.setStatus(status);
        cert.setRejectionReason(rejectionReason);
        cert.setUploadedAt(LocalDate.parse(uploadedAt));
        if (verifiedAt != null) cert.setVerifiedAt(LocalDate.parse(verifiedAt));
        cert.setVerifiedBy(verifiedBy);

        certificateRepository.save(cert);
    }
}
