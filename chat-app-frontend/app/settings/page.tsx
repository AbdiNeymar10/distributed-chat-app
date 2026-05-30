"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, 
  Lock, 
  Settings as SettingsIcon, 
  Bell, 
  ArrowLeft, 
  Camera, 
  Trash2, 
  Check, 
  Loader2, 
  ShieldAlert, 
  Sparkles 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

type TabType = "profile" | "security" | "preferences";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  // Profile form states
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  
  // Password form states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  
  // Preferences states
  const [theme, setTheme] = useState(user?.themePreference || "dark");
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);
  const [isPreferencesSubmitting, setIsPreferencesSubmitting] = useState(false);

  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false);

  // Synchronize initial state when user is fetched or loaded
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setTheme(user.themePreference || "dark");
      setNotifications(user.notificationsEnabled ?? true);
    }
  }, [user]);

  // Apply Light/Dark theme immediately when theme changes
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.style.setProperty("--background", "#f4f4f5");
      document.documentElement.style.setProperty("--foreground", "#09090b");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.style.setProperty("--background", "#09090b");
      document.documentElement.style.setProperty("--foreground", "#fafafa");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Handle profile updates (username, email)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsProfileSubmitting(true);
    try {
      const response = await api.put("/users/profile", { username, email });
      // Backend returns UserDto
      updateUser({
        username: response.data.username,
        email: response.data.email
      });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all security fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsPasswordSubmitting(true);
    try {
      await api.put("/users/profile/password", { oldPassword, newPassword });
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password. Check current password.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  // Handle avatar Base64 upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setIsAvatarSubmitting(true);
    reader.onload = async () => {
      const base64String = reader.result as string;
      try {
        const response = await api.put("/users/profile/avatar", { avatar: base64String });
        updateUser({ avatar: response.data.avatar });
        toast.success("Profile photo uploaded!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to upload photo");
      } finally {
        setIsAvatarSubmitting(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
      setIsAvatarSubmitting(false);
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar image and revert to initials
  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    
    setIsAvatarSubmitting(true);
    try {
      const response = await api.put("/users/profile/avatar", { avatar: "" });
      updateUser({ avatar: response.data.avatar });
      toast.success("Profile photo removed!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove photo");
    } finally {
      setIsAvatarSubmitting(false);
    }
  };

  // Toggle dynamic preferences (theme, notifications)
  const handleTogglePreference = async (newTheme: string, newNotifications: boolean) => {
    setTheme(newTheme);
    setNotifications(newNotifications);
    
    try {
      const response = await api.put("/users/profile/settings", { 
        themePreference: newTheme, 
        notificationsEnabled: newNotifications 
      });
      updateUser({
        themePreference: response.data.themePreference,
        notificationsEnabled: response.data.notificationsEnabled
      });
    } catch (error: any) {
      console.error("Failed to save settings preferences", error);
    }
  };

  // Generate generic profile photo initials fallback
  const initialsFallback = user?.username ? user.username.slice(0, 2).toUpperCase() : "US";
  const colors = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500"
  ];
  const charCodeSum = user?.username ? user.username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const avatarColor = colors[charCodeSum % colors.length];

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${theme === "light" ? "bg-zinc-50 text-zinc-900" : "bg-zinc-950 text-zinc-50"}`}>
      {/* Dynamic Background Glowing Blobs (Futuristic aesthetic) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full filter blur-[100px] opacity-25 transition-colors ${theme === "light" ? "bg-indigo-300" : "bg-indigo-600/30"}`} />
        <div className={`absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full filter blur-[120px] opacity-20 transition-colors ${theme === "light" ? "bg-purple-300" : "bg-purple-600/25"}`} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        
        {/* Upper Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className={`p-3 rounded-2xl border transition-all ${theme === "light" ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100" : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-800"}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-bold text-indigo-500">System Preferences</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Control Center
              </h1>
            </div>
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Side Tabs Panel (Responsive) */}
          <div className="col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-4 md:pb-0 scrollbar-none">
            <TabButton 
              active={activeTab === "profile"} 
              onClick={() => setActiveTab("profile")} 
              icon={<UserIcon className="w-4.5 h-4.5" />} 
              label="Profile" 
              theme={theme}
            />
            <TabButton 
              active={activeTab === "security"} 
              onClick={() => setActiveTab("security")} 
              icon={<Lock className="w-4.5 h-4.5" />} 
              label="Security" 
              theme={theme}
            />
            <TabButton 
              active={activeTab === "preferences"} 
              onClick={() => setActiveTab("preferences")} 
              icon={<SettingsIcon className="w-4.5 h-4.5" />} 
              label="Preferences & Environment" 
              theme={theme}
            />
          </div>

          {/* Active Tab Panel Body */}
          <div className="col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className={`border rounded-3xl p-6 sm:p-8 transition-colors ${
                    theme === "light" 
                      ? "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50" 
                      : "bg-zinc-900/40 backdrop-blur-2xl border-white/5 shadow-2xl shadow-black/45"
                  }`}
                >
                  <h2 className="text-xl font-bold mb-1">User Profile</h2>
                  <p className={`text-xs mb-8 ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
                    Personalize how other members see you across the decentralized chat network.
                  </p>

                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                    {/* Avatar Upload Frame */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group rounded-3xl overflow-hidden shadow-2xl">
                        {isAvatarSubmitting && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          </div>
                        )}
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.username} 
                            className="w-32 h-32 object-cover border-2 border-white/10"
                          />
                        ) : (
                          <div className={`w-32 h-32 bg-gradient-to-br ${avatarColor} flex items-center justify-center text-3xl font-extrabold text-white`}>
                            {initialsFallback}
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold cursor-pointer z-10"
                        >
                          <Camera className="w-5 h-5" />
                          Upload Photo
                        </button>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            theme === "light" 
                              ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700" 
                              : "bg-zinc-800 border-white/5 hover:bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          Upload
                        </button>
                        {user?.avatar && (
                          <button
                            onClick={handleRemoveAvatar}
                            className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        )}
                      </div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleAvatarChange}
                      />
                      <p className={`text-[10px] uppercase font-bold text-center tracking-wider ${theme === "light" ? "text-zinc-400" : "text-zinc-500"}`}>
                        JPG, PNG, OR WEBP. MAX 2MB.
                      </p>
                    </div>

                    {/* Profile Forms */}
                    <form onSubmit={handleProfileSubmit} className="flex-1 w-full space-y-6">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                          Username
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.005, borderColor: "rgba(99, 102, 241, 0.4)" }}
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                            theme === "light"
                              ? "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-2 focus:ring-indigo-500/10"
                              : "bg-zinc-950/50 border-white/5 text-zinc-100 focus:ring-2 focus:ring-indigo-500/25"
                          }`}
                          placeholder="johndoe"
                        />
                        <p className={`text-[11px] mt-1.5 leading-relaxed ${theme === "light" ? "text-zinc-400" : "text-zinc-500"}`}>
                          Changing your username updates your digital handle immediately across chat rooms.
                        </p>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                          Email Address
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.005, borderColor: "rgba(99, 102, 241, 0.4)" }}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                            theme === "light"
                              ? "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-2 focus:ring-indigo-500/10"
                              : "bg-zinc-950/50 border-white/5 text-zinc-100 focus:ring-2 focus:ring-indigo-500/25"
                          }`}
                          placeholder="johndoe@example.com"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={isProfileSubmitting}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-75"
                      >
                        {isProfileSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Save Profile Changes
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className={`border rounded-3xl p-6 sm:p-8 transition-colors ${
                    theme === "light" 
                      ? "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50" 
                      : "bg-zinc-900/40 backdrop-blur-2xl border-white/5 shadow-2xl shadow-black/45"
                  }`}
                >
                  <h2 className="text-xl font-bold mb-1">Account Security</h2>
                  <p className={`text-xs mb-8 ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
                    Ensure your account is protected with a highly secure credentials profile.
                  </p>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                        Current Password
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.005, borderColor: "rgba(99, 102, 241, 0.4)" }}
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                          theme === "light"
                            ? "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-2 focus:ring-indigo-500/10"
                            : "bg-zinc-950/50 border-white/5 text-zinc-100 focus:ring-2 focus:ring-indigo-500/25"
                        }`}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                          New Password
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.005, borderColor: "rgba(99, 102, 241, 0.4)" }}
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                            theme === "light"
                              ? "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-2 focus:ring-indigo-500/10"
                              : "bg-zinc-950/50 border-white/5 text-zinc-100 focus:ring-2 focus:ring-indigo-500/25"
                          }`}
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                          Confirm New Password
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.005, borderColor: "rgba(99, 102, 241, 0.4)" }}
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                            theme === "light"
                              ? "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-2 focus:ring-indigo-500/10"
                              : "bg-zinc-950/50 border-white/5 text-zinc-100 focus:ring-2 focus:ring-indigo-500/25"
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
                      theme === "light"
                        ? "bg-amber-50 border-amber-200/50 text-amber-800"
                        : "bg-amber-500/5 border-amber-500/10 text-amber-400"
                    }`}>
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold">Password Policy:</span> Must be at least 6 characters and include a mixture of letters, numbers, or special symbols. Password modifications require signing back in from other devices immediately.
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={isPasswordSubmitting}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-75"
                    >
                      {isPasswordSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Update Security Credentials
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {activeTab === "preferences" && (
                <motion.div
                  key="preferences-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className={`border rounded-3xl p-6 sm:p-8 transition-colors ${
                    theme === "light" 
                      ? "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50" 
                      : "bg-zinc-900/40 backdrop-blur-2xl border-white/5 shadow-2xl shadow-black/45"
                  }`}
                >
                  <h2 className="text-xl font-bold mb-1">Preferences & Environment</h2>
                  <p className={`text-xs mb-8 ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
                    Configure your workspace interface, alerts, and dynamic themes.
                  </p>

                  <div className="space-y-8">

                    {/* Notification Toggles */}
                    <div className={`pt-6 border-t ${theme === "light" ? "border-zinc-200" : "border-white/5"}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={`p-3 rounded-xl shrink-0 ${theme === "light" ? "bg-indigo-50" : "bg-zinc-950"} border ${theme === "light" ? "border-indigo-100" : "border-white/5"}`}>
                            <Bell className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">Network Push Notifications</div>
                            <div className={`text-xs ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
                              Get instant pop-up sound and banner alerts when rooms receive new messages.
                            </div>
                          </div>
                        </div>

                        {/* Slide Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleTogglePreference(theme, !notifications)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notifications ? "bg-indigo-500" : (theme === "light" ? "bg-zinc-200" : "bg-zinc-800")
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notifications ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}

// Reusable tab navigation buttons with Framer Motion slide markers
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label,
  theme 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  theme: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer select-none md:w-full min-w-[130px] shrink-0 border ${
        active 
          ? "border-indigo-500/20 text-indigo-500" 
          : "border-transparent text-zinc-400 hover:text-zinc-300 hover:bg-white/5"
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-settings-tab"
          className={`absolute inset-0 rounded-2xl z-0 ${theme === "light" ? "bg-indigo-50 border border-indigo-200/50" : "bg-indigo-600/10"}`}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 shrink-0">{icon}</span>
      <span className="relative z-10 hidden sm:inline">{label}</span>
    </button>
  );
}
