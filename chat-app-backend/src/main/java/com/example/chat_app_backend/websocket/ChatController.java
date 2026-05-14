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
            messageService.markAsRead(ackDto.getRoomId(), principal.getName());
        }
    }
}
