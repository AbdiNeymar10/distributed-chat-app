package com.example.chat_app_backend.service;

import com.example.chat_app_backend.dto.MessageDto;
import com.example.chat_app_backend.model.Message;
import com.example.chat_app_backend.model.User;
import com.example.chat_app_backend.repository.MessageRepository;
import com.example.chat_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageDto saveMessage(MessageDto messageDto) {
        User sender = userRepository.findByUsername(messageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = Message.builder()
                .sender(sender)
                .recipientId(Long.valueOf(messageDto.getRecipientId()))
                .content(messageDto.getContent())
                .build();

        Message savedMessage = messageRepository.save(message);

        return MessageDto.builder()
                .senderId(savedMessage.getSender().getUsername())
                .recipientId(String.valueOf(savedMessage.getRecipientId()))
                .content(savedMessage.getContent())
                .timestamp(savedMessage.getCreatedAt())
                .build();
    }
}
