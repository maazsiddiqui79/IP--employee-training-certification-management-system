package com.etcms.dto;

import com.etcms.model.*;
import java.util.List;

public class FullDataResponse {

    private List<AppUser> users;
    private List<Employee> employees;
    private List<Designation> designations;
    private List<UploadedCertificate> uploadedCertificates;
    private List<AdminAssessment> adminAssessments;
    private List<AssessmentResult> assessmentResults;
    private List<ActivityLog> activities;

    public FullDataResponse() {
    }

    public FullDataResponse(
            List<AppUser> users,
            List<Employee> employees,
            List<Designation> designations,
            List<UploadedCertificate> uploadedCertificates,
            List<AdminAssessment> adminAssessments,
            List<AssessmentResult> assessmentResults,
            List<ActivityLog> activities) {
        this.users = users;
        this.employees = employees;
        this.designations = designations;
        this.uploadedCertificates = uploadedCertificates;
        this.adminAssessments = adminAssessments;
        this.assessmentResults = assessmentResults;
        this.activities = activities;
    }

    public List<AppUser> getUsers() {
        return users;
    }

    public void setUsers(List<AppUser> users) {
        this.users = users;
    }

    public List<Employee> getEmployees() {
        return employees;
    }

    public void setEmployees(List<Employee> employees) {
        this.employees = employees;
    }

    public List<Designation> getDesignations() {
        return designations;
    }

    public void setDesignations(List<Designation> designations) {
        this.designations = designations;
    }

    public List<UploadedCertificate> getUploadedCertificates() {
        return uploadedCertificates;
    }

    public void setUploadedCertificates(List<UploadedCertificate> uploadedCertificates) {
        this.uploadedCertificates = uploadedCertificates;
    }

    public List<AdminAssessment> getAdminAssessments() {
        return adminAssessments;
    }

    public void setAdminAssessments(List<AdminAssessment> adminAssessments) {
        this.adminAssessments = adminAssessments;
    }

    public List<AssessmentResult> getAssessmentResults() {
        return assessmentResults;
    }

    public void setAssessmentResults(List<AssessmentResult> assessmentResults) {
        this.assessmentResults = assessmentResults;
    }

    public List<ActivityLog> getActivities() {
        return activities;
    }

    public void setActivities(List<ActivityLog> activities) {
        this.activities = activities;
    }
}
