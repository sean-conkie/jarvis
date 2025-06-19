import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatProvider } from "./ChatProvider";
import "./globals.css";
import { BASE_METADATA } from "@/metadata";
import { ThemeProvider } from "./_components/theme/ThemeProvider";
import Theme from "./_components/theme/Theme";
import NavBar from "./_components/nav/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = BASE_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}
      >
        <ThemeProvider>
          <Theme>
            <ChatProvider><NavBar>{children}</NavBar></ChatProvider>
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
