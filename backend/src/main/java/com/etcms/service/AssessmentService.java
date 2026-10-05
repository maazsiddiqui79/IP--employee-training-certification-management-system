package com.etcms.service;

import com.etcms.dto.AssessmentCreateRequest;
import com.etcms.model.AdminAssessment;
import com.etcms.model.AssessmentResult;
import com.etcms.model.Employee;
import com.etcms.repository.AdminAssessmentRepository;
import com.etcms.repository.AssessmentResultRepository;
import com.etcms.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AssessmentService {

    private final AdminAssessmentRepository assessmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final EmployeeRepository employeeRepository;
    private final ActivityService activityService;

    public AssessmentService(
            AdminAssessmentRepository assessmentRepository,
            AssessmentResultRepository assessmentResultRepository,
            EmployeeRepository employeeRepository,
            ActivityService activityService) {
        this.assessmentRepository = assessmentRepository;
        this.assessmentResultRepository = assessmentResultRepository;
        this.employeeRepository = employeeRepository;
        this.activityService = activityService;
    }

    public List<AdminAssessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    public Optional<AdminAssessment> getAssessmentById(Long id) {
        return assessmentRepository.findById(id);
    }

    @Transactional
    public AdminAssessment createAssessment(AssessmentCreateRequest req) {
        AdminAssessment assessment = new AdminAssessment();
        assessment.setTitle(req.getTitle().trim());
        assessment.setDescription(req.getDescription());
        assessment.setCourseName(req.getCourseName());
        assessment.setAssessmentDate(req.getAssessmentDate());
        assessment.setMaximumMarks(req.getMaximumMarks());
        assessment.setCreatedAt(LocalDate.now());

        List<Employee> assignedEmployees = new ArrayList<>();
        if (req.getAssignedEmployeeIds() != null && !req.getAssignedEmployeeIds().isEmpty()) {
            assignedEmployees = employeeRepository.findAllById(req.getAssignedEmployeeIds());
        }
        assessment.setAssignedEmployees(assignedEmployees);
        AdminAssessment savedAssessment = assessmentRepository.save(assessment);

        // Auto-generate PENDING results for each assigned employee
        for (Employee emp : assignedEmployees) {
            AssessmentResult result = new AssessmentResult();
            result.setAssessment(savedAssessment);
            result.setEmployee(emp);
            result.setMarks(null);
            result.setRemarks(null);
            result.setStatus("PENDING");
            assessmentResultRepository.save(result);
        }

        activityService.logActivity("Created assessment: " + savedAssessment.getTitle(), "Administrator");

        return savedAssessment;
    }

    @Transactional
    public void deleteAssessment(Long id) {
        AdminAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found with id: " + id));

        assessmentResultRepository.deleteByAssessment_Id(id);
        assessmentRepository.delete(assessment);

        activityService.logActivity("Deleted assessment: " + assessment.getTitle(), "Administrator");
    }

    public List<AssessmentResult> getResults(Long assessmentId, Long employeeId) {
        if (assessmentId != null && employeeId != null) {
            return assessmentResultRepository.findByAssessment_IdAndEmployee_Id(assessmentId, employeeId)
                    .map(List::of)
                    .orElse(List.of());
        } else if (assessmentId != null) {
            return assessmentResultRepository.findByAssessment_Id(assessmentId);
        } else if (employeeId != null) {
            return assessmentResultRepository.findByEmployee_Id(employeeId);
        }
        return assessmentResultRepository.findAll();
    }

    @Transactional
    public AssessmentResult saveResult(Long assessmentId, Long employeeId, Integer marks, String remarks) {
        Optional<AssessmentResult> existingOpt = assessmentResultRepository
                .findByAssessment_IdAndEmployee_Id(assessmentId, employeeId);

        AssessmentResult result;
        if (existingOpt.isPresent()) {
            result = existingOpt.get();
        } else {
            AdminAssessment assessment = assessmentRepository.findById(assessmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Assessment not found with id: " + assessmentId));
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + employeeId));
            result = new AssessmentResult();
            result.setAssessment(assessment);
            result.setEmployee(employee);
        }

        result.setMarks(marks);
        result.setRemarks(remarks);
        result.setStatus(marks != null ? "COMPLETED" : "PENDING");

        AssessmentResult saved = assessmentResultRepository.save(result);

        activityService.logActivity(
                "Updated assessment scores for employee: " + saved.getEmployeeName(),
                "Administrator"
        );

        return saved;
    }
}
