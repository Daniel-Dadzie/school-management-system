package com.karatu.sis.academic.controller;

import com.karatu.sis.academic.dto.*;
import com.karatu.sis.academic.service.TimetableService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    // -------------------------------------------------------------------------
    // Periods
    // -------------------------------------------------------------------------

    @GetMapping("/periods")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'SUPER_ADMIN')")
    public ResponseEntity<List<TimetablePeriodDTO>> getPeriods() {
        return ResponseEntity.ok(timetableService.getPeriods());
    }

    @PostMapping("/periods")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TimetablePeriodDTO> createPeriod(@Valid @RequestBody TimetablePeriodRequestDTO request) {
        TimetablePeriodDTO created = timetableService.createPeriod(request);
        return ResponseEntity.created(URI.create("/api/v1/academic/timetable/periods/" + created.id())).body(created);
    }

    @PutMapping("/periods/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TimetablePeriodDTO> updatePeriod(
            @PathVariable UUID periodId,
            @Valid @RequestBody TimetablePeriodRequestDTO request) {
        return ResponseEntity.ok(timetableService.updatePeriod(periodId, request));
    }

    @DeleteMapping("/periods/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deletePeriod(@PathVariable UUID periodId) {
        timetableService.deletePeriod(periodId);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Entries
    // -------------------------------------------------------------------------

    @GetMapping("/entries")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'SUPER_ADMIN')")
    public ResponseEntity<List<TimetableEntryDTO>> getEntries(
            @RequestParam UUID termId,
            @RequestParam UUID classId) {
        return ResponseEntity.ok(timetableService.getEntriesForClass(termId, classId));
    }

    @PostMapping("/entries")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TimetableEntryDTO> createEntry(@Valid @RequestBody TimetableEntryRequestDTO request) {
        TimetableEntryDTO created = timetableService.createEntry(request);
        return ResponseEntity.created(URI.create("/api/v1/academic/timetable/entries/" + created.id())).body(created);
    }

    @DeleteMapping("/entries/{entryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID entryId) {
        timetableService.deleteEntry(entryId);
        return ResponseEntity.noContent().build();
    }
}
