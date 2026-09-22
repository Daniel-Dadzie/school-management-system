package com.schoolmanagement.academic.service;

import com.schoolmanagement.academic.domain.*;
import com.schoolmanagement.academic.dto.*;
import com.schoolmanagement.academic.repository.*;
import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.common.exception.BusinessValidationException;
import com.schoolmanagement.common.exception.ResourceConflictException;
import com.schoolmanagement.common.exception.ResourceNotFoundException;
import com.schoolmanagement.common.exception.UnauthorizedResourceAccessException;
import com.schoolmanagement.people.domain.Student;
import com.schoolmanagement.people.domain.Teacher;
import com.schoolmanagement.people.repository.StudentRepository;
import com.schoolmanagement.people.repository.TeacherRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final TermRepository termRepository;
    private final SchoolClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final Clock applicationClock;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             TermRepository termRepository,
                             SchoolClassRepository classRepository,
                             SubjectRepository subjectRepository,
                             StudentRepository studentRepository,
                             EnrollmentRepository enrollmentRepository,
                             TeacherRepository teacherRepository,
                             TeacherAssignmentRepository teacherAssignmentRepository,
                             Clock applicationClock) {
        this.attendanceRepository = attendanceRepository;
        this.termRepository = termRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.teacherRepository = teacherRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.applicationClock = applicationClock;
    }

    @Transactional
    public List<AttendanceResponse> bulkSubmit(AttendanceBulkRequest request, User principal) {
        // Step 2: Duplicate student IDs
        Set<UUID> studentIds = new HashSet<>();
        for (AttendanceRecordSubmitRequest req : request.records()) {
            if (!studentIds.add(req.studentId())) {
                throw new BusinessValidationException("Duplicate student IDs found in bulk request");
            }
        }

        // Step 3: Load term
        Term term = termRepository.findById(request.termId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        // Step 4: Term status must be ACTIVE
        if (term.getAcademicYear().getStatus() != AcademicYearStatus.ACTIVE) {
            throw new BusinessValidationException("Term is not active for attendance submission");
        }

        // Step 5: Attendance date within term
        if (request.attendanceDate().isBefore(term.getStartDate()) || request.attendanceDate().isAfter(term.getEndDate())) {
            throw new BusinessValidationException("Attendance date is outside the term boundaries");
        }

        // Step 6: Future date validation
        LocalDate today = LocalDate.now(applicationClock);
        if (request.attendanceDate().isAfter(today)) {
            throw new BusinessValidationException("Attendance cannot be recorded for a future date");
        }

        // Step 6.1: Load class and subject
        SchoolClass schoolClass = classRepository.findById(request.classId())
                .orElseThrow(() -> new ResourceNotFoundException("School Class not found"));

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        // Step 7: Teacher Authorization
        authorizeTeacherForClassAndSubject(principal, schoolClass.getId(), subject.getId(), term);

        // Validate all students
        List<AttendanceRecord> recordsToSave = new ArrayList<>();
        for (AttendanceRecordSubmitRequest recordReq : request.records()) {
            Student student = studentRepository.findById(recordReq.studentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

            boolean hasActiveEnrollment = enrollmentRepository.existsByStudentIdAndSchoolClassIdAndAcademicYearIdAndStatus(
                    student.getId(), schoolClass.getId(), term.getAcademicYear().getId(), EnrollmentStatus.ACTIVE);

            if (!hasActiveEnrollment) {
                throw new BusinessValidationException("Student does not have an active enrollment for this class and academic year");
            }

            AttendanceRecord record = new AttendanceRecord(student, schoolClass, subject, term, request.attendanceDate(), recordReq.status());
            recordsToSave.add(record);
        }

        try {
            List<AttendanceRecord> savedRecords = attendanceRepository.saveAll(recordsToSave);
            // flush to ensure unique constraint exceptions are thrown here
            attendanceRepository.flush();
            return savedRecords.stream().map(this::mapToResponse).collect(Collectors.toList());
        } catch (DataIntegrityViolationException e) {
            String msg = e.getMostSpecificCause().getMessage();
            if (msg != null && msg.contains("uq_attendance_identity")) {
                throw new ResourceConflictException("Attendance records already exist for the specified date");
            }
            throw e;
        }
    }

    @Transactional
    public AttendanceResponse updateAttendanceStatus(UUID id, AttendancePatchRequest request, User principal) {
        AttendanceRecord record = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        Term term = record.getTerm();
        if (term.getAcademicYear().getStatus() != AcademicYearStatus.ACTIVE) {
            throw new BusinessValidationException("Term is not active for attendance modification");
        }

        authorizeTeacherForClassAndSubject(principal, record.getSchoolClass().getId(), record.getSubject().getId(), term);

        record.setStatus(request.status());
        AttendanceRecord saved = attendanceRepository.save(record);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getDailyClassAttendance(UUID termId, UUID classId, UUID subjectId, LocalDate date, User principal) {
        Term term = validateTermClassSubject(termId, classId, subjectId);
        authorizeTeacherForClassAndSubject(principal, classId, subjectId, term);

        return attendanceRepository.findByTermIdAndSchoolClassIdAndSubjectIdAndAttendanceDate(termId, classId, subjectId, date)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getClassSubjectHistory(UUID termId, UUID classId, UUID subjectId, User principal) {
        Term term = validateTermClassSubject(termId, classId, subjectId);
        authorizeTeacherForClassAndSubject(principal, classId, subjectId, term);

        return attendanceRepository.findByTermIdAndSchoolClassIdAndSubjectId(termId, classId, subjectId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentSubjectHistory(UUID termId, UUID studentId, UUID subjectId, User principal) {
        Term term = termRepository.findById(termId).orElseThrow(() -> new ResourceNotFoundException("Term not found"));
        studentRepository.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        subjectRepository.findById(subjectId).orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        if (principal.getRole() == Role.TEACHER) {
            Enrollment enrollment = enrollmentRepository.findByStudentIdAndAcademicYearIdAndStatus(
                    studentId, term.getAcademicYear().getId(), EnrollmentStatus.ACTIVE)
                    .orElseThrow(() -> new BusinessValidationException("Student does not have an active enrollment for the term's academic year"));

            authorizeTeacherForClassAndSubject(principal, enrollment.getSchoolClass().getId(), subjectId, term);
        }

        return attendanceRepository.findByTermIdAndStudentIdAndSubjectId(termId, studentId, subjectId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentTermHistory(UUID termId, UUID studentId, User principal) {
        if (principal.getRole() == Role.TEACHER) {
            throw new UnauthorizedResourceAccessException("Teachers must specify a subject to view student history");
        }

        termRepository.findById(termId).orElseThrow(() -> new ResourceNotFoundException("Term not found"));
        studentRepository.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return attendanceRepository.findByTermIdAndStudentId(termId, studentId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private Term validateTermClassSubject(UUID termId, UUID classId, UUID subjectId) {
        Term term = termRepository.findById(termId).orElseThrow(() -> new ResourceNotFoundException("Term not found"));
        classRepository.findById(classId).orElseThrow(() -> new ResourceNotFoundException("School Class not found"));
        subjectRepository.findById(subjectId).orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        return term;
    }

    private void authorizeTeacherForClassAndSubject(User principal, UUID classId, UUID subjectId, Term term) {
        if (principal.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser_Id(principal.getId())
                    .orElseThrow(() -> new UnauthorizedResourceAccessException("Teacher profile not found for authenticated user"));

            boolean assigned = teacherAssignmentRepository.existsByTeacherIdAndSubjectIdAndSchoolClassIdAndAcademicYearIdAndTermId(
                    teacher.getId(), subjectId, classId, term.getAcademicYear().getId(), term.getId());

            if (!assigned) {
                throw new UnauthorizedResourceAccessException("Teacher is not assigned to this class and subject for the given term");
            }
        }
    }

    private AttendanceResponse mapToResponse(AttendanceRecord record) {
        return new AttendanceResponse(
                record.getId(),
                record.getStudent().getId(),
                record.getSchoolClass().getId(),
                record.getSubject().getId(),
                record.getTerm().getId(),
                record.getAttendanceDate(),
                record.getStatus(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
