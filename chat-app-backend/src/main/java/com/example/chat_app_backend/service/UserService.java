package com.example.chat_app_backend.service;

import com.example.chat_app_backend.dto.UserDto;
import com.example.chat_app_backend.model.User;
import com.example.chat_app_backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
}
