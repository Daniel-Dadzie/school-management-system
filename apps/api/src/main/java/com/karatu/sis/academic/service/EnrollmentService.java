package com.karatu.sis.academic.service;

import com.karatu.sis.tenant.TenantContext;

import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.Enrollment;
import com.karatu.sis.academic.domain.EnrollmentStatus;
import com.karatu.sis.academic.domain.SchoolClass;
import com.karatu.sis.academic.dto.EnrollmentRequest;
import com.karatu.sis.academic.dto.EnrollmentResponse;
import com.karatu.sis.academic.dto.EnrollmentStatusUpdateRequest;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.EnrollmentRepository;
import com.karatu.sis.academic.repository.SchoolClassRepository;
import com.karatu.sis.common.exception.BusinessValidationException;
import com.karatu.sis.common.exception.ResourceConflictException;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.people.domain.Student;
import com.karatu.sis.people.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.karatu.sis.tenant.TenantContext;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final AcademicYearRepository academicYearRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             StudentRepository studentRepository,
                             SchoolClassRepository schoolClassRepository,
                             AcademicYearRepository academicYearRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.academicYearRepository = academicYearRepository;
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAllBySchoolId(TenantContext.requireSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentResponse enrollStudent(EnrollmentRequest request) {
        Student student = studentRepository.findByIdAndSchoolId(request.studentId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        AcademicYear academicYear = academicYearRepository.findByIdAndSchoolId(request.academicYearId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));

        SchoolClass schoolClass = schoolClassRepository.findByIdWithLockAndSchoolId(request.schoolClassId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        // Check for duplicate active enrollments in the same year
        boolean hasActive = enrollmentRepository.existsByStudentIdAndAcademicYearIdAndStatusInAndSchoolId(
                student.getId(), academicYear.getId(), List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.SUSPENDED), TenantContext.requireSchoolId());

        if (hasActive) {
            throw new ResourceConflictException("Student already has an active or suspended enrollment for this academic year");
        }

        long occupied = enrollmentRepository.countBySchoolClassIdAndStatusInAndSchoolId(
                schoolClass.getId(), List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.SUSPENDED), TenantContext.requireSchoolId());

        if (occupied >= schoolClass.getCapacity()) {
            throw new ResourceConflictException("Class has reached its enrollment capacity");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setSchoolClass(schoolClass);
        enrollment.setAcademicYear(academicYear);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);

        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }

    @Transactional
    public EnrollmentResponse updateEnrollmentStatus(UUID id, EnrollmentStatusUpdateRequest request) {
        Enrollment enrollment = enrollmentRepository.findByIdAndSchoolId(id, TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        // Add any explicit transition rules here if needed
        if (enrollment.getStatus() == EnrollmentStatus.WITHDRAWN || enrollment.getStatus() == EnrollmentStatus.TRANSFERRED) {
            // Usually terminal states
            throw new BusinessValidationException("Cannot change status of a terminal enrollment");
        }

        enrollment.setStatus(request.status());
        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getSchoolClass().getId(),
                enrollment.getAcademicYear().getId(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt(),
                enrollment.getCreatedAt(),
                enrollment.getUpdatedAt()
        );
    }
}
