export interface VettingFields {
  nin?: string | null;
  nin_doc_path?: string | null;
  guarantor_name?: string | null;
  guarantor_phone?: string | null;
  guarantor_address?: string | null;
  background_check?: string | null;
}

export const VETTING_CHECKLIST: {
  key: keyof VettingFields;
  label: string;
}[] = [
  { key: "nin", label: "NIN recorded" },
  { key: "nin_doc_path", label: "ID document uploaded" },
  { key: "guarantor_name", label: "Guarantor name" },
  { key: "guarantor_phone", label: "Guarantor phone" },
  { key: "guarantor_address", label: "Guarantor address" },
  { key: "background_check", label: "Background check" },
];

/** How many vetting items are complete, and whether all are. */
export function vettingProgress(fields: VettingFields): {
  done: number;
  total: number;
  complete: boolean;
  missing: string[];
} {
  const missing = VETTING_CHECKLIST.filter(
    (c) => !fields[c.key] || String(fields[c.key]).trim() === "",
  ).map((c) => c.label);
  const total = VETTING_CHECKLIST.length;
  const done = total - missing.length;
  return { done, total, complete: missing.length === 0, missing };
}
