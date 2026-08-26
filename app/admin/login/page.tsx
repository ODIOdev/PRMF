import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Premier Brooklyn</p>
        <h1 className="mt-2 text-2xl font-semibold">Staff sign in</h1>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">Inventory and CRM access for dealership staff only.</p>
        <LoginForm />
      </div>
    </div>
  );
}
