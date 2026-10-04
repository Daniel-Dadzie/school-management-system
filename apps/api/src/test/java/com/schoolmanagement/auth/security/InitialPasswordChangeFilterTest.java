package com.schoolmanagement.auth.security;

import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.tenant.repository.SchoolRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.servlet.HandlerExceptionResolver;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InitialPasswordChangeFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void blocksPlatformActionsUntilInitialPasswordChanges() throws Exception {
        User user = forcedPlatformAdmin();
        JwtService jwtService = mock(JwtService.class);
        when(jwtService.extractUsername("token")).thenReturn("owner");
        when(jwtService.isTokenValid("token", user)).thenReturn(true);
        UserDetailsService detailsService = username -> user;
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(
                jwtService, detailsService, mock(HandlerExceptionResolver.class), mock(SchoolRepository.class));
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/platform/schools");
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertEquals(403, response.getStatus());
        assertTrue(response.getContentAsString().contains("Change your initial password"));
        verifyNoInteractions(chain);
    }

    @Test
    void allowsThePasswordChangeEndpointDuringEnforcement() throws Exception {
        User user = forcedPlatformAdmin();
        JwtService jwtService = mock(JwtService.class);
        when(jwtService.extractUsername("token")).thenReturn("owner");
        when(jwtService.isTokenValid("token", user)).thenReturn(true);
        UserDetailsService detailsService = username -> user;
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(
                jwtService, detailsService, mock(HandlerExceptionResolver.class), mock(SchoolRepository.class));
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/change-password");
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    private User forcedPlatformAdmin() {
        User user = new User();
        user.setUsername("owner");
        user.setRole(Role.SUPER_ADMIN);
        user.setPasswordChangeRequired(true);
        return user;
    }
}
