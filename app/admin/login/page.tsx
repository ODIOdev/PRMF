import { PremierLogo } from "@/components/site/logo";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ford px-4">
      <div className="w-full max-w-md border border-white/10 bg-white p-8">
        <PremierLogo height={56} />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Staff sign in</h1>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">Inventory and CRM access for dealership staff only.</p>
        <LoginForm />
      </div>
    </div>
  );
}
