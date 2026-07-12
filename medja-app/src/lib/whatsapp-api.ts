/**
 * WhatsApp Business Cloud API sender (Phase 4).
 *
 * Automated notifications (booking confirmed, cleaner en route, job completed,
 * invoice) replace manual wa.me links where the company has an approved
 * WhatsApp Business number. Falls back to wa.me when not configured.
 *
 * Configure with WHATSAPP_TOKEN and WHATSAPP_PHONE_ID.
 */
import { normalizeNgPhone } from "./whatsapp";

export function isWhatsAppApiConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

export async function sendWhatsAppText(
  to: string,
  body: string,
): Promise<{ sent: boolean; fallbackUrl?: string }> {
  const phone = normalizeNgPhone(to);
  if (!isWhatsAppApiConfigured()) {
    // Not configured — return a wa.me fallback the caller can surface instead.
    return {
      sent: false,
      fallbackUrl: `https://wa.me/${phone}?text=${encodeURIComponent(body)}`,
    };
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body },
      }),
    },
  );
  return { sent: res.ok };
}
