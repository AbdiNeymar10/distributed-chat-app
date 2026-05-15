"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Hash, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";

export function JoinRoomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { allRooms, userRooms, fetchAllRooms, joinRoom } = useChatStore();
  const [search, setSearch] = useState("");
  const [isJoining, setIsJoining] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllRooms();
    }
  }, [isOpen, fetchAllRooms]);

  const availableRooms = allRooms.filter(room => 
    !userRooms.some(ur => ur.id === room.id) &&
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = async (roomId: string) => {
    setIsJoining(roomId);
    try {
      await joinRoom(roomId);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsJoining(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Search className="w-5 h-5 mr-2 text-indigo-400" />
                Discover Channels
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for channels..."
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {availableRooms.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">
                  No new channels found.
                </div>
              ) : (
                availableRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mr-3">
                        <Hash className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-100">#{room.name}</span>
                        <span className="text-xs text-zinc-500">Public Channel</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoin(room.id)}
                      disabled={isJoining === room.id}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isJoining === room.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Join
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
