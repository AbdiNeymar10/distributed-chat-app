package com.example.chat_app_backend.service;

import com.example.chat_app_backend.dto.UserDto;
import com.example.chat_app_backend.dto.ProfileUpdateRequest;
import com.example.chat_app_backend.dto.PasswordUpdateRequest;
import com.example.chat_app_backend.dto.AvatarUpdateRequest;
import com.example.chat_app_backend.dto.SettingsUpdateRequest;
import com.example.chat_app_backend.model.User;
import com.example.chat_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Transactional
    public void resetAllUsersOffline() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setOnline(false);
        }
        userRepository.saveAll(users);
    }

    @Transactional
    public void setUserOnlineStatus(String username, boolean online) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setOnline(online);
            userRepository.save(user);
        });
    }

    @Transactional(readOnly = true)
    public List<String> getOnlineUsernames() {
        return userRepository.findAll().stream()
                .filter(User::isOnline)
                .map(User::getUsername)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(String currentUsername, ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty() && !request.getUsername().equals(currentUsername)) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Transactional
    public void updatePassword(String username, PasswordUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect existing password");
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserDto updateAvatar(String username, AvatarUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAvatar(request.getAvatar());
        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Transactional
    public UserDto updateSettings(String username, SettingsUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getThemePreference() != null) {
            user.setThemePreference(request.getThemePreference());
        }
        if (request.getNotificationsEnabled() != null) {
            user.setNotificationsEnabled(request.getNotificationsEnabled());
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .online(user.isOnline())
                .avatar(user.getAvatar())
                .themePreference(user.getThemePreference())
                .notificationsEnabled(user.isNotificationsEnabled())
                .build();
    }
}
