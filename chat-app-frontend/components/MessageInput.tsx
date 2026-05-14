"use client";

import { motion } from "framer-motion";
import { Send, Paperclip, Smile, Image as ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";

export function MessageInput({ roomId = "general" }: { roomId?: string }) {
  const [message, setMessage] = useState("");
  const { sendMessage, sendTyping } = useChatStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      // Send typing = true only on first keystroke
      sendTyping(roomId, true);
    }

    // Set new timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(roomId, false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        sendTyping(roomId, false);
      }
    };
  }, [roomId, sendTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(roomId, message.trim());
      setMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      sendTyping(roomId, false);
    }
  };

  return (
    <div className="p-4 bg-zinc-950/50 backdrop-blur-xl border-t border-white/5">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center bg-zinc-900/80 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)]"
      >
        <button 
          type="button"
          className="pl-4 pr-2 py-3 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder={`Message #${roomId}...`}
          className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-zinc-100 placeholder:text-zinc-600 font-medium"
        />

        <div className="flex items-center pr-2 gap-1">
          <button type="button" className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">
            <Smile className="w-5 h-5" />
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim()}
            className={`ml-2 p-2.5 rounded-xl flex items-center justify-center transition-colors ${
              message.trim() 
                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
