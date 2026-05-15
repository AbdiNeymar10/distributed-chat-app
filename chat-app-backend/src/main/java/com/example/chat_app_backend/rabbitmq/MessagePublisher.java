package com.example.chat_app_backend.rabbitmq;

import com.example.chat_app_backend.config.RabbitMQConfig;
import com.example.chat_app_backend.dto.MessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessagePostProcessor;

@Service
@RequiredArgsConstructor
public class MessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    private final MessagePostProcessor persistentPostProcessor = message -> {
        message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
        return message;
    };

    public void sendMessage(MessageDto messageDto) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "chat.routing." + messageDto.getRoomId(), messageDto, persistentPostProcessor);
    }

    public void sendTypingIndicator(com.example.chat_app_backend.dto.TypingDto typingDto) {
        // Typing indicators are transient by nature, so they don't necessarily need persistence, but we apply it to fulfill requirements
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "typing.routing." + typingDto.getRoomId(), typingDto, persistentPostProcessor);
    }

    public void sendPresenceEvent(com.example.chat_app_backend.dto.PresenceDto presenceDto) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "presence.routing.all", presenceDto, persistentPostProcessor);
    }

    public void sendReceipt(com.example.chat_app_backend.dto.MessageReceiptDto receiptDto) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "receipt.routing." + receiptDto.getRoomId(), receiptDto, persistentPostProcessor);
    }
}
