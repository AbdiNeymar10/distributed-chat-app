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

import java.time.LocalDateTime;
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

        Room room;
        try {
            UUID roomId = UUID.fromString(messageDto.getRoomId());
            room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        } catch (IllegalArgumentException e) {
            // It's not a UUID, treat it as a name (e.g. "general")
            room = roomRepository.findByName(messageDto.getRoomId()).orElseGet(() -> {
                Room newRoom = Room.builder()
                        .name(messageDto.getRoomId())
                        .isGroupChat(true)
                        .build();
                return roomRepository.save(newRoom);
            });
        }

        // Add sender to room members if not already a member
        if (!room.getMembers().contains(sender)) {
            room.getMembers().add(sender);
            roomRepository.save(room);
        }

        Message message = Message.builder()
                .sender(sender)
                .room(room)
                .content(messageDto.getContent())
                .build();

        Message savedMessage = messageRepository.save(message);

        Set<MessageDelivery> deliveries = new HashSet<>();
        for (User member : room.getMembers()) {
            boolean isSender = member.equals(sender);
            MessageDelivery delivery = MessageDelivery.builder()
                    .message(savedMessage)
                    .user(member)
                    .status(isSender ? DeliveryStatus.READ : DeliveryStatus.SENT)
                    .deliveredAt(isSender ? LocalDateTime.now() : null)
                    .readAt(isSender ? LocalDateTime.now() : null)
                    .build();
            deliveries.add(delivery);
        }
        
        if (!deliveries.isEmpty()) {
            messageDeliveryRepository.saveAll(deliveries);
        }

        return MessageDto.builder()
                .senderId(savedMessage.getSender().getUsername())
                .roomId(messageDto.getRoomId())
                .content(savedMessage.getContent())
                .timestamp(savedMessage.getCreatedAt())
                .build();
    }

    @Transactional
    public void markAsRead(String roomIdStr, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Room room;
        try {
            UUID roomId = UUID.fromString(roomIdStr);
            room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        } catch (IllegalArgumentException e) {
            room = roomRepository.findByName(roomIdStr)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        }

        java.util.List<MessageDelivery> unreadDeliveries = messageDeliveryRepository
                .findByMessageRoomIdAndUserIdAndStatusNot(room.getId(), user.getId(), DeliveryStatus.READ);

        LocalDateTime now = LocalDateTime.now();
        for (MessageDelivery delivery : unreadDeliveries) {
            delivery.setStatus(DeliveryStatus.READ);
            if (delivery.getDeliveredAt() == null) {
                delivery.setDeliveredAt(now);
            }
            delivery.setReadAt(now);
        }

        messageDeliveryRepository.saveAll(unreadDeliveries);
    }
}
