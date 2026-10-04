package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

@Component
public class PlatformAdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String username;
    private final String initialPassword;

    public PlatformAdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${PLATFORM_SUPER_ADMIN_EMAIL:}") String email,
            @Value("${PLATFORM_SUPER_ADMIN_USERNAME:}") String username,
            @Value("${PLATFORM_SUPER_ADMIN_INITIAL_PASSWORD:}") String initialPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.username = username;
        this.initialPassword = initialPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        boolean anyCredentialConfigured = hasText(email) || hasText(username) || hasText(initialPassword);
        if (!anyCredentialConfigured) return;
        if (!hasText(email) || !hasText(username) || initialPassword == null || initialPassword.length() < 12
                || initialPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Configure platform Super Admin email, username, and an initial password of at least 12 characters together");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedUsername = username.trim().toLowerCase();
        var byEmail = userRepository.findByEmail(normalizedEmail);
        var byUsername = userRepository.findByUsername(normalizedUsername);

        if (byEmail.isPresent() || byUsername.isPresent()) {
            User existing = byEmail.orElseGet(() -> byUsername.orElseThrow());
            boolean sameAccount = byEmail.isPresent() && byUsername.isPresent()
                    && byEmail.get().getId().equals(byUsername.get().getId());
            if (!sameAccount || existing.getRole() != Role.SUPER_ADMIN || existing.getSchoolId() != null) {
                throw new IllegalStateException("Configured platform Super Admin identity conflicts with an existing account");
            }
            return;
        }

        User platformAdmin = new User();
        platformAdmin.setEmail(normalizedEmail);
        platformAdmin.setUsername(normalizedUsername);
        platformAdmin.setPasswordHash(passwordEncoder.encode(initialPassword));
        platformAdmin.setRole(Role.SUPER_ADMIN);
        platformAdmin.setEnabled(true);
        platformAdmin.setPasswordChangeRequired(true);
        userRepository.save(platformAdmin);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
