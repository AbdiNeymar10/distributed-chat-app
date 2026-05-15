"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageInput } from "./MessageInput";
import { Menu, Users, Check, CheckCheck, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef, useState } from "react";

const MessageSkeleton = () => (
  <div className="flex animate-pulse space-x-4 mb-6">
    <div className="rounded-full bg-zinc-800 h-10 w-10"></div>
    <div className="flex-1 space-y-4 py-1">
      <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-10 bg-zinc-800 rounded-2xl w-3/4"></div>
      </div>
    </div>
  </div>
);

export function ChatArea({ 
  onOpenSidebar, 
  onOpenUsers, 
  isSidebarOpen, 
  isUsersOpen 
}: { 
  onOpenSidebar: () => void; 
  onOpenUsers: () => void; 
  isSidebarOpen: boolean;
  isUsersOpen: boolean;
}) {
  const { messages, typingUsers, connected, activeRoomId, userRooms } = useChatStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  const activeRoom = userRooms.find(r => r.id === activeRoomId);
  const roomId = activeRoomId || "general";
  
  const roomMessages = messages[roomId] || [];
  const roomTypingUsers = typingUsers[roomId] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset loading when room changes
    setIsLoading(true);
    if (connected && activeRoomId) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [connected, activeRoomId]);

  // Filter out current user from typing indicators
  const otherTypingUsers = roomTypingUsers.filter(u => u !== user?.username);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages, otherTypingUsers]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/80 relative">
      {/* Background glowing orb effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center min-w-0">
          {!isSidebarOpen && (
            <button 
              onClick={onOpenSidebar}
              className="mr-4 p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col min-w-0">
            <h2 className="font-bold text-zinc-100 flex items-center truncate">
              <span className="text-zinc-500 mr-1">#</span> {activeRoom?.name || 'select-a-channel'}
            </h2>
            <span className="text-xs text-zinc-500 font-medium hidden sm:block truncate">
              General discussion for the entire team
            </span>
          </div>
        </div>

        {!isUsersOpen && (
          <button 
            onClick={onOpenUsers}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <Users className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10">
        {/* Welcome message */}
        <div className="pb-8 border-b border-white/5 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-indigo-400">#</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to #{activeRoom?.name || 'channel'}!</h1>
          <p className="text-zinc-400">This is the start of the #{activeRoom?.name || 'channel'} channel.</p>
        </div>

        {roomMessages.length === 0 && (
          <div className="text-zinc-500 italic text-center mt-10">No messages yet. Be the first to say hi!</div>
        )}

        {isLoading ? (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        ) : (
          <AnimatePresence initial={false}>
            {roomMessages.map((msg, idx) => {
              const isMe = msg.senderId === user?.username;
              return (
                <motion.div 
                  key={msg.id || idx}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30,
                    layout: { duration: 0.2 }
                  }}
                  className={`flex group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 ${isMe ? 'ml-3 md:ml-4' : 'mr-3 md:mr-4'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white font-bold text-xs md:text-sm`}>
                      {msg.senderId.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-baseline mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="font-semibold text-zinc-200">{msg.senderId}</span>
                      <span className={`text-xs text-zinc-500 ${isMe ? 'mr-2' : 'ml-2'}`}>{msg.timestamp || 'Just now'}</span>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`px-4 py-3 rounded-2xl transition-shadow duration-200 ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(79,70,229,0.2)]' 
                        : 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm border border-white/5 backdrop-blur-md'
                    }`}>
                      {msg.content}
                    </motion.div>
                    {isMe && msg.status && (
                      <div className="flex justify-end mt-1 text-zinc-500">
                        {msg.status === 'SENT' && <Check className="w-3.5 h-3.5" />}
                        {msg.status === 'DELIVERED' && <CheckCheck className="w-3.5 h-3.5" />}
                        {msg.status === 'READ' && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {otherTypingUsers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              className="flex items-center text-zinc-500 text-sm ml-14 bg-zinc-800/30 w-fit px-3 py-1.5 rounded-full border border-white/5"
            >
              <div className="flex space-x-1 mr-2">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              </div>
              <span className="font-medium">{otherTypingUsers.join(', ')}</span> 
              <span className="ml-1">{otherTypingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="z-10">
        <MessageInput />
      </div>
    </div>
  );
}
