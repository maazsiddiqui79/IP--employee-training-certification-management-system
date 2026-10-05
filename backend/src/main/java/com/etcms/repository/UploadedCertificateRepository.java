package com.etcms.repository;

import com.etcms.model.UploadedCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UploadedCertificateRepository extends JpaRepository<UploadedCertificate, Long> {
    List<UploadedCertificate> findByEmployee_Id(Long employeeId);
    void deleteByEmployee_Id(Long id);
}
