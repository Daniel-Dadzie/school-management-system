package com.karatu.sis.academic.controller;

import com.karatu.sis.academic.dto.PromotionCandidateDTO;
import com.karatu.sis.academic.dto.PromotionRequestDTO;
import com.karatu.sis.academic.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/candidates")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<List<PromotionCandidateDTO>> getPromotionCandidates(
            @RequestParam UUID academicYearId,
            @RequestParam UUID termId,
            @RequestParam UUID classId) {
        return ResponseEntity.ok(promotionService.getPromotionCandidates(academicYearId, termId, classId));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Void> promoteStudents(@RequestBody PromotionRequestDTO request) {
        promotionService.promoteStudents(request);
        return ResponseEntity.ok().build();
    }
}
