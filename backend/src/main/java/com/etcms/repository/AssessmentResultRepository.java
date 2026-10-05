package com.etcms.repository;

import com.etcms.model.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, Long> {
    List<AssessmentResult> findByEmployee_Id(Long employeeId);
    void deleteByAssessment_Id(Long id);
    Optional<AssessmentResult> findByAssessment_IdAndEmployee_Id(Long assessmentId, Long employeeId);
    List<AssessmentResult> findByAssessment_Id(Long id);
    void deleteByEmployee_Id(Long id);
}
