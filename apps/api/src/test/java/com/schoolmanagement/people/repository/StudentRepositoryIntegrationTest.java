package com.schoolmanagement.people.repository;

import com.schoolmanagement.people.domain.Student;
import com.schoolmanagement.people.domain.StudentStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class StudentRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private StudentRepository studentRepository;

    @Test
    void saveStudent_WithValidStatuses_Succeeds() {
        Student activeStudent = createBaseStudent("ADM-001");
        activeStudent.setStatus(StudentStatus.ACTIVE);
        Student savedActive = studentRepository.save(activeStudent);
        assertThat(savedActive.getId()).isNotNull();

        Student suspendedStudent = createBaseStudent("ADM-002");
        suspendedStudent.setStatus(StudentStatus.SUSPENDED);
        studentRepository.save(suspendedStudent);

        Student transferredStudent = createBaseStudent("ADM-003");
        transferredStudent.setStatus(StudentStatus.TRANSFERRED);
        studentRepository.save(transferredStudent);

        Student withdrawnStudent = createBaseStudent("ADM-004");
        withdrawnStudent.setStatus(StudentStatus.WITHDRAWN);
        studentRepository.save(withdrawnStudent);
    }

    private Student createBaseStudent(String admissionNumber) {
        Student student = new Student();
        student.setAdmissionNumber(admissionNumber);
        student.setFirstName("Test");
        student.setLastName("Student");
        student.setDateOfBirth(LocalDate.of(2010, 1, 1));
        student.setGender("MALE");
        return student;
    }
}
