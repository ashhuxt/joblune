package com.joblune.backend.dto.auth;

import com.joblune.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @NotNull Role role,
            String companyName // required if role == EMPLOYER
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record RefreshRequest(
            @NotBlank String refreshToken
    ) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            UserSummary user
    ) {
        public AuthResponse(String accessToken, String refreshToken, UserSummary user) {
            this(accessToken, refreshToken, "Bearer", user);
        }
    }

    public record UserSummary(
            java.util.UUID id,
            String fullName,
            String email,
            Role role
    ) {}

    public record UserResponse(
            java.util.UUID id,
            String fullName,
            String email,
            Role role,
            String companyName,
            String phone,
            String headline,
            String resumeUrl
    ) {}

    public record UpdateProfileRequest(
            String fullName,
            String resumeUrl,
            String companyName
    ) {}
}
