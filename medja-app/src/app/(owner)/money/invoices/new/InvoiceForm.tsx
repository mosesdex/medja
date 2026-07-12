"use client";

import { useState } from "react";
import { createInvoice } from "@/features/invoices/actions";
import { formatNaira, toKobo, applyVat } from "@/lib/money";

interface Client {
  id: string;
  name: string;
}

export function InvoiceForm({
  clients,
  jobId,
  defaultClientId,
}: {
  clients: Client[];
  jobId?: string;
  defaultClientId?: string;
}) {
  const [lines, setLines] = useState([{ label: "", amount: "" }]);
  const [vat, setVat] = useState(false);
  const [deposit, setDeposit] = useState("");

  const subtotal = lines.reduce((s, l) => s + toKobo(Number(l.amount) || 0), 0);
  const vatKobo = vat ? applyVat(subtotal).vat : 0;
  const total = subtotal + vatKobo;
  const balance = Math.max(0, total - toKobo(Number(deposit) || 0));

  const field =
    "w-full rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-primary";

  return (
    <form action={createInvoice} className="card flex flex-col gap-4 p-5">
      {jobId && <input type="hidden" name="job_id" value={jobId} />}
      <label className="text-sm font-semibold">
        Client
        <select name="client_id" required defaultValue={defaultClientId} className={`mt-1 ${field}`}>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <div>
        <div className="mb-1 text-sm font-semibold">Lines</div>
        <div className="flex flex-col gap-2">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="line_label"
                placeholder="Deep clean — 4-bed duplex"
                value={l.label}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].label = e.target.value;
                  setLines(next);
                }}
                className={field}
              />
              <input
                name="line_amount"
                type="number"
                min="0"
                step="500"
                placeholder="₦"
                value={l.amount}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].amount = e.target.value;
                  setLines(next);
                }}
                className="w-28 rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLines([...lines, { label: "", amount: "" }])}
          className="mt-2 text-sm font-semibold text-primary"
        >
          + Add line
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="vat" checked={vat} onChange={(e) => setVat(e.target.checked)} className="h-5 w-5 accent-primary" />
        Add 7.5% VAT
      </label>

      <label className="text-sm font-semibold">
        Deposit already paid (₦)
        <input
          name="deposit_naira"
          type="number"
          min="0"
          step="500"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          className={`mt-1 ${field}`}
        />
      </label>

      <div className="rounded-xl bg-muted-bg p-3 text-sm">
        <Row k="Subtotal" v={formatNaira(subtotal)} />
        {vat && <Row k="VAT (7.5%)" v={formatNaira(vatKobo)} />}
        <Row k="Total" v={formatNaira(total)} />
        <Row k="Balance due" v={formatNaira(balance)} strong />
      </div>

      <button type="submit" className="btn-primary w-full">
        Create invoice
      </button>
    </form>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${strong ? "font-display text-base font-bold" : ""}`}>
      <span className={strong ? "" : "text-muted"}>{k}</span>
      <span className="money">{v}</span>
    </div>
  );
}
