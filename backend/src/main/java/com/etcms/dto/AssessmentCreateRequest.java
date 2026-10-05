package com.etcms.dto;

import java.time.LocalDate;
import java.util.List;

public class AssessmentCreateRequest {
    private String title;
    private String description;
    private String courseName;
    private LocalDate assessmentDate;
    private Integer maximumMarks;
    private List<Long> assignedEmployeeIds;

    public AssessmentCreateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public LocalDate getAssessmentDate() { return assessmentDate; }
    public void setAssessmentDate(LocalDate assessmentDate) { this.assessmentDate = assessmentDate; }

    public Integer getMaximumMarks() { return maximumMarks; }
    public void setMaximumMarks(Integer maximumMarks) { this.maximumMarks = maximumMarks; }

    public List<Long> getAssignedEmployeeIds() { return assignedEmployeeIds; }
    public void setAssignedEmployeeIds(List<Long> assignedEmployeeIds) { this.assignedEmployeeIds = assignedEmployeeIds; }
}
