import crypto from "node:crypto";

const BASE = "https://api.paystack.co";

function secret(): string {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("PAYSTACK_SECRET_KEY not set");
  return k;
}

/** Verify a Paystack webhook signature (HMAC SHA512 of the raw body). */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  key = process.env.PAYSTACK_SECRET_KEY ?? "",
): boolean {
  if (!signature || !key) return false;
  const hash = crypto.createHmac("sha512", key).update(rawBody).digest("hex");
  // constant-time compare
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export interface InitResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

/** Initialise a Paystack transaction; returns the hosted checkout URL. */
export async function initTransaction(input: {
  email: string;
  amountKobo: number;
  reference?: string;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}): Promise<InitResult> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo, // Paystack expects kobo
      reference: input.reference,
      metadata: input.metadata,
      callback_url: input.callbackUrl,
      channels: ["card", "bank", "ussd", "bank_transfer"],
    }),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack init failed");
  return json.data as InitResult;
}

/** Verify a transaction by reference. Returns whether it is paid + amount. */
export async function verifyTransaction(
  reference: string,
): Promise<{ paid: boolean; amountKobo: number }> {
  const res = await fetch(`${BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret()}` },
  });
  const json = await res.json();
  const data = json.data ?? {};
  return { paid: data.status === "success", amountKobo: data.amount ?? 0 };
}
