import {
  Calendar,
  ChartColumn,
  Columns3,
  LayoutDashboard,
  ListTodo,
  Mail,
  Settings,
  Users,
  Warehouse,
} from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, guest: true },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse, guest: true },
  { href: "/admin/leads", label: "Pipeline", icon: Columns3, guest: true },
  { href: "/admin/customers", label: "People", icon: Users, guest: true },
  { href: "/admin/inbox", label: "Inbox", icon: Mail, guest: true },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar, guest: true },
  { href: "/admin/tasks", label: "Tasks", icon: ListTodo, guest: true },
  { href: "/admin/analytics", label: "Analytics", icon: ChartColumn, guest: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, guest: true },
] as const;

export function isAdminNavActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}
