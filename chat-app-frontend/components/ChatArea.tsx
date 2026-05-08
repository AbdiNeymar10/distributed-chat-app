"use client";

import { motion } from "framer-motion";
import { MessageInput } from "./MessageInput";
import { Menu, Users } from "lucide-react";

export function ChatArea({ onOpenSidebar, onOpenUsers }: { onOpenSidebar: () => void; onOpenUsers: () => void }) {
  // Mock messages
  const messages = [
    {
      id: 1,
      user: "Alice",
      avatar: "from-indigo-500 to-purple-600",
      time: "Today at 2:30 PM",
      content: "Hey everyone! How's the new project coming along?",
      isMe: false
    },
    {
      id: 2,
      user: "Bob",
      avatar: "from-rose-400 to-orange-500",
      time: "Today at 2:32 PM",
      content: "It's going great! Just finished the animated sidebar.",
      isMe: false
    },
    {
      id: 3,
      user: "You",
      avatar: "from-fuchsia-500 to-pink-500",
      time: "Today at 2:35 PM",
      content: "That sounds awesome! I'm working on the chat area glassmorphism right now. It looks super futuristic.",
      isMe: true
    },
    {
      id: 4,
      user: "Charlie",
      avatar: "from-blue-500 to-cyan-500",
      time: "Today at 2:38 PM",
      content: "Can't wait to see it. Did you add Framer Motion for the transitions?",
      isMe: false
    },
    {
      id: 5,
      user: "You",
      avatar: "from-fuchsia-500 to-pink-500",
      time: "Today at 2:40 PM",
      content: "Yes! The sidebar slides in beautifully on mobile.",
      isMe: true
    }
  ];

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

        {messages.map((msg, idx) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex group ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 ${msg.isMe ? 'ml-4' : 'mr-4'}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${msg.avatar} shadow-lg`} />
            </div>
            <div className={`flex flex-col max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-baseline mb-1 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-semibold text-zinc-200">{msg.user}</span>
                <span className={`text-xs text-zinc-500 ${msg.isMe ? 'mr-2' : 'ml-2'}`}>{msg.time}</span>
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.isMe 
                  ? 'bg-indigo-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(79,70,229,0.2)]' 
                  : 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm border border-white/5 backdrop-blur-md'
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="z-10">
        <MessageInput />
      </div>
    </div>
  );
}
