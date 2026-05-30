"use client";

import { motion, Variants } from "framer-motion";
import { Users, X } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useState, useEffect } from "react";

export function OnlineUsers({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { onlineUsers } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const sidebarVariants: Variants = {
    open: { 
      width: "var(--users-width, 256px)",
      x: 0,
      opacity: 1,
      transition: {
        type: "spring", stiffness: 300, damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    },
    closed: { 
      width: 0,
      x: isMobile ? "100%" : 20,
      opacity: isMobile ? 1 : 0,
      transition: {
        type: "spring", stiffness: 300, damping: 30
      }
    },
  };

  const itemVariants: Variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: 10 },
  };

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
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed lg:relative inset-y-0 right-0 z-50 flex flex-col bg-white/90 dark:bg-zinc-900/60 backdrop-blur-2xl border-l border-zinc-200 dark:border-white/5 overflow-hidden"
        style={{ "--users-width": isMobile ? "85vw" : "256px" } as any}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-200 dark:border-white/5 shadow-sm shrink-0">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-zinc-400 mr-3" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">Members</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {categories.map((category) => (
            <div key={category.title}>
              <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                {category.title} — {category.users.length}
              </div>
              <div className="space-y-1">
                {category.users.map((user) => (
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    key={user.name}
                    className="flex w-full items-center px-2 py-2 text-sm text-zinc-500 dark:text-zinc-400 rounded-xl transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 group"
                  >
                    <div className="relative mr-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatar} opacity-80 group-hover:opacity-100 transition-opacity`} />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${user.status}`} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">{user.name}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400">{user.role}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
