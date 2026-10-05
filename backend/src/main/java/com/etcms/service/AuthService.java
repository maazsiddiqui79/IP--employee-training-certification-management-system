package com.etcms.service;

import com.etcms.dto.LoginRequest;
import com.etcms.dto.LoginResponse;
import com.etcms.model.AppUser;
import com.etcms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return LoginResponse.failure("Email and password are required.");
        }

        Optional<AppUser> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail().trim());
        if (userOpt.isEmpty()) {
            return LoginResponse.failure("Invalid email or password.");
        }

        AppUser user = userOpt.get();
        if (!user.getPassword().equals(request.getPassword().trim())) {
            return LoginResponse.failure("Invalid email or password.");
        }

        LocalDateTime now = LocalDateTime.now();
        user.setLastLogin(now);
        userRepository.save(user);

        String displayName = "ADMIN".equalsIgnoreCase(user.getRole())
                ? "Administrator"
                : (user.getEmployee() != null ? user.getEmployee().getName() : user.getEmail());

        Long empId = user.getEmployee() != null ? user.getEmployee().getId() : null;
        String mockToken = "token_" + UUID.randomUUID();

        return LoginResponse.success(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                empId,
                displayName,
                now,
                mockToken
        );
    }
}
