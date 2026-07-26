package com.joblune.backend.service;

import com.joblune.backend.dto.auth.AuthDtos.*;
import com.joblune.backend.entity.Company;
import com.joblune.backend.entity.Role;
import com.joblune.backend.entity.User;
import com.joblune.backend.exception.ApiException;
import com.joblune.backend.repository.CompanyRepository;
import com.joblune.backend.repository.UserRepository;
import com.joblune.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("An account with this email already exists");
        }

        if (request.role() == Role.ADMIN) {
            throw ApiException.forbidden("Cannot self-register as ADMIN");
        }

        User.UserBuilder userBuilder = User.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .enabled(true);

        if (request.role() == Role.EMPLOYER) {
            String companyName = request.companyName() == null ? null : request.companyName().trim();
            if (companyName == null || companyName.isBlank()) {
                throw ApiException.badRequest("companyName is required when registering as EMPLOYER or RECRUITER");
            }
            Company company = companyRepository.save(
                    Company.builder().name(companyName).build()
            );
            userBuilder.company(company);
        }

        User saved = userRepository.save(userBuilder.build());

        String accessToken = jwtService.generateAccessToken(saved);
        String refreshToken = jwtService.generateRefreshToken(saved);

        return new AuthResponse(accessToken, refreshToken, toSummary(saved));
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken, toSummary(user));
    }

    public AuthResponse refresh(RefreshRequest request) {
        String email = jwtService.extractUsername(request.refreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));

        if (!jwtService.isTokenValid(request.refreshToken(), user)) {
            throw ApiException.unauthorized("Refresh token expired or invalid");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(newAccessToken, newRefreshToken, toSummary(user));
    }

    private UserSummary toSummary(User user) {
        return new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }
}
