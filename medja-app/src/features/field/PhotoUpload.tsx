"use client";

import { useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { compressImage } from "@/lib/image";
import { recordJobPhoto } from "./photos";

export function PhotoUpload({
  jobId,
  companyId,
  kind,
}: {
  jobId: string;
  companyId: string;
  kind: "before" | "after";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("working");
    try {
      const blob = await compressImage(file);
      const path = `${companyId}/${jobId}/${kind}-${crypto.randomUUID()}.jpg`;
      const supabase = createBrowserClient();
      const { error } = await supabase.storage
        .from("job-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      await recordJobPhoto(jobId, kind, path);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onPick}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={state === "working"}
        className="btn-outline w-full text-sm capitalize disabled:opacity-60"
      >
        {state === "working"
          ? "Uploading…"
          : state === "done"
            ? `✓ ${kind} photo added`
            : state === "error"
              ? "Retry photo"
              : `Add ${kind} photo`}
      </button>
    </div>
  );
}
