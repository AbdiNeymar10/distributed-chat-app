package com.example.chat_app_backend.dto;

import com.example.chat_app_backend.model.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageReceiptDto {
    private String messageId;
    private String roomId;
    private String userId;
    private DeliveryStatus status;
}
