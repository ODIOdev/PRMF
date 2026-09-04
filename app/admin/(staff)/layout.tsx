import { getAdminAccess } from "@/lib/admin/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminPathHeader } from "@/components/admin/admin-path-header";
import { redirect } from "next/navigation";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { allowed, isGuest } = await getAdminAccess();
  if (!allowed) redirect("/admin/login");

  return (
    <div className="crm-desk flex min-h-screen bg-[#f4f6f8]">
      <AdminSidebar isGuest={isGuest} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav isGuest={isGuest} />
        <AdminPathHeader />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">{children}</div>
      </div>
    </div>
  );
}
