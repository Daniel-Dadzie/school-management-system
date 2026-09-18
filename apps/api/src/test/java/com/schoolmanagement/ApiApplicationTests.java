package com.schoolmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Application context integration test.
 *
 * <p>Verifies that the full Spring application context loads successfully
 * against a real PostgreSQL database (provided by Testcontainers).
 *
 * <p>Flyway migrations run on the Testcontainers PostgreSQL container
 * before JPA validation occurs, matching production startup behaviour.
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class ApiApplicationTests {

	@Test
	void contextLoads() {
		// Verifies: Spring context starts, datasource connects,
		// Flyway migrations execute, JPA validates — all without errors.
	}

}
