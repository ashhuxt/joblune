package com.joblune.backend.controller;

import com.joblune.backend.dto.auth.AuthDtos.UpdateProfileRequest;
import com.joblune.backend.dto.auth.AuthDtos.UserResponse;
import com.joblune.backend.entity.User;
import com.joblune.backend.repository.CompanyRepository;
import com.joblune.backend.repository.UserRepository;
import com.joblune.backend.entity.Company;
import com.joblune.backend.exception.ApiException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Current authenticated user profile")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        return toResponse(user);
    }

    @PutMapping("/me")
    @Transactional
    public UserResponse updateMe(@AuthenticationPrincipal User user, @Valid @RequestBody UpdateProfileRequest request) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (request.fullName() != null && !request.fullName().isBlank()) {
            managedUser.setFullName(request.fullName().trim());
        }

        if (managedUser.getRole() == com.joblune.backend.entity.Role.JOB_SEEKER) {
            managedUser.setResumeUrl(request.resumeUrl() == null || request.resumeUrl().isBlank() ? null : request.resumeUrl().trim());
        } else if (managedUser.getRole() == com.joblune.backend.entity.Role.EMPLOYER && request.companyName() != null) {
            String companyName = request.companyName().trim();
            if (companyName.isBlank()) {
                throw ApiException.badRequest("companyName cannot be blank");
            }
            Company company = managedUser.getCompany();
            if (company == null) {
                company = companyRepository.save(Company.builder().name(companyName).build());
                managedUser.setCompany(company);
            } else {
                company.setName(companyName);
                companyRepository.save(company);
            }
        }

        User saved = userRepository.save(managedUser);
        return toResponse(saved);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCompany() == null ? null : user.getCompany().getName(),
                user.getPhone(),
                user.getHeadline(),
                user.getResumeUrl()
        );
    }
}
