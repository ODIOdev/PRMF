import Link from "next/link";

export function StaffGate({ isStaff, children }: { isStaff: boolean; children?: React.ReactNode }) {
  if (isStaff) return children;
  return (
    <div className="border border-chrome bg-white px-6 py-10 text-center">
      <p className="text-base font-semibold tracking-tight">Staff only</p>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to open the full Premier Brooklyn CRM.</p>
      <Link
        href="/admin/login"
        className="mt-4 inline-flex h-10 items-center bg-ford px-4 text-sm font-medium text-white hover:bg-ford-bright"
      >
        Staff sign in
      </Link>
    </div>
  );
}
