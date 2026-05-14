"use client";

import { useState, useEffect } from "react";
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
    <div className="flex h-full w-full overflow-hidden bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
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
    </div>
  );
}
