package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.dto.AuthResponse;
import com.schoolmanagement.auth.dto.LoginRequest;
import com.schoolmanagement.auth.dto.ChangePasswordRequest;
import com.schoolmanagement.auth.repository.UserRepository;
import com.schoolmanagement.auth.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService, RefreshTokenService refreshTokenService,
                       UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record AuthResult(String accessToken, String rawRefreshToken, AuthResponse.UserDto user) {}

    public AuthResult authenticate(LoginRequest request) {
        try {
            String identifier = request.identifier() != null ? request.identifier().trim().toLowerCase() : "";
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, request.password())
            );

            User user = (User) authentication.getPrincipal();
            if (!user.isEnabled()) {
                throw new BadCredentialsException("Account is disabled");
            }

            String accessToken = jwtService.generateToken(user);
            com.schoolmanagement.auth.domain.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

            return new AuthResult(
                    accessToken,
                    refreshToken.getTokenHash(), // the method returns the raw token here
                    new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getRole(), user.isPasswordChangeRequired())
            );
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    public AuthResult refreshToken(String rawRefreshToken) {
        com.schoolmanagement.auth.domain.RefreshToken newRefresh = refreshTokenService.rotateRefreshToken(rawRefreshToken);
        User user = newRefresh.getUser();

        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled");
        }

        String newAccessToken = jwtService.generateToken(user);
        return new AuthResult(
                newAccessToken,
                newRefresh.getTokenHash(), // raw token
                new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getRole(), user.isPasswordChangeRequired())
        );
    }

    @Transactional
    public void changeInitialPassword(User user, ChangePasswordRequest request) {
        if (!user.isPasswordChangeRequired()) {
            throw new com.schoolmanagement.common.exception.BusinessValidationException("Password change is not required");
        }
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordChangeRequired(false);
        userRepository.save(user);
    }

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revokeToken(rawRefreshToken);
        }
    }
}

