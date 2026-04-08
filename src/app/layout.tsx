import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlashMind AI - Smart Flashcard Learning",
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
          position="bottom-right"
          toastOptions={{
            className: "toast-custom",
            duration: 3000,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
