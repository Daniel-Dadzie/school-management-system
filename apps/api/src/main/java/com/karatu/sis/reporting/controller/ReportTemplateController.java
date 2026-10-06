package com.karatu.sis.reporting.controller;

import com.karatu.sis.reporting.dto.ReportTemplateRequest;
import com.karatu.sis.reporting.dto.ReportTemplateResponse;
import com.karatu.sis.reporting.service.ReportTemplateService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reporting/templates")
public class ReportTemplateController {

    private final ReportTemplateService reportTemplateService;

    public ReportTemplateController(ReportTemplateService reportTemplateService) {
        this.reportTemplateService = reportTemplateService;
    }

    @GetMapping
    public ResponseEntity<Page<ReportTemplateResponse>> getTemplates(Pageable pageable) {
        return ResponseEntity.ok(reportTemplateService.getTemplates(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportTemplateResponse> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(reportTemplateService.getTemplate(id));
    }

    @PostMapping
    public ResponseEntity<ReportTemplateResponse> createTemplate(@Valid @RequestBody ReportTemplateRequest request) {
        ReportTemplateResponse response = reportTemplateService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportTemplateResponse> updateTemplate(
            @PathVariable UUID id, 
            @Valid @RequestBody ReportTemplateRequest request) {
        return ResponseEntity.ok(reportTemplateService.updateTemplate(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        reportTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
