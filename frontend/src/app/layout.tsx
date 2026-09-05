import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import TanStackQueryWrapper from "@/components/setupComponents/tanstackQuery/tanstackWrapper";
import { ThemeProvider } from "@/components/setupComponents/ThemeProvider";
import TopProgressBarProvider from "@/components/setupComponents/TopProgressBar/ProgressProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/store/authStore";
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
  title: "Kanban Board",
  description: "A minimal Kanban board for organizing work across boards, columns, and tasks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TanStackQueryWrapper>
            <AuthProvider>
              <TopProgressBarProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </TopProgressBarProvider>
            </AuthProvider>
          </TanStackQueryWrapper>
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            },
          }}
        />
      </body>
    </html>
  );
}
