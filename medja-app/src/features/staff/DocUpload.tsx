"use client";

import { useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { compressImage } from "@/lib/image";
import { recordStaffDoc, type StaffDocField } from "./docs";

const FIELD_KEY: Record<StaffDocField, string> = {
  nin_doc_path: "nin",
  guarantor_id_path: "guarantor",
  photo_path: "photo",
};

export function DocUpload({
  staffId,
  companyId,
  field,
  label,
  done,
}: {
  staffId: string;
  companyId: string;
  field: StaffDocField;
  label: string;
  done: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "working" | "done" | "error">(
    done ? "done" : "idle",
  );

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("working");
    try {
      const blob = await compressImage(file, { maxDim: 1600, targetKB: 300 });
      const path = `${companyId}/${staffId}/${FIELD_KEY[field]}-${crypto.randomUUID()}.jpg`;
      const supabase = createBrowserClient();
      const { error } = await supabase.storage
        .from("staff-docs")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      await recordStaffDoc(staffId, field, path);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-muted">{label}</span>
      <input ref={input} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={state === "working"}
        className={
          state === "done"
            ? "text-sm font-semibold text-accent"
            : "text-sm font-semibold text-primary"
        }
      >
        {state === "working"
          ? "Uploading…"
          : state === "done"
            ? "✓ On file · replace"
            : state === "error"
              ? "Retry"
              : "Upload"}
      </button>
    </div>
  );
}
