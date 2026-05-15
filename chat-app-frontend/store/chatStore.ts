import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from './authStore';
import api from '../lib/axios';
import { showNotification } from '../components/FloatingNotification';
import { UserPlus, MessageCircle, X } from 'lucide-react';
import React from 'react';

export interface MessageDto {
  id?: string;
  senderId: string;
  roomId: string;
  content: string;
  timestamp?: string;
  status?: string;
}

export interface MessageReceiptDto {
  messageId: string;
  roomId: string;
  userId: string;
  status: string;
}

export interface TypingDto {
  username: string;
  roomId: string;
  typing: boolean;
}

export interface PresenceDto {
  username: string;
  online: boolean;
}

export interface Room {
  id: string;
  name: string;
  isGroupChat: boolean;
}

interface ChatState {
  stompClient: Client | null;
  connected: boolean;
  messages: Record<string, MessageDto[]>; // roomId -> messages
  typingUsers: Record<string, string[]>; // roomId -> usernames
  onlineUsers: string[];
  userRooms: Room[];
  allRooms: Room[];
  activeRoomId: string | null;
  roomSubscriptions: Record<string, any[]>; // roomId -> subscription objects
  connect: () => void;
  disconnect: () => void;
  sendMessage: (roomId: string, content: string) => void;
  sendTyping: (roomId: string, typing: boolean) => void;
  fetchMessages: (roomId: string) => Promise<void>;
  fetchUserRooms: () => Promise<void>;
  fetchAllRooms: () => Promise<void>;
  createRoom: (name: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  subscribeToRoom: (roomId: string) => void;
  unsubscribeFromRoom: (roomId: string) => void;
  setActiveRoomId: (roomId: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  stompClient: null,
  connected: false,
  messages: {},
  typingUsers: {},
  onlineUsers: [],
  userRooms: [],
  allRooms: [],
  activeRoomId: null,
  roomSubscriptions: {},

  connect: () => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user) return;

    if (get().stompClient?.connected) return;

    const client = new Client({
      // We use SockJS, so we provide webSocketFactory
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      set({ connected: true });
      
      // Subscribe to global online-users
      client.subscribe('/topic/online-users', (message) => {
        if (message.body) {
          const presence: PresenceDto = JSON.parse(message.body);
          const { user } = useAuthStore.getState();
          if (!user) return;
          
          set((state) => {
            const currentOnline = new Set(state.onlineUsers);
            if (presence.online) {
              currentOnline.add(presence.username);
              // Notify when a user joins, if it's not the current user
              if (presence.username !== user.username) {
                showNotification(
                  "User Online", 
                  `${presence.username} has joined the chat`,
                  React.createElement(UserPlus, { className: "w-5 h-5" })
                );
              }
            } else {
              currentOnline.delete(presence.username);
            }
            return { onlineUsers: Array.from(currentOnline) };
          });
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    set({ stompClient: client });
    get().fetchUserRooms();
  },

  disconnect: () => {
    const { stompClient } = get();
    if (stompClient) {
      stompClient.deactivate();
      set({ connected: false, stompClient: null, messages: {}, typingUsers: {} });
    }
  },

  sendMessage: (roomId, content) => {
    const { stompClient, connected } = get();
    const { user } = useAuthStore.getState();
    if (stompClient && connected && user) {
      const chatMessage: MessageDto = {
        senderId: user.username,
        roomId: roomId,
        content: content
      };
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage)
      });
    }
  },

  sendTyping: (roomId, typing) => {
    const { stompClient, connected } = get();
    const { user } = useAuthStore.getState();
    if (stompClient && connected && user) {
      const typingDto: TypingDto = {
        username: user.username,
        roomId: roomId,
        typing: typing
      };
      stompClient.publish({
        destination: '/app/typing',
        body: JSON.stringify(typingDto)
      });
    }
  },

  fetchMessages: async (roomId) => {
    try {
      const response = await api.get(`/messages/${roomId}`);
      const fetchedMessages: MessageDto[] = response.data;
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: fetchedMessages
        }
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  fetchUserRooms: async () => {
    try {
      const response = await api.get('/rooms/user');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ userRooms: data });
      // If activeRoomId is null and we have rooms, set the first one
      if (!get().activeRoomId && data.length > 0) {
        get().setActiveRoomId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch user rooms:', error);
      set({ userRooms: [] });
    }
  },

  fetchAllRooms: async () => {
    try {
      const response = await api.get('/rooms');
      set({ allRooms: Array.isArray(response.data) ? response.data : [] });
    } catch (error) {
      console.error('Failed to fetch all rooms:', error);
      set({ allRooms: [] });
    }
  },

  createRoom: async (name) => {
    try {
      const response = await api.post('/rooms/create', { name });
      const newRoom = response.data;
      await get().fetchUserRooms();
      get().setActiveRoomId(newRoom.id);
      showNotification("Room Created", `Successfully created #${name}`, React.createElement(MessageCircle, { className: "w-5 h-5" }));
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to create room";
      showNotification("Error", msg, React.createElement(X, { className: "w-5 h-5 text-rose-500" }));
    }
  },

  joinRoom: async (roomId) => {
    try {
      const response = await api.post(`/rooms/join/${roomId}`);
      const room = response.data;
      set((state) => {
        const alreadyIn = state.userRooms.some(r => r.id === room.id);
        return {
          userRooms: alreadyIn ? state.userRooms : [...state.userRooms, room]
        };
      });
      get().setActiveRoomId(room.id);
      showNotification("Joined Room", `You are now a member of #${room.name}`, React.createElement(UserPlus, { className: "w-5 h-5" }));
    } catch (error) {
      showNotification("Error", "Failed to join room", React.createElement(X, { className: "w-5 h-5 text-rose-500" }));
    }
  },

  setActiveRoomId: (roomId) => {
    const currentId = get().activeRoomId;
    if (currentId === roomId) return;

    if (currentId) {
      get().unsubscribeFromRoom(currentId);
    }

    set({ activeRoomId: roomId });

    if (roomId) {
      get().subscribeToRoom(roomId);
    }
  },

  subscribeToRoom: (roomId) => {
    const { stompClient, connected } = get();
    const { user } = useAuthStore.getState();
    if (!stompClient || !connected || !user) return;

    // Fetch missed/history messages
    get().fetchMessages(roomId);

    const subs: any[] = [];

    // Subscribe to messages
    const msgSub = stompClient.subscribe(`/topic/room.${roomId}`, (message) => {
      if (message.body) {
        const msg: MessageDto = JSON.parse(message.body);
        set((state) => {
          const currentRoomMsgs = state.messages[roomId] || [];
          // Avoid duplicates if message is already in history
          if (msg.id && currentRoomMsgs.some(m => m.id === msg.id)) {
            return state;
          }
          // Notify if message is from someone else
          if (msg.senderId !== user.username) {
            showNotification(
              `New message in #${roomId}`,
              `${msg.senderId}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
              React.createElement(MessageCircle, { className: "w-5 h-5" })
            );
          }

          return {
            messages: {
              ...state.messages,
              [roomId]: [...currentRoomMsgs, msg]
            }
          };
        });
        // Send read receipt for incoming message
        stompClient.publish({
          destination: '/app/read',
          body: JSON.stringify({ roomId })
        });
      }
    });
    subs.push(msgSub);

    // Send initial read receipt when joining room
    stompClient.publish({
      destination: '/app/read',
      body: JSON.stringify({ roomId })
    });

    // Send delivery receipt to mark anything SENT as DELIVERED
    stompClient.publish({
      destination: '/app/delivered',
      body: JSON.stringify({ roomId })
    });

    const receiptSub = stompClient.subscribe(`/topic/room.${roomId}.receipts`, (message) => {
      if (message.body) {
        const receipt: MessageReceiptDto = JSON.parse(message.body);
        set((state) => {
          const currentRoomMsgs = state.messages[roomId] || [];
          const updatedMsgs = currentRoomMsgs.map(msg => {
            if (msg.id === receipt.messageId) {
              // Only upgrade status if it's "better" (READ > DELIVERED > SENT)
              // For simplicity, we assume we just overwrite if it's from the backend
              return { ...msg, status: receipt.status };
            }
            return msg;
          });
          return {
            messages: {
              ...state.messages,
              [roomId]: updatedMsgs
            }
          };
        });
      }
    });
    subs.push(receiptSub);

    // Subscribe to typing indicators
    const typingSub = stompClient.subscribe(`/topic/room.${roomId}.typing`, (message) => {
      if (message.body) {
        const typingDto: TypingDto = JSON.parse(message.body);
        set((state) => {
          const roomTyping = new Set(state.typingUsers[roomId] || []);
          if (typingDto.typing) {
            roomTyping.add(typingDto.username);
          } else {
            roomTyping.delete(typingDto.username);
          }
          return {
            typingUsers: {
              ...state.typingUsers,
              [roomId]: Array.from(roomTyping)
            }
          };
        });
      }
    });
    subs.push(typingSub);

    set((state) => ({
      roomSubscriptions: {
        ...state.roomSubscriptions,
        [roomId]: subs
      }
    }));
  },

  unsubscribeFromRoom: (roomId) => {
    const { roomSubscriptions } = get();
    const subs = roomSubscriptions[roomId];
    if (subs) {
      subs.forEach(s => s.unsubscribe());
      set((state) => {
        const newRoomSubscriptions = { ...state.roomSubscriptions };
        delete newRoomSubscriptions[roomId];
        return { roomSubscriptions: newRoomSubscriptions };
      });
    }
  }
}));
