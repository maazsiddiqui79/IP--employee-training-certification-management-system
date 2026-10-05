package com.etcms.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "assessment_results")
public class AssessmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assessment_id", nullable = false)
    private AdminAssessment assessment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private Integer marks;

    @Column(length = 1000)
    private String remarks;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, COMPLETED

    public AssessmentResult() {
    }

    public AssessmentResult(AdminAssessment assessment, Employee employee, Integer marks, String remarks, String status) {
        this.assessment = assessment;
        this.employee = employee;
        this.marks = marks;
        this.remarks = remarks;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AdminAssessment getAssessment() {
        return assessment;
    }

    public void setAssessment(AdminAssessment assessment) {
        this.assessment = assessment;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    @JsonProperty("assessmentId")
    public Long getAssessmentId() {
        return assessment != null ? assessment.getId() : null;
    }

    @JsonProperty("assessmentTitle")
    public String getAssessmentTitle() {
        return assessment != null ? assessment.getTitle() : null;
    }

    @JsonProperty("maximumMarks")
    public Integer getMaximumMarks() {
        return assessment != null ? assessment.getMaximumMarks() : null;
    }

    @JsonProperty("employeeId")
    public Long getEmployeeId() {
        return employee != null ? employee.getId() : null;
    }

    @JsonProperty("employeeName")
    public String getEmployeeName() {
        return employee != null ? employee.getName() : null;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
