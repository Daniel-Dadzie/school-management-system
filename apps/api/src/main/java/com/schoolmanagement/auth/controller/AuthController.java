package com.schoolmanagement.auth.controller;

import com.schoolmanagement.auth.dto.AuthResponse;
import com.schoolmanagement.auth.dto.LoginRequest;
import com.schoolmanagement.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

    private final AuthService authService;

    @Value("${jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${jwt.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.cookie.path:/api/v1/auth}")
    private String cookiePath;

    @Value("${jwt.refresh-expiration-ms:604800000}")
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

    private String getRefreshTokenFromCookie(
            HttpServletRequest request
    ) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
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
                        REFRESH_TOKEN_COOKIE_NAME,
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