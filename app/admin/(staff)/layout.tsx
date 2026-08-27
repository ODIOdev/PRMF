import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";
import { PremierLogo } from "@/components/site/logo";

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
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-56 bg-ford p-4 text-white md:block">
        <PremierLogo height={40} />
        <p className="mb-6 mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">Staff console</p>
        <nav className="grid gap-1 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="px-3 py-2 text-white/85 hover:bg-white/10 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-8">
          <button className="px-3 text-sm text-white/60 hover:text-white">Sign out</button>
        </form>
      </aside>
      <div className="md:pl-56">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
