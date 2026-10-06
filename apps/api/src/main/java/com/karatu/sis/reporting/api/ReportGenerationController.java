package com.karatu.sis.reporting.api;

import com.karatu.sis.reporting.service.ReportGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/reporting/generation")
public class ReportGenerationController {

    private final ReportGenerationService reportGenerationService;

    public ReportGenerationController(ReportGenerationService reportGenerationService) {
        this.reportGenerationService = reportGenerationService;
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAuthority('reporting.manage')")
    public ResponseEntity<Void> generateReportsBulk(
            @RequestBody @Valid ReportGenerationRequest request,
            Principal principal) {
        
        reportGenerationService.generateReportsForClass(
                request.getAcademicYearId(),
                request.getTermId(),
                request.getClassId(),
                request.getTemplateId(),
                principal != null ? principal.getName() : "system"
        );
        
        return ResponseEntity.accepted().build();
    }
}
