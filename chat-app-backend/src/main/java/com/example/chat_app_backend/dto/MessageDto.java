package com.example.chat_app_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {
    private String senderId; // Should be username or UUID string, we can keep as String
    private String roomId;
    private String content;
    private LocalDateTime timestamp;
}
