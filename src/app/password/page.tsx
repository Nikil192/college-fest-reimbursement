"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SITE_ACCESS_KEY,
  SITE_ACCESS_VALUE,
  SITE_PASSWORD,
} from "@/lib/site-access";

export default function PasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== SITE_PASSWORD) {
      setError("That password is incorrect. Please try again.");
      return;
    }

    window.localStorage.setItem(SITE_ACCESS_KEY, SITE_ACCESS_VALUE);

    const requestedPath = new URLSearchParams(window.location.search).get("next");
    const destination =
      requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/";

    router.replace(destination);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101820] px-5 py-12 text-slate-100">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <section className="relative w-full max-w-md border border-white/10 bg-[#16212b]/95 p-7 shadow-2xl shadow-black/40 sm:p-10">
        <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-blue-300">
              FestAdmin
            </p>
            <p className="mt-1 text-sm text-slate-400">Restricted workspace</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center border border-blue-300/30 bg-blue-400/10 text-blue-200">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Enter access password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            This reimbursement workspace is limited to authorized festival staff.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"
            htmlFor="site-password"
          >
            Password
          </label>
          <div className="relative">
            <KeyRound
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />
            <input
              autoComplete="current-password"
              autoFocus
              className="h-12 w-full border border-white/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-300/15"
              id="site-password"
              name="password"
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </div>

          <div aria-live="polite" className="min-h-10 pt-2">
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>

          <button
            className="flex h-12 w-full items-center justify-center bg-blue-400 px-5 text-sm font-bold text-[#101820] transition hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-[#16212b]"
            type="submit"
          >
            Unlock workspace
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
          College Fest Reimbursements / 2026
        </p>
      </section>
    </main>
  );
}
