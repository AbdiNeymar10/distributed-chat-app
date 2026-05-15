import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

interface NotificationProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  t: any; // toast instance from react-hot-toast
}

const Notification = ({ title, message, icon, t }: NotificationProps) => {
  return (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="max-w-sm w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden ring-1 ring-black/5"
        >
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {icon || <Bell className="h-5 w-5" />}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-zinc-400">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/10">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const showNotification = (title: string, message: string, icon?: React.ReactNode) => {
  toast.custom((t) => <Notification title={title} message={message} icon={icon} t={t} />, {
    duration: 4000,
  });
};
