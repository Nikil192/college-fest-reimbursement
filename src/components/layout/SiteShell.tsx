"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
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

  useEffect(() => {
    if (!isNavigationOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsNavigationOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isNavigationOpen]);

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
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-[var(--background)] lg:flex-row print:block print:h-auto print:overflow-visible">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--card-border)] bg-[var(--sidebar-bg)] px-4 text-[var(--sidebar-fg)] lg:hidden print:hidden">
        <span className="text-lg font-bold tracking-tight">FestAdmin</span>
        <button
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={isNavigationOpen}
          aria-label={isNavigationOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setIsNavigationOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isNavigationOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
        </button>
      </header>

      <div className="hidden shrink-0 lg:block print:hidden">
        <Sidebar />
      </div>

      {isNavigationOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsNavigationOpen(false)}
          />
          <div id="mobile-navigation" className="relative h-full w-[min(18rem,85vw)] shadow-xl">
            <Sidebar onNavigate={() => setIsNavigationOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto print:overflow-visible">{children}</main>
    </div>
  );
}
