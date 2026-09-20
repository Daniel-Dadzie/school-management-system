package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.RefreshToken;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        String rawToken = generateOpaqueToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setFamilyId(UUID.randomUUID());
        refreshToken.setExpiresAt(LocalDateTime.now().plusNanos(refreshExpirationMs * 1000000));
        
        refreshTokenRepository.save(refreshToken);
        
        // We temporarily attach the raw token for the caller to send it to the client.
        // It won't be saved to the database in this raw form because the entity field is tokenHash.
        RefreshToken result = new RefreshToken();
        result.setId(refreshToken.getId());
        result.setUser(user);
        result.setTokenHash(rawToken); // Exposing raw token just once
        result.setFamilyId(refreshToken.getFamilyId());
        result.setExpiresAt(refreshToken.getExpiresAt());
        return result;
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        Optional<RefreshToken> optionalToken = refreshTokenRepository.findByTokenHash(tokenHash);

        if (optionalToken.isEmpty()) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        RefreshToken existingToken = optionalToken.get();

        // 1. Detect reuse of revoked token -> revoke whole family
        if (existingToken.getRevokedAt() != null) {
            refreshTokenRepository.revokeFamily(existingToken.getFamilyId());
            throw new BadCredentialsException("Refresh token reuse detected. Family revoked.");
        }

        // 2. Check expiration
        if (existingToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("Refresh token expired");
        }

        // 3. Mark old token as revoked
        existingToken.setRevokedAt(LocalDateTime.now());

        // 4. Create new token in the same family
        String newRawToken = generateOpaqueToken();
        String newTokenHash = hashToken(newRawToken);

        RefreshToken newToken = new RefreshToken();
        newToken.setUser(existingToken.getUser());
        newToken.setTokenHash(newTokenHash);
        newToken.setFamilyId(existingToken.getFamilyId());
        newToken.setExpiresAt(LocalDateTime.now().plusNanos(refreshExpirationMs * 1000000));

        refreshTokenRepository.save(newToken);

        existingToken.setReplacedBy(newToken);
        refreshTokenRepository.save(existingToken);

        // Return a DTO-like instance containing the raw token
        RefreshToken result = new RefreshToken();
        result.setUser(newToken.getUser());
        result.setTokenHash(newRawToken); // raw token
        result.setFamilyId(newToken.getFamilyId());
        result.setExpiresAt(newToken.getExpiresAt());
        return result;
    }

    @Transactional
    public void revokeToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(token);
            }
        });
    }
}
