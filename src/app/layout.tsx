import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Wrapper from "@/lib/Wrapper";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banglar Alo IT",
  description: "created by Ibrahim Rabbi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (

    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>

      <body className="min-h-full flex flex-col">
        <Wrapper>
          {children}
        </Wrapper>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>

  );
}
