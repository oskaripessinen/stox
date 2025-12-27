import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@/components/providers/clerk-provider";
import { AuthSync } from "@/components/auth/auth-sync";
import { SearchProvider } from "@/context/search-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stox - Stock Tracker",
  description: "Track your favorite stocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SearchProvider>
          <ClerkProvider>
            <AuthSync />
            {children}
            <Toaster position="bottom-right" />
          </ClerkProvider>
        </SearchProvider>
      </body>
    </html>
  );
}