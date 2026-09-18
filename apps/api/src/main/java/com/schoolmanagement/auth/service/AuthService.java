package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.dto.AuthResponse;
import com.schoolmanagement.auth.dto.LoginRequest;
import com.schoolmanagement.auth.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse authenticate(LoginRequest request) {
        try {
            // Trim and normalize the identifier
            String identifier = request.identifier() != null ? request.identifier().trim().toLowerCase() : "";
            
            // AuthenticationManager uses CustomUserDetailsService which handles email vs username lookup
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            identifier,
                            request.password()
                    )
            );

            User user = (User) authentication.getPrincipal();

            if (!user.isEnabled()) {
                throw new BadCredentialsException("Account is disabled");
            }

            String jwtToken = jwtService.generateToken(user);

            return new AuthResponse(
                    jwtToken,
                    new AuthResponse.UserDto(
                            user.getId(),
                            user.getEmail(),
                            user.getUsername(),
                            user.getRole()
                    )
            );
        } catch (AuthenticationException ex) {
            // Ensure we don't leak existence of the account; always throw standard exception
            throw new BadCredentialsException("Invalid credentials");
        }
    }
}

