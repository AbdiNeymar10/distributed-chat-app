package com.example.chat_app_backend.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private UUID id;
    private String name;
    private boolean isGroupChat;
}
