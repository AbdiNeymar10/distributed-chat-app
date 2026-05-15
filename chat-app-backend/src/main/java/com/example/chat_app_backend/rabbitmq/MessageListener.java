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

    @RabbitListener(queues = RabbitMQConfig.TYPING_QUEUE)
    public void receiveTypingIndicator(com.example.chat_app_backend.dto.TypingDto typingDto) {
        messagingTemplate.convertAndSend("/topic/room." + typingDto.getRoomId() + ".typing", typingDto);
    }

    @RabbitListener(queues = RabbitMQConfig.PRESENCE_QUEUE)
    public void receivePresenceEvent(com.example.chat_app_backend.dto.PresenceDto presenceDto) {
        messagingTemplate.convertAndSend("/topic/online-users", presenceDto);
    }

    @RabbitListener(queues = RabbitMQConfig.RECEIPT_QUEUE)
    public void receiveReceipt(com.example.chat_app_backend.dto.MessageReceiptDto receiptDto) {
        messagingTemplate.convertAndSend("/topic/room." + receiptDto.getRoomId() + ".receipts", receiptDto);
    }
}
