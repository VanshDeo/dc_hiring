import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dev Community",
  description: "Apply to join the Dev Community - A global network of innovators pushing Dev Community forward",
  icons: {
    icon: "/dcLogo_black.webp",
    shortcut: "/dcLogo_black.webp",
    apple: "/dcLogo_black.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-accent/30 selection:text-white">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

