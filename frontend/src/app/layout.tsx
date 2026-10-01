import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { ParticleBackground } from "../components/ParticleBackground";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Sheldon - Think Before You Build",
  description: "A brutally honest logical advisor, startup concept stress-tester, and fact explorer inspired by the ultimate analytical mind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050814] text-[#f8fafc] flex flex-col md:flex-row relative">
        <AuthProvider>
          <ParticleBackground />
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
