package com.karatu.sis.auth.security;

import com.karatu.sis.auth.repository.UserRepository;
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
        // Normalization for email/username
        String normalizedIdentifier = identifier != null ? identifier.trim().toLowerCase() : "";
        
        // Basic E.164 normalization for phone numbers
        String phoneIdentifier = identifier != null ? identifier.replaceAll("[^0-9+]", "") : "";
        if (phoneIdentifier.startsWith("0")) {
            phoneIdentifier = "+233" + phoneIdentifier.substring(1); // Default to Ghana for local numbers
        }

        final String finalPhoneIdentifier = phoneIdentifier;

        // Attempt Email lookup first
        return userRepository.findByEmail(normalizedIdentifier)
            // If not found, attempt username lookup
            .or(() -> userRepository.findByUsername(normalizedIdentifier))
            // If not found, attempt phone number lookup
            .or(() -> userRepository.findByPhoneNumber(finalPhoneIdentifier))
            // If none matches, throw standard exception (caught by AuthenticationProvider to emit BadCredentials)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + normalizedIdentifier));
    }
}

