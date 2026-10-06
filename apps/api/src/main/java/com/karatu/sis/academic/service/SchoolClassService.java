package com.karatu.sis.academic.service;

import com.karatu.sis.tenant.TenantContext;

import com.karatu.sis.academic.domain.SchoolClass;
import com.karatu.sis.academic.dto.SchoolClassRequest;
import com.karatu.sis.academic.dto.SchoolClassResponse;
import com.karatu.sis.academic.repository.SchoolClassRepository;
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
public class SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final TeacherRepository teacherRepository;

    public SchoolClassService(SchoolClassRepository schoolClassRepository, 
                              TeacherAssignmentRepository teacherAssignmentRepository,
                              TeacherRepository teacherRepository) {
        this.schoolClassRepository = schoolClassRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.teacherRepository = teacherRepository;
    }

    @Transactional(readOnly = true)
    public List<SchoolClassResponse> getClasses(User principal) {
        if (principal.getRole() == Role.ADMIN) {
            return schoolClassRepository.findAllBySchoolId(TenantContext.requireSchoolId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        if (principal.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser_IdAndSchoolId(principal.getId(), TenantContext.requireSchoolId())
                    .orElseThrow(() -> new IllegalStateException("Teacher profile not found for authenticated user"));
            
            return teacherAssignmentRepository.findActiveClassesByTeacherIdAndSchoolId(teacher.getId(), TenantContext.requireSchoolId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return List.of(); // Empty for others if they somehow get in, though they shouldn't by Matrix
    }

    @Transactional
    public SchoolClassResponse createClass(SchoolClassRequest request) {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(request.name().trim());
        schoolClass.setLevel(request.level().trim());
        if (request.capacity() != null) {
            schoolClass.setCapacity(request.capacity());
        }

        try {
            SchoolClass saved = schoolClassRepository.save(schoolClass);
            return mapToResponse(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Class with this name already exists");
        }
    }

    private SchoolClassResponse mapToResponse(SchoolClass schoolClass) {
        return new SchoolClassResponse(
                schoolClass.getId(),
                schoolClass.getName(),
                schoolClass.getLevel(),
                schoolClass.getCapacity(),
                schoolClass.getCreatedAt(),
                schoolClass.getUpdatedAt()
        );
    }
}
