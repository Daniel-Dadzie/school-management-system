package com.schoolmanagement.academic.service;

import com.schoolmanagement.academic.domain.SchoolClass;
import com.schoolmanagement.academic.dto.SchoolClassRequest;
import com.schoolmanagement.academic.dto.SchoolClassResponse;
import com.schoolmanagement.academic.repository.SchoolClassRepository;
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
        if (principal.getRole() == Role.ADMIN || principal.getRole() == Role.SUPER_ADMIN) {
            return schoolClassRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        if (principal.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser_Id(principal.getId())
                    .orElseThrow(() -> new IllegalStateException("Teacher profile not found for authenticated user"));
            
            return teacherAssignmentRepository.findActiveClassesByTeacherId(teacher.getId()).stream()
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
