package com.karatu.sis.academic.service;

import com.karatu.sis.tenant.TenantContext;

import com.karatu.sis.academic.domain.Subject;
import com.karatu.sis.academic.dto.SubjectRequest;
import com.karatu.sis.academic.dto.SubjectResponse;
import com.karatu.sis.academic.repository.SubjectRepository;
import com.karatu.sis.academic.repository.TeacherAssignmentRepository;
import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.common.exception.ResourceConflictException;
import com.karatu.sis.people.domain.Teacher;
import com.karatu.sis.people.repository.TeacherRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final TeacherRepository teacherRepository;

    public SubjectService(SubjectRepository subjectRepository,
                          TeacherAssignmentRepository teacherAssignmentRepository,
                          TeacherRepository teacherRepository) {
        this.subjectRepository = subjectRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.teacherRepository = teacherRepository;
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getSubjects(User principal) {
        if (principal.getRole() == Role.ADMIN) {
            return subjectRepository.findAllBySchoolId(TenantContext.requireSchoolId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        if (principal.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser_IdAndSchoolId(principal.getId(), TenantContext.requireSchoolId())
                    .orElseThrow(() -> new IllegalStateException("Teacher profile not found for authenticated user"));

            return teacherAssignmentRepository.findActiveSubjectsByTeacherIdAndSchoolId(teacher.getId(), TenantContext.requireSchoolId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return List.of();
    }

    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        Subject subject = new Subject();
        subject.setName(request.name().trim());
        subject.setCode(request.code().trim());
        if (request.department() != null) {
            subject.setDepartment(request.department().trim());
        }

        try {
            Subject saved = subjectRepository.save(subject);
            return mapToResponse(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Subject with this code already exists");
        }
    }

    private SubjectResponse mapToResponse(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getCode(),
                subject.getDepartment(),
                subject.getCreatedAt(),
                subject.getUpdatedAt()
        );
    }
}
