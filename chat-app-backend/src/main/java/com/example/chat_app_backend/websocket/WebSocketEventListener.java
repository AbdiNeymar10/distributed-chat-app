package com.example.chat_app_backend.websocket;

import com.example.chat_app_backend.dto.PresenceDto;
import com.example.chat_app_backend.rabbitmq.MessagePublisher;
import com.example.chat_app_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final MessagePublisher messagePublisher;
    private final UserService userService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        if (user != null) {
            String username = user.getName();
            userService.setUserOnlineStatus(username, true);
            
            PresenceDto presenceDto = PresenceDto.builder()
                    .username(username)
                    .online(true)
                    .build();
            messagePublisher.sendPresenceEvent(presenceDto);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        if (user != null) {
            String username = user.getName();
            userService.setUserOnlineStatus(username, false);
            
            PresenceDto presenceDto = PresenceDto.builder()
                    .username(username)
                    .online(false)
                    .build();
            messagePublisher.sendPresenceEvent(presenceDto);
        }
    }
}
