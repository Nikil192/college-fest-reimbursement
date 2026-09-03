"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { SITE_ACCESS_KEY, SITE_ACCESS_VALUE } from "@/lib/site-access";

function subscribeToAccessChange(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getAccessSnapshot() {
  return window.localStorage.getItem(SITE_ACCESS_KEY) === SITE_ACCESS_VALUE;
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasAccess = useSyncExternalStore(
    subscribeToAccessChange,
    getAccessSnapshot,
    () => false,
  );

  useEffect(() => {
    if (pathname === "/password") {
      return;
    }

    if (hasAccess || getAccessSnapshot()) {
      return;
    }

    const next = `${window.location.pathname}${window.location.search}`;
    router.replace(`/password?next=${encodeURIComponent(next)}`);
  }, [hasAccess, pathname, router]);

  if (pathname === "/password") {
    return children;
  }

  if (!hasAccess) {
    return (
      <div
        aria-label="Checking access"
        className="min-h-screen bg-[var(--background)]"
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
