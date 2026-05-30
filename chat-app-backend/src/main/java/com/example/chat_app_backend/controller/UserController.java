package com.example.chat_app_backend.controller;

import com.example.chat_app_backend.dto.UserDto;
import com.example.chat_app_backend.dto.ProfileUpdateRequest;
import com.example.chat_app_backend.dto.PasswordUpdateRequest;
import com.example.chat_app_backend.dto.AvatarUpdateRequest;
import com.example.chat_app_backend.dto.SettingsUpdateRequest;
import com.example.chat_app_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/online")
    public ResponseEntity<?> getOnlineUsers(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getOnlineUsernames());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            return ResponseEntity.ok(userService.getUserProfile(principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> updatePassword(@RequestBody PasswordUpdateRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            userService.updatePassword(principal.getName(), request);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody AvatarUpdateRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            return ResponseEntity.ok(userService.updateAvatar(principal.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile/settings")
    public ResponseEntity<?> updateSettings(@RequestBody SettingsUpdateRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            return ResponseEntity.ok(userService.updateSettings(principal.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
