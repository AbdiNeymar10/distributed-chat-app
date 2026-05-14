"use client";

import { motion } from "framer-motion";
import { MessageInput } from "./MessageInput";
import { Menu, Users } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";

export function ChatArea({ onOpenSidebar, onOpenUsers, roomId = "general" }: { onOpenSidebar: () => void; onOpenUsers: () => void; roomId?: string }) {
  const { messages, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const roomMessages = messages[roomId] || [];
  const roomTypingUsers = typingUsers[roomId] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="flex items-center">
          <button 
            onClick={onOpenSidebar}
            className="mr-4 p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="font-bold text-zinc-100 flex items-center">
              <span className="text-zinc-500 mr-1">#</span> general
            </h2>
            <span className="text-xs text-zinc-500 font-medium hidden sm:block">
              General discussion for the entire team
            </span>
          </div>
        </div>

        <button 
          onClick={onOpenUsers}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10">
        {/* Welcome message */}
        <div className="pb-8 border-b border-white/5 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-indigo-400">#</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to #general!</h1>
          <p className="text-zinc-400">This is the start of the #general channel.</p>
        </div>

        {roomMessages.length === 0 && (
          <div className="text-zinc-500 italic text-center mt-10">No messages yet. Be the first to say hi!</div>
        )}

        {roomMessages.map((msg, idx) => {
          const isMe = msg.senderId === user?.username;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 ${isMe ? 'ml-4' : 'mr-4'}`}>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {msg.senderId.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-baseline mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="font-semibold text-zinc-200">{msg.senderId}</span>
                  <span className={`text-xs text-zinc-500 ${isMe ? 'mr-2' : 'ml-2'}`}>{msg.timestamp || 'Just now'}</span>
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(79,70,229,0.2)]' 
                    : 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm border border-white/5 backdrop-blur-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        {otherTypingUsers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-zinc-500 text-sm ml-14"
          >
            <div className="flex space-x-1 mr-2">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
            </div>
            {otherTypingUsers.join(', ')} {otherTypingUsers.length === 1 ? 'is' : 'are'} typing...
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="z-10">
        <MessageInput />
      </div>
    </div>
  );
}
