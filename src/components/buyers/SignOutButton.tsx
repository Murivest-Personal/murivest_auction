"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Signs the buyer out (clears the httpOnly session cookie). */
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/buyers/sign-out", { method: "POST" });
          router.push("/");
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
      className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-green border border-hairline px-5 py-2.5 hover:border-green transition-colors disabled:opacity-40"
    >
      {busy ? "Signing out" : "Sign out"}
    </button>
  );
}
