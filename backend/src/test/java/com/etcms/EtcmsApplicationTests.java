package com.etcms;

import com.etcms.dto.LoginRequest;
import com.etcms.dto.LoginResponse;
import com.etcms.model.Employee;
import com.etcms.repository.EmployeeRepository;
import com.etcms.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EtcmsApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    void contextLoads() {
        assertNotNull(authService);
        assertNotNull(employeeRepository);
    }

    @Test
    void testInitialDataLoaded() {
        List<Employee> employees = employeeRepository.findAll();
        assertFalse(employees.isEmpty(), "Employees should be seeded by DataLoader");
        assertEquals(5, employees.size(), "Should have 5 initial employees");
    }

    @Test
    void testAdminLogin() {
        LoginResponse response = authService.login(new LoginRequest("admin@example.com", "admin123"));
        assertTrue(response.isSuccess(), "Admin login should succeed");
        assertEquals("ADMIN", response.getRole());
        assertEquals("Administrator", response.getName());
    }

    @Test
    void testEmployeeLogin() {
        LoginResponse response = authService.login(new LoginRequest("alice@example.com", "alice123"));
        assertTrue(response.isSuccess(), "Employee login should succeed");
        assertEquals("EMPLOYEE", response.getRole());
        assertEquals("Alice Johnson", response.getName());
        assertEquals(1L, response.getEmployeeId());
    }

    @Test
    void testInvalidLogin() {
        LoginResponse response = authService.login(new LoginRequest("invalid@example.com", "wrongpass"));
        assertFalse(response.isSuccess(), "Invalid login should fail");
    }
}
