"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/register", { username, email, password });
      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Username or email might be taken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Nexus Chat today">
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
          <motion.input
            whileFocus={{ scale: 1.01, borderColor: "rgba(99, 102, 241, 0.5)" }}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-100"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
          <motion.input
            whileFocus={{ scale: 1.01, borderColor: "rgba(99, 102, 241, 0.5)" }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-100"
            placeholder="you@example.com"
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
            placeholder="Create a strong password"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          type="submit"
          className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
        </motion.button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-zinc-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
