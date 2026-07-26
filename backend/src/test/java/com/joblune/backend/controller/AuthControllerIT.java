package com.joblune.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.joblune.backend.dto.auth.AuthDtos.LoginRequest;
import com.joblune.backend.dto.auth.AuthDtos.RegisterRequest;
import com.joblune.backend.entity.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void me_returnsAuthenticatedUserProfile() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Profile Employer", "profile@joblune.com", "password123", Role.EMPLOYER, "Profile Corp"
        );

        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email", is("profile@joblune.com")))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String accessToken = objectMapper.readTree(registerResponse).path("accessToken").asText();

        mockMvc.perform(get("/api/users/me")
                        .header(AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("profile@joblune.com")))
                .andExpect(jsonPath("$.fullName", is("Profile Employer")))
                .andExpect(jsonPath("$.role", is("EMPLOYER")))
                .andExpect(jsonPath("$.companyName", is("Profile Corp")));
    }

    @Test
    void me_rejectsUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_thenLogin_succeeds() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Test Seeker", "seeker@joblune.com", "password123", Role.JOB_SEEKER, null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("seeker@joblune.com")));

        LoginRequest loginRequest = new LoginRequest("seeker@joblune.com", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()));
    }

    @Test
    void register_rejectsDuplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Dup User", "dup@joblune.com", "password123", Role.JOB_SEEKER, null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void register_rejectsEmployerWithoutCompanyName() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Employer No Company", "emp@joblune.com", "password123", Role.EMPLOYER, null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_rejectsWrongPassword() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Wrong Pass", "wrongpass@joblune.com", "password123", Role.JOB_SEEKER, null
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        LoginRequest badLogin = new LoginRequest("wrongpass@joblune.com", "wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_acceptsRecruiterAliasAndMapsToEmployer() throws Exception {
        String payload = """
                {
                  "fullName": "Recruiter One",
                  "email": "recruiter1@joblune.com",
                  "password": "password123",
                  "role": "RECRUITER",
                  "companyName": "Recruiter Corp"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email", is("recruiter1@joblune.com")))
                .andExpect(jsonPath("$.user.role", is("EMPLOYER")));
    }

    @Test
    void register_acceptsRoleRecruiterAliasAndMapsToEmployer() throws Exception {
        String payload = """
                {
                  "fullName": "Recruiter Two",
                  "email": "recruiter2@joblune.com",
                  "password": "password123",
                  "role": "ROLE_RECRUITER",
                  "companyName": "Recruiter Two Corp"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email", is("recruiter2@joblune.com")))
                .andExpect(jsonPath("$.user.role", is("EMPLOYER")));
    }
}
