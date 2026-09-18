package com.schoolmanagement;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Shared Testcontainers configuration for integration tests.
 *
 * <p>Provides a real PostgreSQL container that is automatically connected
 * to the Spring datasource via {@code @ServiceConnection}. Import this
 * configuration in test classes that require a database:
 *
 * <pre>
 * {@code @SpringBootTest}
 * {@code @Import(TestcontainersConfiguration.class)}
 * class MyIntegrationTest { ... }
 * </pre>
 *
 * <p>The container is started once and shared across all tests in the
 * same Spring application context, keeping test execution fast.
 */
@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfiguration {

    /**
     * PostgreSQL container used for all integration tests.
     *
     * <p>{@code @ServiceConnection} automatically configures:
     * <ul>
     *   <li>{@code spring.datasource.url}</li>
     *   <li>{@code spring.datasource.username}</li>
     *   <li>{@code spring.datasource.password}</li>
     * </ul>
     * No manual datasource URL configuration is needed in {@code application-test.yml}.
     */
    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>("postgres:16-alpine");
    }
}

