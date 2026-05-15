"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Loader2 } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/store/chatStore";

export function CreateRoomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [roomName, setRoomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRoom } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsSubmitting(true);
    try {
      await createRoom(roomName.trim().toLowerCase().replace(/\s+/g, '-'));
      setRoomName("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Hash className="w-5 h-5 mr-2 text-indigo-400" />
                Create Channel
              </h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="room-name" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Channel Name
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    id="room-name"
                    type="text"
                    autoFocus
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. design-team"
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Names must be unique and will be converted to kebab-case.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !roomName.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Channel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
