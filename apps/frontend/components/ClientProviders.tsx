"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { Appbar } from "@/components/Appbar";
import { SolanaWalletProvider } from "@/components/WalletProvider";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SolanaWalletProvider>
        <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
          <Appbar />
          {children}
          <Toaster />
        </ThemeProvider>
      </SolanaWalletProvider>
    </AuthProvider>
  );
}
