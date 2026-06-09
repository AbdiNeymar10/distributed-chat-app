import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distributed Chat App",
  description: "Distributed Chat Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="h-full flex flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        {children}
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
          }
        }} />
      </body>
    </html>
  );
}
