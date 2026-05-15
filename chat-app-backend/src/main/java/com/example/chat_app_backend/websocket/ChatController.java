package com.example.chat_app_backend.websocket;

import com.example.chat_app_backend.dto.MessageDto;
import com.example.chat_app_backend.rabbitmq.MessagePublisher;
import com.example.chat_app_backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final MessagePublisher messagePublisher;

    @MessageMapping("/chat")
    public void processMessage(@Payload MessageDto messageDto) {
        messageDto.setTimestamp(LocalDateTime.now());
        
        // Save message to database
        MessageDto savedMessage = messageService.saveMessage(messageDto);

        // Publish to RabbitMQ exchange for distributed routing
        messagePublisher.sendMessage(savedMessage);
    }

    @MessageMapping("/typing")
    public void processTypingIndicator(@Payload com.example.chat_app_backend.dto.TypingDto typingDto) {
        messagePublisher.sendTypingIndicator(typingDto);
    }

    @MessageMapping("/read")
    public void processReadReceipt(@Payload com.example.chat_app_backend.dto.MessageAckDto ackDto, java.security.Principal principal) {
        if (principal != null) {
            java.util.List<com.example.chat_app_backend.model.MessageDelivery> deliveries = messageService.markAsRead(ackDto.getRoomId(), principal.getName());
            for (com.example.chat_app_backend.model.MessageDelivery delivery : deliveries) {
                com.example.chat_app_backend.dto.MessageReceiptDto receiptDto = com.example.chat_app_backend.dto.MessageReceiptDto.builder()
                        .messageId(delivery.getMessage().getId().toString())
                        .roomId(ackDto.getRoomId())
                        .userId(delivery.getUser().getId().toString())
                        .status(com.example.chat_app_backend.model.DeliveryStatus.READ)
                        .build();
                messagePublisher.sendReceipt(receiptDto);
            }
        }
    }

    @MessageMapping("/delivered")
    public void processDeliveryReceipt(@Payload com.example.chat_app_backend.dto.MessageAckDto ackDto, java.security.Principal principal) {
        if (principal != null) {
            java.util.List<com.example.chat_app_backend.model.MessageDelivery> deliveries = messageService.markAsDelivered(ackDto.getRoomId(), principal.getName());
            for (com.example.chat_app_backend.model.MessageDelivery delivery : deliveries) {
                com.example.chat_app_backend.dto.MessageReceiptDto receiptDto = com.example.chat_app_backend.dto.MessageReceiptDto.builder()
                        .messageId(delivery.getMessage().getId().toString())
                        .roomId(ackDto.getRoomId())
                        .userId(delivery.getUser().getId().toString())
                        .status(com.example.chat_app_backend.model.DeliveryStatus.DELIVERED)
                        .build();
                messagePublisher.sendReceipt(receiptDto);
            }
        }
    }
}
