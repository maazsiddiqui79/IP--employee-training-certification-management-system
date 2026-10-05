package com.etcms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class LoginResponse {

    private boolean success;
    private String message;
    private Long id;
    private String email;
    private String role;
    private Long employeeId;
    private String name;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime lastLogin;

    private String token;

    public LoginResponse() {
    }

    public static LoginResponse failure(String message) {
        LoginResponse res = new LoginResponse();
        res.setSuccess(false);
        res.setMessage(message);
        return res;
    }

    public static LoginResponse success(Long id, String email, String role, Long employeeId, String name, LocalDateTime lastLogin, String token) {
        LoginResponse res = new LoginResponse();
        res.setSuccess(true);
        res.setMessage("Login successful");
        res.setId(id);
        res.setEmail(email);
        res.setRole(role);
        res.setEmployeeId(employeeId);
        res.setName(name);
        res.setLastLogin(lastLogin);
        res.setToken(token);
        return res;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
