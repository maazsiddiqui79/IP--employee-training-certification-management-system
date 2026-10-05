package com.etcms.service;

import com.etcms.dto.EmployeeRequest;
import com.etcms.dto.EmployeeResponse;
import com.etcms.model.AppUser;
import com.etcms.model.Designation;
import com.etcms.model.Employee;
import com.etcms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DesignationRepository designationRepository;
    private final UserRepository userRepository;
    private final UploadedCertificateRepository certificateRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final AdminAssessmentRepository assessmentRepository;
    private final ActivityService activityService;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            DesignationRepository designationRepository,
            UserRepository userRepository,
            UploadedCertificateRepository certificateRepository,
            AssessmentResultRepository assessmentResultRepository,
            AdminAssessmentRepository assessmentRepository,
            ActivityService activityService) {
        this.employeeRepository = employeeRepository;
        this.designationRepository = designationRepository;
        this.userRepository = userRepository;
        this.certificateRepository = certificateRepository;
        this.assessmentResultRepository = assessmentResultRepository;
        this.assessmentRepository = assessmentRepository;
        this.activityService = activityService;
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Optional<EmployeeResponse> getEmployeeById(Long id) {
        return employeeRepository.findById(id).map(this::mapToResponse);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByEmailIgnoreCase(email) || userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An employee or user with email " + email + " already exists.");
        }

        Designation designation = designationRepository.findById(req.getDesignationId())
                .orElseThrow(() -> new IllegalArgumentException("Designation not found with id: " + req.getDesignationId()));

        Employee employee = new Employee();
        employee.setName(req.getName().trim());
        employee.setEmail(email);
        employee.setDesignation(designation);
        employee.setPhone(req.getPhone());
        employee.setDateOfJoining(req.getDateOfJoining());
        Employee savedEmployee = employeeRepository.save(employee);

        String role = (req.getRole() != null && !req.getRole().isBlank()) ? req.getRole().toUpperCase() : "EMPLOYEE";
        String password = (req.getPassword() != null && !req.getPassword().isBlank()) ? req.getPassword() : "employee123";

        AppUser user = new AppUser();
        user.setEmployee(savedEmployee);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        userRepository.save(user);

        activityService.logActivity("Added new employee: " + savedEmployee.getName(), "Administrator");

        return mapToResponse(savedEmployee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest req) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));

        String email = req.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new IllegalArgumentException("Email " + email + " is already in use by another employee.");
        }

        Designation designation = designationRepository.findById(req.getDesignationId())
                .orElseThrow(() -> new IllegalArgumentException("Designation not found with id: " + req.getDesignationId()));

        employee.setName(req.getName().trim());
        employee.setEmail(email);
        employee.setDesignation(designation);
        employee.setPhone(req.getPhone());
        employee.setDateOfJoining(req.getDateOfJoining());
        Employee savedEmployee = employeeRepository.save(employee);

        userRepository.findByEmployee_Id(id).ifPresent(user -> {
            user.setEmail(email);
            if (req.getRole() != null && !req.getRole().isBlank()) {
                user.setRole(req.getRole().toUpperCase());
            }
            if (req.getPassword() != null && !req.getPassword().isBlank()) {
                user.setPassword(req.getPassword());
            }
            userRepository.save(user);
        });

        activityService.logActivity("Updated employee: " + savedEmployee.getName(), "Administrator");

        return mapToResponse(savedEmployee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));

        // 1. Delete associated user
        userRepository.deleteByEmployee_Id(id);

        // 2. Delete certificates
        certificateRepository.deleteByEmployee_Id(id);

        // 3. Delete assessment results
        assessmentResultRepository.deleteByEmployee_Id(id);

        // 4. Remove from assigned assessments
        assessmentRepository.findAll().forEach(assessment -> {
            if (assessment.getAssignedEmployees().removeIf(e -> e.getId().equals(id))) {
                assessmentRepository.save(assessment);
            }
        });

        // 5. Delete employee
        employeeRepository.delete(employee);

        activityService.logActivity("Deleted employee: " + employee.getName(), "Administrator");
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        EmployeeResponse res = new EmployeeResponse();
        res.setId(emp.getId());
        res.setName(emp.getName());
        res.setEmail(emp.getEmail());
        res.setDesignationId(emp.getDesignation() != null ? emp.getDesignation().getId() : null);
        res.setDesignationName(emp.getDesignation() != null ? emp.getDesignation().getName() : null);
        res.setPhone(emp.getPhone());
        res.setDateOfJoining(emp.getDateOfJoining());

        userRepository.findByEmployee_Id(emp.getId()).ifPresent(user -> {
            res.setRole(user.getRole());
            res.setUserId(user.getId());
        });

        return res;
    }
}
