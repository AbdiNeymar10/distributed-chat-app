package com.example.chat_app_backend.rabbitmq;

import com.example.chat_app_backend.config.RabbitMQConfig;
import com.example.chat_app_backend.dto.MessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageListener {

    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.CHAT_QUEUE)
    public void receiveMessage(MessageDto messageDto) {
        // Broadcast to the specific room over WebSocket
        messagingTemplate.convertAndSend("/topic/room." + messageDto.getRoomId(), messageDto);
    }
}
