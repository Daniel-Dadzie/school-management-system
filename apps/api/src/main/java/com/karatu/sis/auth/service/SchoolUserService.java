package com.karatu.sis.auth.service;

import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.domain.UserManagementAuditLog;
import com.karatu.sis.auth.dto.SchoolUserCreateRequest;
import com.karatu.sis.auth.dto.SchoolUserResponse;
import com.karatu.sis.auth.dto.SchoolUserUpdateRequest;
import com.karatu.sis.auth.repository.UserManagementAuditLogRepository;
import com.karatu.sis.auth.repository.UserRepository;
import com.karatu.sis.auth.service.RefreshTokenService;
import com.karatu.sis.common.exception.BusinessValidationException;
import com.karatu.sis.common.exception.ResourceConflictException;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.tenant.TenantContext;
import com.karatu.sis.common.exception.UnauthorizedResourceAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class SchoolUserService {
    private static final Set<Role> ASSIGNABLE_ROLES = Set.of(Role.ADMIN, Role.TEACHER, Role.PARENT);

    private final UserRepository userRepository;
    private final UserManagementAuditLogRepository auditRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public SchoolUserService(UserRepository userRepository,
                             UserManagementAuditLogRepository auditRepository,
                             PasswordEncoder passwordEncoder,
                             RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.auditRepository = auditRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional(readOnly = true)
    public List<SchoolUserResponse> list(User actor) {
        UUID schoolId = authorize(actor);
        return userRepository.findAllBySchoolIdOrderByCreatedAtDesc(schoolId).stream()
                .map(SchoolUserService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SchoolUserResponse get(User actor, UUID userId) {
        UUID schoolId = authorize(actor);
        return findInSchool(schoolId, userId).map(SchoolUserService::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public SchoolUserResponse create(User actor, SchoolUserCreateRequest request) {
        UUID schoolId = authorize(actor);
        requireAssignableRole(request.role());
        String email = normalize(request.email());
        String username = normalize(request.username());
        assertIdentifiersAvailable(email, username);

        User user = new User();
        user.setSchoolId(schoolId);
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setEnabled(true);
        User saved = userRepository.saveAndFlush(user);
        record(schoolId, actor.getId(), saved.getId(), "USER_CREATED");
        return toResponse(saved);
    }

    @Transactional
    public SchoolUserResponse update(User actor, UUID userId, SchoolUserUpdateRequest request) {
        UUID schoolId = authorize(actor);
        User user = findInSchool(schoolId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        validateUpdate(actor, user, request);

        boolean changed = false;
        boolean credentialsReset = request.password() != null;
        boolean deactivated = Boolean.FALSE.equals(request.enabled()) && user.isEnabled();
        boolean reactivated = Boolean.TRUE.equals(request.enabled()) && !user.isEnabled();
        boolean roleChanged = request.role() != null && request.role() != user.getRole();
        if (request.email() != null) {
            String email = normalize(request.email());
            if (!email.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, user.getId())) {
                    throw new ResourceConflictException("Email or username is already in use");
                }
                user.setEmail(email);
                changed = true;
            }
        }
        if (request.username() != null) {
            String username = normalize(request.username());
            if (!username.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.existsByUsernameIgnoreCaseAndIdNot(username, user.getId())) {
                    throw new ResourceConflictException("Email or username is already in use");
                }
                user.setUsername(username);
                changed = true;
            }
        }
        if (roleChanged) {
            requireAssignableRole(request.role());
            user.setRole(request.role());
            changed = true;
        }
        if (request.enabled() != null && request.enabled() != user.isEnabled()) {
            user.setEnabled(request.enabled());
            changed = true;
        }
        if (credentialsReset) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            changed = true;
        }
        if (!changed) throw new BusinessValidationException("At least one user field must change");

        User saved = userRepository.saveAndFlush(user);
        if (credentialsReset || deactivated) refreshTokenService.revokeAllForUser(saved.getId());
        if (credentialsReset) record(schoolId, actor.getId(), saved.getId(), "USER_CREDENTIALS_RESET");
        if (deactivated) record(schoolId, actor.getId(), saved.getId(), "USER_DEACTIVATED");
        if (reactivated) {
            record(schoolId, actor.getId(), saved.getId(), "USER_REACTIVATED");
        }
        if (roleChanged) record(schoolId, actor.getId(), saved.getId(), "USER_ROLE_CHANGED");
        if (!credentialsReset && !deactivated && !reactivated && !roleChanged) {
            record(schoolId, actor.getId(), saved.getId(), "USER_UPDATED");
        }
        return toResponse(saved);
    }

    private void validateUpdate(User actor, User target, SchoolUserUpdateRequest request) {
        if (target.getRole() == Role.SUPER_ADMIN) throw new ResourceNotFoundException("User not found");
        if (target.getRole() == Role.IT_ADMIN && !target.getId().equals(actor.getId())) {
            throw new UnauthorizedResourceAccessException("School IT administrator accounts cannot be changed by another school user");
        }
        if (request.role() != null) requireAssignableRole(request.role());
        if (target.getId().equals(actor.getId())) {
            if (request.role() != null && request.role() != target.getRole()) {
                throw new BusinessValidationException("You cannot change your own role");
            }
            if (Boolean.FALSE.equals(request.enabled())) {
                throw new BusinessValidationException("You cannot deactivate your own account");
            }
            if (request.password() != null) {
                throw new BusinessValidationException("You cannot reset your own password through school user management");
            }
        }
    }

    private UUID authorize(User actor) {
        if (actor == null || actor.getRole() != Role.IT_ADMIN || actor.getSchoolId() == null) {
            throw new UnauthorizedResourceAccessException("School IT administrator access is required");
        }
        UUID schoolId = TenantContext.requireSchoolId();
        TenantContext.assertSchool(actor.getSchoolId());
        return schoolId;
    }

    private java.util.Optional<User> findInSchool(UUID schoolId, UUID userId) {
        return userRepository.findByIdAndSchoolId(userId, schoolId);
    }

    private void assertIdentifiersAvailable(String email, String username) {
        if (userRepository.existsByEmailIgnoreCase(email) || userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResourceConflictException("Email or username is already in use");
        }
    }

    private void requireAssignableRole(Role role) {
        if (!ASSIGNABLE_ROLES.contains(role)) {
            throw new BusinessValidationException("School IT administrators may assign only ADMIN, TEACHER, or PARENT roles");
        }
    }

    private void record(UUID schoolId, UUID actorId, UUID targetId, String action) {
        auditRepository.save(new UserManagementAuditLog(schoolId, actorId, targetId, action));
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) throw new BusinessValidationException("Email and username must not be blank");
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private static SchoolUserResponse toResponse(User user) {
        return new SchoolUserResponse(user.getId(), user.getEmail(), user.getUsername(), user.getRole(),
                user.isEnabled(), user.getCreatedAt(), user.getUpdatedAt());
    }
}
