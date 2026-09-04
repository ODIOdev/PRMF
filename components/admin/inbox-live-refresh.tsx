"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function InboxLiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 8000);
    return () => window.clearInterval(timer);
  }, [router]);
  return null;
}
