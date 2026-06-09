"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      setAuth(
        { id: response.data.user.id || '', username: response.data.user.username || username, email: response.data.user.email || '' },
        response.data.token
      );
      toast.success("Welcome back!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue to Chat App">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
          <motion.input
            whileFocus={{ scale: 1.01, borderColor: "rgba(99, 102, 241, 0.5)" }}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-100"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
          <motion.input
            whileFocus={{ scale: 1.01, borderColor: "rgba(99, 102, 241, 0.5)" }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-100"
            placeholder="••••••••"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </motion.button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-zinc-400 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
