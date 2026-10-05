package com.karatu.sis.auth.controller;

import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.dto.SchoolUserCreateRequest;
import com.karatu.sis.auth.dto.SchoolUserResponse;
import com.karatu.sis.auth.dto.SchoolUserUpdateRequest;
import com.karatu.sis.auth.service.SchoolUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schools/current/users")
@PreAuthorize("hasRole('IT_ADMIN')")
public class SchoolUserController {
    private final SchoolUserService schoolUserService;

    public SchoolUserController(SchoolUserService schoolUserService) {
        this.schoolUserService = schoolUserService;
    }

    @GetMapping
    public List<SchoolUserResponse> list(@AuthenticationPrincipal User actor) {
        return schoolUserService.list(actor);
    }

    @GetMapping("/{userId}")
    public SchoolUserResponse get(@AuthenticationPrincipal User actor, @PathVariable UUID userId) {
        return schoolUserService.get(actor, userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SchoolUserResponse create(@AuthenticationPrincipal User actor,
                                     @Valid @RequestBody SchoolUserCreateRequest request) {
        return schoolUserService.create(actor, request);
    }

    @PatchMapping("/{userId}")
    public SchoolUserResponse update(@AuthenticationPrincipal User actor,
                                     @PathVariable UUID userId,
                                     @Valid @RequestBody SchoolUserUpdateRequest request) {
        return schoolUserService.update(actor, userId, request);
    }
}
