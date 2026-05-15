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
                .id(savedMessage.getId().toString())
                .senderId(savedMessage.getSender().getUsername())
                .roomId(messageDto.getRoomId())
                .content(savedMessage.getContent())
                .timestamp(savedMessage.getCreatedAt())
                .status(DeliveryStatus.SENT.name())
                .build();
    }

    @Transactional
    public java.util.List<MessageDelivery> markAsRead(String roomIdStr, String username) {
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

        return messageDeliveryRepository.saveAll(unreadDeliveries);
    }

    @Transactional
    public java.util.List<MessageDelivery> markAsDelivered(String roomIdStr, String username) {
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

        java.util.List<MessageDelivery> undelivered = messageDeliveryRepository
                .findByMessageRoomIdAndUserIdAndStatusNot(room.getId(), user.getId(), DeliveryStatus.READ);
        
        java.util.List<MessageDelivery> toUpdate = new java.util.ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (MessageDelivery delivery : undelivered) {
            if (delivery.getStatus() == DeliveryStatus.SENT) {
                delivery.setStatus(DeliveryStatus.DELIVERED);
                delivery.setDeliveredAt(now);
                toUpdate.add(delivery);
            }
        }

        return messageDeliveryRepository.saveAll(toUpdate);
    }

    @Transactional(readOnly = true)
    public java.util.List<MessageDto> getRoomMessages(String roomIdStr, String username) {
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

        java.util.List<Message> messages = messageRepository.findTop50ByRoomIdOrderByCreatedAtDesc(room.getId());
        java.util.Collections.reverse(messages);

        return messages.stream().map(message -> {
            // Find status for the requesting user
            String status = DeliveryStatus.SENT.name();
            if (message.getSender().equals(user)) {
                // If I am the sender, I should see if it was delivered/read by anyone?
                // For a group chat, we can consider it read if ALL members read it, 
                // but for simplicity we can just return SENT unless we aggregate.
                // Let's just return SENT for now.
            } else {
                // Find delivery for the requesting user
                for (MessageDelivery delivery : message.getDeliveries()) {
                    if (delivery.getUser().equals(user)) {
                        status = delivery.getStatus().name();
                        break;
                    }
                }
            }

            return MessageDto.builder()
                    .id(message.getId().toString())
                    .senderId(message.getSender().getUsername())
                    .roomId(roomIdStr)
                    .content(message.getContent())
                    .timestamp(message.getCreatedAt())
                    .status(status)
                    .build();
        }).toList();
    }
}
