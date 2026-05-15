package com.example.chat_app_backend.controller;

import com.example.chat_app_backend.dto.MessageDto;
import com.example.chat_app_backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class ChatRestController {

    private final MessageService messageService;

    @GetMapping("/{roomId}")
    public ResponseEntity<List<MessageDto>> getRoomMessages(@PathVariable String roomId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<MessageDto> messages = messageService.getRoomMessages(roomId, principal.getName());
        return ResponseEntity.ok(messages);
    }
}
