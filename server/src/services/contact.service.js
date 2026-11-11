import { createContactMessage } from "../repositories/contact.repository.js";
import { env } from "../config/env.js";
import { sendEmail } from "../lib/email/index.js";

export async function submitContactMessage(payload) {
  const message = await createContactMessage({
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    subject: payload.subject,
    message: payload.message,
    status: "NEW",
  });

  await sendEmail({
    to: env.STORE_EMAIL,
    subject: `[Kontak] ${payload.subject}`,
    text: `Dari: ${payload.name} <${payload.email}>\nTelepon: ${payload.phone || "-"}\n\n${payload.message}`,
  });

  return {
    id: message.id,
    status: message.status,
    createdAt: message.createdAt,
  };
}
