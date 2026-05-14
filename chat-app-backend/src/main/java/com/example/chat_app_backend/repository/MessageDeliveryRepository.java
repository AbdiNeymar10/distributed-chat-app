package com.example.chat_app_backend.repository;

import com.example.chat_app_backend.model.DeliveryStatus;
import com.example.chat_app_backend.model.MessageDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageDeliveryRepository extends JpaRepository<MessageDelivery, UUID> {
    List<MessageDelivery> findByUserIdAndStatusNot(UUID userId, DeliveryStatus status);
}
