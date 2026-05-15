package com.example.chat_app_backend.controller;

import com.example.chat_app_backend.dto.RoomDto;
import com.example.chat_app_backend.model.Room;
import com.example.chat_app_backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/create")
    public ResponseEntity<RoomDto> createRoom(@RequestBody Map<String, String> payload, Principal principal) {
        String name = payload.get("name");
        return ResponseEntity.ok(roomService.createRoom(name, principal.getName()));
    }

    @PostMapping("/join/{roomId}")
    public ResponseEntity<RoomDto> joinRoom(@PathVariable UUID roomId, Principal principal) {
        return ResponseEntity.ok(roomService.joinRoom(roomId, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/user")
    public ResponseEntity<List<RoomDto>> getUserRooms(Principal principal) {
        return ResponseEntity.ok(roomService.getUserRooms(principal.getName()));
    }
}
