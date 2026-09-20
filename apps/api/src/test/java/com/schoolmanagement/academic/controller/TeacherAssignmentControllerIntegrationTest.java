package com.schoolmanagement.academic.controller;

import com.schoolmanagement.academic.domain.*;
import com.schoolmanagement.academic.repository.*;
import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.repository.UserRepository;
import com.schoolmanagement.people.domain.Teacher;
import com.schoolmanagement.people.repository.TeacherRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class TeacherAssignmentControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private SchoolClassRepository schoolClassRepository;
    @Autowired
    private AcademicYearRepository academicYearRepository;
    @Autowired
    private TermRepository termRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @AfterEach
    void tearDown() {
        teacherAssignmentRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();
        subjectRepository.deleteAll();
        schoolClassRepository.deleteAll();
        termRepository.deleteAll();
        academicYearRepository.deleteAll();
    }

    @Test
    void getMyAssignments_ReturnsOnlyOwnAssignments() throws Exception {
        User teacherUser1 = new User();
        teacherUser1.setEmail("t1@test.com");
        teacherUser1.setUsername("t1");
        teacherUser1.setPasswordHash("hash");
        teacherUser1.setRole(Role.TEACHER);
        teacherUser1 = userRepository.save(teacherUser1);

        Teacher t1 = new Teacher();
        t1.setUser(teacherUser1);
        t1.setStaffNumber("T1");
        t1.setFirstName("J");
        t1.setLastName("D");
        t1 = teacherRepository.save(t1);

        User teacherUser2 = new User();
        teacherUser2.setEmail("t2@test.com");
        teacherUser2.setUsername("t2");
        teacherUser2.setPasswordHash("hash");
        teacherUser2.setRole(Role.TEACHER);
        teacherUser2 = userRepository.save(teacherUser2);

        Teacher t2 = new Teacher();
        t2.setUser(teacherUser2);
        t2.setStaffNumber("T2");
        t2.setFirstName("M");
        t2.setLastName("S");
        t2 = teacherRepository.save(t2);

        Subject sub = new Subject();
        sub.setName("Math");
        sub.setCode("M");
        sub = subjectRepository.save(sub);

        SchoolClass cls = new SchoolClass();
        cls.setName("C1");
        cls.setLevel("L");
        cls = schoolClassRepository.save(cls);

        AcademicYear year = new AcademicYear();
        year.setName("Y1");
        year.setStartDate(LocalDate.now());
        year.setEndDate(LocalDate.now().plusMonths(1));
        year = academicYearRepository.save(year);

        Term term = new Term();
        term.setName("T1");
        term.setAcademicYear(year);
        term.setStartDate(LocalDate.now());
        term.setEndDate(LocalDate.now().plusMonths(1));
        term.setMandatory(true);
        term = termRepository.save(term);

        TeacherAssignment ta1 = new TeacherAssignment();
        ta1.setTeacher(t1);
        ta1.setSubject(sub);
        ta1.setSchoolClass(cls);
        ta1.setAcademicYear(year);
        ta1.setTerm(term);
        teacherAssignmentRepository.save(ta1);

        TeacherAssignment ta2 = new TeacherAssignment();
        ta2.setTeacher(t2);
        ta2.setSubject(sub);
        ta2.setSchoolClass(cls);
        ta2.setAcademicYear(year);
        ta2.setTerm(term);
        teacherAssignmentRepository.save(ta2);

        mockMvc.perform(get("/api/v1/teacher-assignments/me")
                        .with(SecurityMockMvcRequestPostProcessors.user(teacherUser1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].teacherId").value(t1.getId().toString()));
    }
}