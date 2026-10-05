package com.etcms.repository;

import com.etcms.model.AdminAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminAssessmentRepository extends JpaRepository<AdminAssessment, Long> {
}
