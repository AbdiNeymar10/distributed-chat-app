package com.example.chat_app_backend.service;

import com.example.chat_app_backend.dto.MessageDto;
import com.example.chat_app_backend.model.DeliveryStatus;
import com.example.chat_app_backend.model.Message;
import com.example.chat_app_backend.model.MessageDelivery;
import com.example.chat_app_backend.model.Room;
import com.example.chat_app_backend.model.User;
import com.example.chat_app_backend.repository.MessageDeliveryRepository;
import com.example.chat_app_backend.repository.MessageRepository;
import com.example.chat_app_backend.repository.RoomRepository;
import com.example.chat_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Set;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final MessageDeliveryRepository messageDeliveryRepository;

    @Transactional
    public MessageDto saveMessage(MessageDto messageDto) {
        User sender = userRepository.findByUsername(messageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Room room = roomRepository.findById(UUID.fromString(messageDto.getRoomId()))
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Message message = Message.builder()
                .sender(sender)
                .room(room)
                .content(messageDto.getContent())
                .build();

        Message savedMessage = messageRepository.save(message);

        Set<MessageDelivery> deliveries = new HashSet<>();
        for (User member : room.getMembers()) {
            MessageDelivery delivery = MessageDelivery.builder()
                    .message(savedMessage)
                    .user(member)
                    .status(DeliveryStatus.SENT)
                    .build();
            deliveries.add(delivery);
        }
        
        if (!deliveries.isEmpty()) {
            messageDeliveryRepository.saveAll(deliveries);
        }

        return MessageDto.builder()
                .senderId(savedMessage.getSender().getUsername())
                .roomId(savedMessage.getRoom().getId().toString())
                .content(savedMessage.getContent())
                .timestamp(savedMessage.getCreatedAt())
                .build();
    }
}
