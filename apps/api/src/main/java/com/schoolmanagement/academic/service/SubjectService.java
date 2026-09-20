package com.schoolmanagement.academic.service;

import com.schoolmanagement.academic.domain.Subject;
import com.schoolmanagement.academic.dto.SubjectRequest;
import com.schoolmanagement.academic.dto.SubjectResponse;
import com.schoolmanagement.academic.repository.SubjectRepository;
import com.schoolmanagement.academic.repository.TeacherAssignmentRepository;
import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.common.exception.ResourceConflictException;
import com.schoolmanagement.people.domain.Teacher;
import com.schoolmanagement.people.repository.TeacherRepository;
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
        if (principal.getRole() == Role.ADMIN || principal.getRole() == Role.SUPER_ADMIN) {
            return subjectRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        if (principal.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser_Id(principal.getId())
                    .orElseThrow(() -> new IllegalStateException("Teacher profile not found for authenticated user"));

            return teacherAssignmentRepository.findActiveSubjectsByTeacherId(teacher.getId()).stream()
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
