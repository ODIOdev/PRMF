import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/appointments", label: "Appointments" },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r bg-white p-4 md:block">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Premier</p>
        <p className="mb-6 font-semibold">Staff console</p>
        <nav className="grid gap-1 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 hover:bg-zinc-100">
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-8">
          <button className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </form>
      </aside>
      <div className="md:pl-56">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
