import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PremierLogo } from "@/components/site/logo";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ford px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(27_134_200_/_22%),transparent_55%)]" />
      <div className="relative w-full max-w-[26rem]">
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_24px_60px_rgb(0_0_0_/_28%)]">
          <div className="flex items-center justify-between gap-4 border-b border-chrome/70 px-6 py-4">
            <PremierLogo height={40} />
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-ford hover:underline"
            >
              <ChevronLeft className="size-3.5" />
              Back to website
            </Link>
          </div>
          <div className="px-6 py-7">
            <h1 className="text-xl font-semibold tracking-tight">Staff sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">For Premier Brooklyn team members.</p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </div>
        </div>
        <p className="mt-4 text-center">
          <Link href="/admin/guest" className="text-sm font-medium text-white/80 hover:text-white hover:underline">
            Continue as guest
          </Link>
        </p>
      </div>
    </div>
  );
}
