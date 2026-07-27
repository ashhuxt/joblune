package com.joblune.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping({"/", "/health"})
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Joblune Backend is running!");
    }
}
