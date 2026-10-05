package com.karatu.sis.auth.controller;

import com.karatu.sis.auth.dto.AuthResponse;
import com.karatu.sis.auth.dto.LoginRequest;
import com.karatu.sis.auth.dto.ChangePasswordRequest;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${karatu.security.jwt.cookie.name:karatu_refresh_token}")
    private String refreshTokenCookieName;

    @Value("${karatu.security.jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${karatu.security.jwt.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${karatu.security.jwt.cookie.path:/api/v1/auth}")
    private String cookiePath;

    @Value("${karatu.security.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthService.AuthResult result = authService.authenticate(request);

        ResponseCookie refreshCookie = createRefreshCookie(
                result.rawRefreshToken(),
                refreshExpirationMs / 1000L
        );

        AuthResponse response = new AuthResponse(
                result.accessToken(),
                result.user()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest request
    ) {
        String refreshToken = getRefreshTokenFromCookie(request);

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        AuthService.AuthResult result = authService.refreshToken(refreshToken);

        ResponseCookie refreshCookie = createRefreshCookie(
                result.rawRefreshToken(),
                refreshExpirationMs / 1000L
        );

        AuthResponse response = new AuthResponse(
                result.accessToken(),
                result.user()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request
    ) {
        String refreshToken = getRefreshTokenFromCookie(request);

        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }

        ResponseCookie clearedCookie = createRefreshCookie("", 0);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearedCookie.toString())
                .build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changeInitialPassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        authService.changeInitialPassword(user, request);
        return ResponseEntity.noContent().build();
    }

    private String getRefreshTokenFromCookie(
            HttpServletRequest request
    ) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (refreshTokenCookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    private ResponseCookie createRefreshCookie(
            String token,
            long maxAgeSeconds
    ) {
        return ResponseCookie
                .from(
                        refreshTokenCookieName,
                        token == null ? "" : token
                )
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path(cookiePath)
                .maxAge(maxAgeSeconds)
                .build();
    }
}
