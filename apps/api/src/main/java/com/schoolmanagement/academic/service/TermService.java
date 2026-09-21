package com.schoolmanagement.academic.service;

import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.domain.Term;
import com.schoolmanagement.academic.dto.TermRequest;
import com.schoolmanagement.academic.dto.TermResponse;
import com.schoolmanagement.academic.repository.AcademicYearRepository;
import com.schoolmanagement.academic.repository.TermRepository;
import com.schoolmanagement.common.exception.BusinessValidationException;
import com.schoolmanagement.common.exception.ResourceConflictException;
import com.schoolmanagement.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TermService {

    private final TermRepository termRepository;
    private final AcademicYearRepository academicYearRepository;

    public TermService(TermRepository termRepository, AcademicYearRepository academicYearRepository) {
        this.termRepository = termRepository;
        this.academicYearRepository = academicYearRepository;
    }

    @Transactional(readOnly = true)
    public List<TermResponse> getTermsByAcademicYear(UUID academicYearId) {
        academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));

        return termRepository.findByAcademicYearId(academicYearId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TermResponse createTerm(UUID academicYearId, TermRequest request) {
        if (request.startDate().isAfter(request.endDate())) {
            throw new BusinessValidationException("Start date must be before end date");
        }

        AcademicYear year = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));

        List<Term> existingTerms = termRepository.findByAcademicYearId(academicYearId);
        for (Term existing : existingTerms) {
            if (!existing.getStartDate().isAfter(request.endDate()) &&
                !existing.getEndDate().isBefore(request.startDate())) {
                throw new ResourceConflictException("Term dates overlap with an existing term");
            }
        }

        Term term = new Term();
        term.setName(request.name().trim());
        term.setAcademicYear(year);
        term.setStartDate(request.startDate());
        term.setEndDate(request.endDate());
        term.setMandatory(request.isMandatory());

        Term saved = termRepository.save(term);
        return mapToResponse(saved);
    }

    private TermResponse mapToResponse(Term term) {
        return new TermResponse(
                term.getId(),
                term.getAcademicYear().getId(),
                term.getName(),
                term.getStartDate(),
                term.getEndDate(),
                term.isMandatory(),
                term.getCreatedAt(),
                term.getUpdatedAt()
        );
    }
}