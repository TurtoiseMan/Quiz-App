import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quiz App",
  description: "A modern quiz application built with Next.js and Ant Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigProvider
          theme={{
            token: {
              fontFamily: "var(--font-geist-sans)",
              colorPrimary: "#1890ff",
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
