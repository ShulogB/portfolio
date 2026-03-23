"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    const path = (pathname && pathname.trim()) ? pathname : "/";
    fetch(API_ENDPOINTS.track, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
