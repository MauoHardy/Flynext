"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { NotificationsProvider } from "@/app/contexts/NotificationsContext";
import { HotelProvider } from "@/app/contexts/HotelContext";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

// Remove metadata export from client component
// Metadata should be defined in a server component or in next.config.js

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            <NotificationsProvider>
              <HotelProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                </div>
              </HotelProvider>
            </NotificationsProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
