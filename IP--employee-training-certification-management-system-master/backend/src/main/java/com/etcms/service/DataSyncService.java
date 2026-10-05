package com.etcms.service;

import com.etcms.dto.FullDataResponse;
import com.etcms.repository.*;
import org.springframework.stereotype.Service;

@Service
public class DataSyncService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DesignationRepository designationRepository;
    private final UploadedCertificateRepository certificateRepository;
    private final AdminAssessmentRepository assessmentRepository;
    private final AssessmentResultRepository resultRepository;
    private final ActivityLogRepository activityLogRepository;

    public DataSyncService(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            DesignationRepository designationRepository,
            UploadedCertificateRepository certificateRepository,
            AdminAssessmentRepository assessmentRepository,
            AssessmentResultRepository resultRepository,
            ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.designationRepository = designationRepository;
        this.certificateRepository = certificateRepository;
        this.assessmentRepository = assessmentRepository;
        this.resultRepository = resultRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public FullDataResponse getFullData() {
        return new FullDataResponse(
                userRepository.findAll(),
                employeeRepository.findAll(),
                designationRepository.findAll(),
                certificateRepository.findAll(),
                assessmentRepository.findAll(),
                resultRepository.findAll(),
                activityLogRepository.findAllByOrderByIdDesc()
        );
    }
}
