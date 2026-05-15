"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { OnlineUsers } from "./OnlineUsers";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";

export function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const { connected, connect, disconnect, subscribeToRoom } = useChatStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  useEffect(() => {
    if (connected) {
      subscribeToRoom("general");
    }
  }, [connected, subscribeToRoom]);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="chat-layout"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-full w-full overflow-hidden bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30"
      >
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <ChatArea 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenUsers={() => setIsUsersOpen(true)}
        />
        
        <OnlineUsers 
          isOpen={isUsersOpen}
          onClose={() => setIsUsersOpen(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
}
