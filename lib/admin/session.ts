import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CRM_GUEST_COOKIE, GUEST_FULL_CRM } from "@/lib/admin/guest";

export const getAdminAccess = cache(async () => {
  const guest = (await cookies()).get(CRM_GUEST_COOKIE)?.value === "1";
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isStaff = Boolean(user);
    const isGuest = !isStaff && guest;
    const fullCrm = isStaff || (isGuest && GUEST_FULL_CRM);
    return {
      user,
      isStaff,
      isGuest,
      fullCrm,
      allowed: isStaff || guest,
    };
  } catch {
    return {
      user: null,
      isStaff: false,
      isGuest: guest,
      fullCrm: guest && GUEST_FULL_CRM,
      allowed: guest,
    };
  }
});

export async function requireStaff() {
  const { fullCrm } = await getAdminAccess();
  if (!fullCrm) redirect("/admin/login");
}

export async function createDeskClient() {
  const { isStaff, fullCrm } = await getAdminAccess();
  if (!isStaff && fullCrm) return createAdminClient();
  return createClient();
}
