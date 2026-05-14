package com.example.chat_app_backend.rabbitmq;

import com.example.chat_app_backend.config.RabbitMQConfig;
import com.example.chat_app_backend.dto.MessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    public void sendMessage(MessageDto messageDto) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "chat.routing." + messageDto.getRoomId(), messageDto);
    }
}
