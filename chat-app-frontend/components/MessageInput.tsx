"use client";

import { motion } from "framer-motion";
import { Send, Paperclip, Smile, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export function MessageInput() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, send the message here
      setMessage("");
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
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message #general..."
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
