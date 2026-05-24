import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlashMind AI",
  description:
    "AI-powered flashcard learning application. Create, study, and master any topic with intelligent flashcard generation and spaced learning.",
  keywords: ["flashcard", "learning", "AI", "study", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "toast-custom",
            duration: 3000,
            style: {
              borderRadius: "14px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 500,
              background: "#2A2520",
              color: "#F5F0E8",
              border: "1px solid #4D4437",
            },
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
