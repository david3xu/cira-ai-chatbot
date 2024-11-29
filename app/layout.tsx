import type { Metadata } from "next";
import { ChatProvider } from '@/components/chat/area/ChatProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "cira-ai",
  description: "cira-ai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
