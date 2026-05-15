package com.example.chat_app_backend.service;

import com.example.chat_app_backend.dto.RoomDto;
import com.example.chat_app_backend.model.Room;
import com.example.chat_app_backend.model.User;
import com.example.chat_app_backend.repository.RoomRepository;
import com.example.chat_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional
    public RoomDto createRoom(String name, String username) {
        if (roomRepository.findByName(name).isPresent()) {
            throw new RuntimeException("Room already exists");
        }

        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Room room = Room.builder()
                .name(name)
                .isGroupChat(true)
                .build();
        
        room.getMembers().add(creator);
        Room saved = roomRepository.save(room);
        return mapToDto(saved);
    }

    @Transactional
    public RoomDto joinRoom(UUID roomId, String username) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!room.getMembers().contains(user)) {
            room.getMembers().add(user);
            room = roomRepository.save(room);
        }
        return mapToDto(room);
    }

    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<RoomDto> getUserRooms(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Auto-join general room if not already a member
        roomRepository.findByName("general").ifPresent(general -> {
            if (!general.getMembers().contains(user)) {
                general.getMembers().add(user);
                roomRepository.save(general);
            }
        });

        return roomRepository.findAllByMembersUsername(username).stream()
                .map(this::mapToDto)
                .toList();
    }

    private RoomDto mapToDto(Room room) {
        return RoomDto.builder()
                .id(room.getId())
                .name(room.getName())
                .isGroupChat(room.isGroupChat())
                .build();
    }

    @Bean
    public CommandLineRunner initDefaultRooms(RoomRepository roomRepository) {
        return args -> {
            if (roomRepository.findByName("general").isEmpty()) {
                Room general = Room.builder()
                        .name("general")
                        .isGroupChat(true)
                        .build();
                roomRepository.save(general);
                System.out.println("Created default 'general' room");
            }
        };
    }
}
