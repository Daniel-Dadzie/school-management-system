package com.karatu.sis.academic.service;

import com.karatu.sis.tenant.TenantContext;

import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.AssignmentStatus;
import com.karatu.sis.academic.domain.SchoolClass;
import com.karatu.sis.academic.domain.Subject;
import com.karatu.sis.academic.domain.TeacherAssignment;
import com.karatu.sis.academic.domain.Term;
import com.karatu.sis.academic.dto.AssignmentStatusUpdateRequest;
import com.karatu.sis.academic.dto.TeacherAssignmentRequest;
import com.karatu.sis.academic.dto.TeacherAssignmentResponse;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.SchoolClassRepository;
import com.karatu.sis.academic.repository.SubjectRepository;
import com.karatu.sis.academic.repository.TeacherAssignmentRepository;
import com.karatu.sis.academic.repository.TermRepository;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.common.exception.ResourceConflictException;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.common.exception.UnauthorizedResourceAccessException;
import com.karatu.sis.people.domain.Teacher;
import com.karatu.sis.people.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.karatu.sis.tenant.TenantContext;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TermRepository termRepository;
    private final com.karatu.sis.academic.repository.EnrollmentRepository enrollmentRepository;

    public TeacherAssignmentService(
            TeacherAssignmentRepository teacherAssignmentRepository,
            TeacherRepository teacherRepository,
            SubjectRepository subjectRepository,
            SchoolClassRepository schoolClassRepository,
            AcademicYearRepository academicYearRepository,
            TermRepository termRepository,
            com.karatu.sis.academic.repository.EnrollmentRepository enrollmentRepository) {
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.academicYearRepository = academicYearRepository;
        this.termRepository = termRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public List<com.karatu.sis.academic.dto.TeacherAssignmentRosterResponse> getStudentsForAssignment(UUID assignmentId) {
        TeacherAssignment assignment = teacherAssignmentRepository.findByIdAndSchoolId(assignmentId, TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        List<com.karatu.sis.academic.domain.Enrollment> enrollments = enrollmentRepository.findBySchoolIdAndSchoolClassIdAndAcademicYearIdAndStatus(
                TenantContext.requireSchoolId(),
                assignment.getSchoolClass().getId(),
                assignment.getAcademicYear().getId(),
                com.karatu.sis.academic.domain.EnrollmentStatus.ACTIVE
        );

        return enrollments.stream()
                .map(e -> new com.karatu.sis.academic.dto.TeacherAssignmentRosterResponse(
                        e.getId(),
                        new com.karatu.sis.people.dto.StudentResponse(
                                e.getStudent().getId(),
                                e.getStudent().getFirstName(),
                                e.getStudent().getLastName(),
                                e.getStudent().getAdmissionNumber()
                        )
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> getAllAssignments() {
        return teacherAssignmentRepository.findAllBySchoolId(TenantContext.requireSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> getMyAssignments(User principal) {
        Teacher teacher = teacherRepository.findByUser_IdAndSchoolId(principal.getId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new UnauthorizedResourceAccessException(
                        "Teacher profile not found for authenticated user"));

        return teacherAssignmentRepository.findByTeacherIdAndSchoolId(teacher.getId(), TenantContext.requireSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeacherAssignmentResponse assignTeacher(TeacherAssignmentRequest request) {
        Teacher teacher = teacherRepository.findByIdAndSchoolId(request.teacherId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        Subject subject = subjectRepository.findByIdAndSchoolId(request.subjectId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        SchoolClass schoolClass = schoolClassRepository.findByIdAndSchoolId(request.schoolClassId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        AcademicYear academicYear = academicYearRepository.findByIdAndSchoolId(request.academicYearId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));

        Term term = termRepository.findByIdAndSchoolId(request.termId(), TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        boolean exists = teacherAssignmentRepository
                .existsByTeacherIdAndSubjectIdAndSchoolClassIdAndAcademicYearIdAndTermIdAndSchoolId(
                        teacher.getId(),
                        subject.getId(),
                        schoolClass.getId(),
                        academicYear.getId(),
                        term.getId(), TenantContext.requireSchoolId());

        if (exists) {
            throw new ResourceConflictException(
                    "This teacher is already assigned to this subject and class for the given term");
        }

        TeacherAssignment assignment = new TeacherAssignment();
        assignment.setTeacher(teacher);
        assignment.setSubject(subject);
        assignment.setSchoolClass(schoolClass);
        assignment.setAcademicYear(academicYear);
        assignment.setTerm(term);
        assignment.setStatus(AssignmentStatus.ACTIVE);

        TeacherAssignment saved = teacherAssignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    @Transactional
    public TeacherAssignmentResponse updateAssignmentStatus(
            UUID id,
            AssignmentStatusUpdateRequest request) {

        TeacherAssignment assignment = teacherAssignmentRepository.findByIdAndSchoolId(id, TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        assignment.setStatus(request.status());

        TeacherAssignment saved = teacherAssignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    private TeacherAssignmentResponse mapToResponse(TeacherAssignment assignment) {
        return new TeacherAssignmentResponse(
                assignment.getId(),
                assignment.getTeacher().getId(),
                assignment.getSubject().getId(),
                assignment.getSchoolClass().getId(),
                assignment.getAcademicYear().getId(),
                assignment.getTerm().getId(),
                assignment.getStatus(),
                assignment.getCreatedAt(),
                assignment.getUpdatedAt()
        );
    }
}

