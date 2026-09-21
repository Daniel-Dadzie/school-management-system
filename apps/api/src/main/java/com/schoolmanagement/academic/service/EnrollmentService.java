package com.schoolmanagement.academic.service;

import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.domain.Enrollment;
import com.schoolmanagement.academic.domain.EnrollmentStatus;
import com.schoolmanagement.academic.domain.SchoolClass;
import com.schoolmanagement.academic.dto.EnrollmentRequest;
import com.schoolmanagement.academic.dto.EnrollmentResponse;
import com.schoolmanagement.academic.dto.EnrollmentStatusUpdateRequest;
import com.schoolmanagement.academic.repository.AcademicYearRepository;
import com.schoolmanagement.academic.repository.EnrollmentRepository;
import com.schoolmanagement.academic.repository.SchoolClassRepository;
import com.schoolmanagement.common.exception.BusinessValidationException;
import com.schoolmanagement.common.exception.ResourceConflictException;
import com.schoolmanagement.common.exception.ResourceNotFoundException;
import com.schoolmanagement.people.domain.Student;
import com.schoolmanagement.people.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return enrollmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentResponse enrollStudent(EnrollmentRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        AcademicYear academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));

        SchoolClass schoolClass = schoolClassRepository.findByIdWithLock(request.schoolClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        // Check for duplicate active enrollments in the same year
        boolean hasActive = enrollmentRepository.existsByStudentIdAndAcademicYearIdAndStatusIn(
                student.getId(), academicYear.getId(), List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.SUSPENDED));

        if (hasActive) {
            throw new ResourceConflictException("Student already has an active or suspended enrollment for this academic year");
        }

        long occupied = enrollmentRepository.countBySchoolClassIdAndStatusIn(
                schoolClass.getId(), List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.SUSPENDED));

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
        Enrollment enrollment = enrollmentRepository.findById(id)
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
