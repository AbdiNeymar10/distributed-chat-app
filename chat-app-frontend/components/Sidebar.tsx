"use client";

import { motion, Variants } from "framer-motion";
import { MessageSquare, Hash, Settings, Plus, X, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuthStore();
  // Use  media query to handle initial state, but Framer Motion deals with it well
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants: Variants = {
    open: { 
      width: "var(--sidebar-width, 288px)",
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
      x: isMobile ? "-100%" : -20,
      opacity: isMobile ? 1 : 0,
      transition: {
        type: "spring", stiffness: 300, damping: 30
      }
    },
  };

  const itemVariants: Variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -10 },
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed md:relative inset-y-0 left-0 z-50 flex flex-col bg-zinc-900/60 backdrop-blur-2xl border-r border-white/5 overflow-hidden"
        style={{ "--sidebar-width": isMobile ? "85vw" : "288px" } as any}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5 shadow-sm shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Nexus Chat
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-8">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-3">
              Channels
            </div>
            <div className="space-y-1">
              {['general', 'random', 'tech-talk', 'memes'].map((channel, i) => (
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  key={channel}
                  className={`flex w-full items-center px-3 py-2 text-sm rounded-xl transition-colors group ${i === 0 ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100'}`}
                >
                  <Hash className={`w-4 h-4 mr-3 ${i === 0 ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  {channel}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-3">
              <span>Direct Messages</span>
              <Plus className="w-4 h-4 cursor-pointer hover:text-zinc-300" />
            </div>
            <div className="space-y-1">
              {[
                { name: "Alice", status: "bg-emerald-500", avatar: "from-indigo-500 to-purple-600" },
                { name: "Bob", status: "bg-amber-500", avatar: "from-rose-400 to-orange-500" },
                { name: "Charlie", status: "bg-zinc-500", avatar: "from-blue-500 to-cyan-500" }
              ].map((user) => (
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  key={user.name}
                  className="flex w-full items-center px-3 py-2 text-sm text-zinc-400 rounded-xl hover:text-zinc-100 transition-colors"
                >
                  <div className="relative mr-3">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${user.avatar}`} />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${user.status}`} />
                  </div>
                  {user.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <motion.div 
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg shadow-fuchsia-500/20`}>
                  {user?.username.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 bg-emerald-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-zinc-100 truncate">
                  {user?.username || 'Guest'}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider truncate">
                  Online
                </span>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-1">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
              >
                <Settings className="w-4.5 h-4.5" />
              </motion.button>
              
              <motion.button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                  }
                }}
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
