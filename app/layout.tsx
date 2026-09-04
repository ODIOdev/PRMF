import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getDictionary } from "@/lib/get-dictionary";
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
  title: {
    default: "Premier Brooklyn | Ford and Lincoln",
    template: "%s | Premier Brooklyn",
  },
  description:
    "Find your Ford or Lincoln in Brooklyn. Transparent pricing, fast financing, and service you can schedule online.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { t } = await getDictionary();
  return (
    <html
      lang={t.htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
