package com.schoolmanagement.academic.controller;

import tools.jackson.databind.ObjectMapper;
import com.schoolmanagement.academic.domain.*;
import com.schoolmanagement.academic.dto.*;
import com.schoolmanagement.academic.repository.*;
import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.repository.UserRepository;
import com.schoolmanagement.people.domain.Student;
import com.schoolmanagement.people.domain.StudentStatus;
import com.schoolmanagement.people.domain.Teacher;
import com.schoolmanagement.people.repository.StudentRepository;
import com.schoolmanagement.people.repository.TeacherRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class AttendanceControllerIntegrationTest {

    @org.testcontainers.junit.jupiter.Container
    @org.springframework.boot.testcontainers.service.connection.ServiceConnection
    static org.testcontainers.containers.PostgreSQLContainer<?> postgres = new org.testcontainers.containers.PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private TermRepository termRepository;

    @Autowired
    private SchoolClassRepository classRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @Autowired
    private Clock applicationClock;

    private MockMvc mockMvc;

    private User adminUser;
    private User superAdminUser;
    private User teacherUser;
    private User otherTeacherUser;

    private AcademicYear activeYear;
    private AcademicYear completedYear;
    private Term activeTerm;
    private Term completedTerm;
    private SchoolClass schoolClass;
    private Subject subject;

    private Student activeStudent;
    private Student suspendedStudent;
    private Student transferredStudent;
    private Student withdrawnStudent;
    private Student unenrolledStudent;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Cleanup
        attendanceRepository.deleteAll();
        teacherAssignmentRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        classRepository.deleteAll();
        termRepository.deleteAll();
        academicYearRepository.deleteAll();
        studentRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        // Create Users
        adminUser = createUser("admin", Role.ADMIN);
        superAdminUser = createUser("superadmin", Role.SUPER_ADMIN);
        teacherUser = createUser("teacher1", Role.TEACHER);
        otherTeacherUser = createUser("teacher2", Role.TEACHER);

        // Academic Setup
        activeYear = new AcademicYear();
        activeYear.setName("2026/2027");
        activeYear.setStartDate(LocalDate.now(applicationClock).minusDays(30));
        activeYear.setEndDate(LocalDate.now(applicationClock).plusDays(300));
        activeYear.setStatus(AcademicYearStatus.ACTIVE);
        activeYear = academicYearRepository.save(activeYear);

        activeTerm = new Term();
        activeTerm.setAcademicYear(activeYear);
        activeTerm.setName("Term 1");
        activeTerm.setStartDate(LocalDate.now(applicationClock).minusDays(30));
        activeTerm.setEndDate(LocalDate.now(applicationClock).plusDays(60));
        activeTerm = termRepository.save(activeTerm);

        completedYear = new AcademicYear();
        completedYear.setName("2025/2026");
        completedYear.setStartDate(LocalDate.now(applicationClock).minusDays(400));
        completedYear.setEndDate(LocalDate.now(applicationClock).minusDays(50));
        completedYear.setStatus(AcademicYearStatus.COMPLETED);
        completedYear = academicYearRepository.save(completedYear);

        completedTerm = new Term();
        completedTerm.setAcademicYear(completedYear);
        completedTerm.setName("Term 3");
        completedTerm.setStartDate(LocalDate.now(applicationClock).minusDays(100));
        completedTerm.setEndDate(LocalDate.now(applicationClock).minusDays(50));
        completedTerm = termRepository.save(completedTerm);

        schoolClass = new SchoolClass();
        schoolClass.setName("Class 1A");
        schoolClass.setLevel("1");
        schoolClass.setCapacity(30);
        schoolClass = classRepository.save(schoolClass);

        subject = new Subject();
        subject.setName("Mathematics");
        subject.setCode("MATH1");
        subject = subjectRepository.save(subject);

        // Students & Enrollments
        activeStudent = createStudent("Active");
        createEnrollment(activeStudent, activeYear, EnrollmentStatus.ACTIVE);

        suspendedStudent = createStudent("Suspended");
        createEnrollment(suspendedStudent, activeYear, EnrollmentStatus.SUSPENDED);

        transferredStudent = createStudent("Transferred");
        createEnrollment(transferredStudent, activeYear, EnrollmentStatus.TRANSFERRED);

        withdrawnStudent = createStudent("Withdrawn");
        createEnrollment(withdrawnStudent, activeYear, EnrollmentStatus.WITHDRAWN);

        unenrolledStudent = createStudent("Unenrolled");
        // No enrollment for this one

        // Teacher Assignment
        Teacher teacher1 = new Teacher();
        teacher1.setUser(teacherUser);
        teacher1.setFirstName("T1");
        teacher1.setLastName("L1");
        teacher1.setStaffNumber("EMP-1");
        teacher1 = teacherRepository.save(teacher1);

        TeacherAssignment ta1 = new TeacherAssignment();
        ta1.setTeacher(teacher1);
        ta1.setSchoolClass(schoolClass);
        ta1.setSubject(subject);
        ta1.setTerm(activeTerm);
        ta1.setAcademicYear(activeYear);
        ta1.setStatus(AssignmentStatus.ACTIVE);
        teacherAssignmentRepository.save(ta1);

        TeacherAssignment ta2 = new TeacherAssignment();
        ta2.setTeacher(teacher1);
        ta2.setSchoolClass(schoolClass);
        ta2.setSubject(subject);
        ta2.setTerm(completedTerm);
        ta2.setAcademicYear(completedYear);
        ta2.setStatus(AssignmentStatus.ACTIVE);
        teacherAssignmentRepository.save(ta2);
    }

    private User createUser(String username, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPasswordHash("hash");
        user.setRole(role);
        return userRepository.save(user);
    }

    private Student createStudent(String name) {
        Student s = new Student();
        s.setFirstName(name);
        s.setLastName("Student");
        s.setAdmissionNumber("ADM-" + System.nanoTime());
        s.setStatus(StudentStatus.ACTIVE);
        s.setDateOfBirth(LocalDate.of(2010, 1, 1));
        s.setGender("M");
        return studentRepository.save(s);
    }

    private Enrollment createEnrollment(Student s, AcademicYear y, EnrollmentStatus status) {
        Enrollment e = new Enrollment();
        e.setStudent(s);
        e.setAcademicYear(y);
        e.setSchoolClass(schoolClass);
        e.setStatus(status);
        e.setEnrolledAt(java.time.LocalDateTime.now(applicationClock).minusDays(30));
        return enrollmentRepository.save(e);
    }


    // -------------------------------------------------------------------------
    // A. POST success & POST authorization
    // -------------------------------------------------------------------------
    @Test
    void post_Admin_Returns201() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void post_SuperAdmin_Returns201() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(superAdminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void post_TeacherWithAssignment_Returns201() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(teacherUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void post_TeacherWithoutAssignment_Returns403() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(otherTeacherUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void post_Unauthenticated_Returns401() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------------------
    // C. POST term/date validation
    // -------------------------------------------------------------------------
    @Test
    void post_InactiveTerm_Returns400() throws Exception {
        LocalDate date = completedTerm.getStartDate();
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                completedTerm.getId(), schoolClass.getId(), subject.getId(), date,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_DateBeforeTermStart_Returns400() throws Exception {
        LocalDate date = activeTerm.getStartDate().minusDays(1);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), date,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_DateAfterTermEnd_Returns400() throws Exception {
        LocalDate date = activeTerm.getEndDate().plusDays(1);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), date,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_FutureDate_Returns400() throws Exception {
        LocalDate date = LocalDate.now(applicationClock).plusDays(1);
        if (date.isAfter(activeTerm.getEndDate())) {
            activeTerm.setEndDate(date.plusDays(10));
            termRepository.save(activeTerm);
        }

        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), date,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // -------------------------------------------------------------------------
    // D. POST enrollment validation
    // -------------------------------------------------------------------------
    @Test
    void post_SuspendedEnrollment_Returns400() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(suspendedStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_TransferredEnrollment_Returns400() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(transferredStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_WithdrawnEnrollment_Returns400() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(withdrawnStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_UnenrolledStudent_Returns400() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(unenrolledStudent.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // -------------------------------------------------------------------------
    // E. POST payload validation
    // -------------------------------------------------------------------------
    @Test
    void post_EmptyRecords_Returns400() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of()
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_DuplicateStudentIds_Returns400_ZeroPersisted() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(
                        new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT),
                        new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.ABSENT)
                )
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertEquals(0, attendanceRepository.count());
    }

    // -------------------------------------------------------------------------
    // F. POST duplicate behavior
    // -------------------------------------------------------------------------
    @Test
    void post_ExistingRecord_Returns409() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT))
        );

        // First succeeds
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second fails with 409
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());

        assertEquals(1, attendanceRepository.count());
    }

    // -------------------------------------------------------------------------
    // G. BULK ATOMICITY
    // -------------------------------------------------------------------------
    @Test
    void post_PartialFailure_Returns400_ZeroPersisted() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceBulkRequest request = new AttendanceBulkRequest(
                activeTerm.getId(), schoolClass.getId(), subject.getId(), today,
                List.of(
                        new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT),
                        new AttendanceRecordSubmitRequest(suspendedStudent.getId(), AttendanceStatus.PRESENT)
                )
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertEquals(0, attendanceRepository.count());
    }

    // -------------------------------------------------------------------------
    // H. PATCH TESTS
    // -------------------------------------------------------------------------
    @Test
    void patch_Admin_Returns200() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, activeTerm, today, AttendanceStatus.PRESENT);
        record = attendanceRepository.save(record);

        AttendancePatchRequest request = new AttendancePatchRequest(AttendanceStatus.ABSENT);

        mockMvc.perform(patch("/api/v1/attendance/" + record.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ABSENT"));
    }

    @Test
    void patch_TeacherWithAssignment_Returns200() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, activeTerm, today, AttendanceStatus.PRESENT);
        record = attendanceRepository.save(record);

        AttendancePatchRequest request = new AttendancePatchRequest(AttendanceStatus.ABSENT);

        mockMvc.perform(patch("/api/v1/attendance/" + record.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(teacherUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void patch_TeacherWithoutAssignment_Returns403() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, activeTerm, today, AttendanceStatus.PRESENT);
        record = attendanceRepository.save(record);

        AttendancePatchRequest request = new AttendancePatchRequest(AttendanceStatus.ABSENT);

        mockMvc.perform(patch("/api/v1/attendance/" + record.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(otherTeacherUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void patch_InactiveTerm_Returns400() throws Exception {
        LocalDate date = completedTerm.getStartDate();
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, completedTerm, date, AttendanceStatus.PRESENT);
        record = attendanceRepository.save(record);

        AttendancePatchRequest request = new AttendancePatchRequest(AttendanceStatus.ABSENT);

        mockMvc.perform(patch("/api/v1/attendance/" + record.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void post_MissingTerm_Returns404() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecordSubmitRequest recordRequest = new AttendanceRecordSubmitRequest(activeStudent.getId(), AttendanceStatus.PRESENT);
        AttendanceBulkRequest bulkRequest = new AttendanceBulkRequest(java.util.UUID.randomUUID(), schoolClass.getId(), subject.getId(), today, List.of(recordRequest));

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void post_MissingStudent_Returns404() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecordSubmitRequest recordRequest = new AttendanceRecordSubmitRequest(java.util.UUID.randomUUID(), AttendanceStatus.PRESENT);
        AttendanceBulkRequest bulkRequest = new AttendanceBulkRequest(activeTerm.getId(), schoolClass.getId(), subject.getId(), today, List.of(recordRequest));

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void patch_RecordNotFound_Returns404() throws Exception {
        AttendancePatchRequest request = new AttendancePatchRequest(AttendanceStatus.ABSENT);

        mockMvc.perform(patch("/api/v1/attendance/" + java.util.UUID.randomUUID())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void patch_Unauthenticated_Returns401() throws Exception {
        AttendancePatchRequest request = new AttendancePatchRequest(AttendanceStatus.ABSENT);

        mockMvc.perform(patch("/api/v1/attendance/" + java.util.UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void get_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/attendance")
                        .param("termId", activeTerm.getId().toString())
                        .param("classId", schoolClass.getId().toString())
                        .param("subjectId", subject.getId().toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void get_MissingTerm_Returns404() throws Exception {
        mockMvc.perform(get("/api/v1/attendance")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser))
                        .param("termId", java.util.UUID.randomUUID().toString())
                        .param("classId", schoolClass.getId().toString())
                        .param("subjectId", subject.getId().toString()))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------------------
    // I. GET TESTS
    // -------------------------------------------------------------------------
    @Test
    void get_DailyAttendance_Returns200() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, activeTerm, today, AttendanceStatus.PRESENT);
        attendanceRepository.save(record);

        mockMvc.perform(get("/api/v1/attendance")
                        .param("termId", activeTerm.getId().toString())
                        .param("classId", schoolClass.getId().toString())
                        .param("subjectId", subject.getId().toString())
                        .param("date", today.toString())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void get_ClassSubjectHistory_Returns200() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, activeTerm, today, AttendanceStatus.PRESENT);
        attendanceRepository.save(record);

        mockMvc.perform(get("/api/v1/attendance")
                        .param("termId", activeTerm.getId().toString())
                        .param("classId", schoolClass.getId().toString())
                        .param("subjectId", subject.getId().toString())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void get_StudentTermHistory_Returns200() throws Exception {
        LocalDate today = LocalDate.now(applicationClock);
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, activeTerm, today, AttendanceStatus.PRESENT);
        attendanceRepository.save(record);

        mockMvc.perform(get("/api/v1/attendance")
                        .param("termId", activeTerm.getId().toString())
                        .param("studentId", activeStudent.getId().toString())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void get_TeacherStudentTermHistory_WithoutSubject_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance")
                        .param("termId", activeTerm.getId().toString())
                        .param("studentId", activeStudent.getId().toString())
                        .with(SecurityMockMvcRequestPostProcessors.user(teacherUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    void get_UnsupportedFilters_Returns400() throws Exception {
        mockMvc.perform(get("/api/v1/attendance")
                        .param("termId", activeTerm.getId().toString())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void get_HistoricalReads_Returns200() throws Exception {
        LocalDate date = completedTerm.getStartDate();
        AttendanceRecord record = new AttendanceRecord(activeStudent, schoolClass, subject, completedTerm, date, AttendanceStatus.PRESENT);
        attendanceRepository.save(record);

        mockMvc.perform(get("/api/v1/attendance")
                        .param("termId", completedTerm.getId().toString())
                        .param("classId", schoolClass.getId().toString())
                        .param("subjectId", subject.getId().toString())
                        .param("date", date.toString())
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
