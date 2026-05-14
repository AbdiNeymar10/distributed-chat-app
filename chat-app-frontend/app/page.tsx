import { ChatLayout } from "@/components/ChatLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <ChatLayout />
    </ProtectedRoute>
  );
}
