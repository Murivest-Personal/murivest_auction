"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Tone = "default" | "inverse";

/** Signs the buyer out (clears the httpOnly session cookie). */
export function SignOutButton({ tone = "default" }: { tone?: Tone }) {
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
      className={`btn ${tone === "inverse" ? "btn-inverse" : "btn-quiet"} disabled:opacity-100`}
    >
      {busy ? "Signing out" : "Sign out"}
    </button>
  );
}