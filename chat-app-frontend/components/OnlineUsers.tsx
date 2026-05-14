"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

export function OnlineUsers({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { onlineUsers } = useChatStore();

  const categories = [
    {
      title: "Online",
      users: onlineUsers.map((username) => ({
        name: username,
        role: "Member",
        avatar: "from-purple-500 to-indigo-500", // Generic avatar for now
        status: "bg-emerald-500"
      }))
    }
  ];

  return (
    <>
      {/* Mobile Backdrop for right sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Online Users Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-zinc-900/60 backdrop-blur-2xl border-l border-white/5 lg:static lg:translate-x-0"
        style={{ x: "0%" }} // Override framer-motion for desktop via CSS/JS logic in a real app, but we will use conditional rendering in layout or let framer motion handle it
      >
        <div className="flex items-center h-16 px-5 border-b border-white/5 shadow-sm">
          <Users className="w-5 h-5 text-zinc-400 mr-3" />
          <span className="font-semibold text-zinc-100">Members</span>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {categories.map((category) => (
            <div key={category.title}>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                {category.title} — {category.users.length}
              </div>
              <div className="space-y-1">
                {category.users.map((user) => (
                  <button
                    key={user.name}
                    className="flex w-full items-center px-2 py-2 text-sm text-zinc-400 rounded-xl hover:bg-white/5 hover:text-zinc-100 transition-all group"
                  >
                    <div className="relative mr-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatar} opacity-80 group-hover:opacity-100 transition-opacity`} />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${user.status}`} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-zinc-200 group-hover:text-white">{user.name}</span>
                      <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">{user.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
