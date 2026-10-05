package com.etcms.dto;

import jakarta.validation.constraints.NotBlank;

public class ActivityRequest {

    @NotBlank(message = "Action is required")
    private String action;

    private String user;

    public ActivityRequest() {
    }

    public ActivityRequest(String action, String user) {
        this.action = action;
        this.user = user;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
}
