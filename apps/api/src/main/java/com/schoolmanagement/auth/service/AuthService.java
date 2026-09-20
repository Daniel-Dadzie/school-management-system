package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.dto.AuthResponse;
import com.schoolmanagement.auth.dto.LoginRequest;
import com.schoolmanagement.auth.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
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
                    new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getRole())
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
                new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getRole())
        );
    }

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revokeToken(rawRefreshToken);
        }
    }
}

