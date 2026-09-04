import { cn } from "@/lib/utils";

export function AdminPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border border-chrome bg-white", className)}>{children}</div>;
}
