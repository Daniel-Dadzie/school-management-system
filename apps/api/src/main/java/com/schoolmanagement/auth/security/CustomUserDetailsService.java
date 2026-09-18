package com.schoolmanagement.auth.security;

import com.schoolmanagement.auth.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Normalization
        String normalizedIdentifier = identifier != null ? identifier.trim().toLowerCase() : "";

        // Attempt Email lookup first
        return userRepository.findByEmail(normalizedIdentifier)
            // If not found, attempt username lookup
            .or(() -> userRepository.findByUsername(normalizedIdentifier))
            // If neither matches, throw standard exception (caught by AuthenticationProvider to emit BadCredentials)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + normalizedIdentifier));
    }
}

