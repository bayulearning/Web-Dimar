import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// Email adapter development. Mode "log" hanya mencatat email ke log server.
// Mode "smtp" belum terhubung ke penyedia nyata; konfigurasi SMTP harus
// ditambahkan sebelum dipakai di production.
export function emailMode() {
  return env.EMAIL_MODE;
}

export async function sendEmail({ to, subject, text }) {
  if (!to) {
    logger.warn("email_skipped_missing_recipient", { subject });
    return { sent: false, mode: emailMode() };
  }

  if (emailMode() !== "log") {
    logger.warn("email_smtp_not_configured", {
      to,
      subject,
      mode: emailMode(),
      note: "Adapter SMTP nyata belum dikonfigurasi; email tidak dikirim.",
    });
    return { sent: false, mode: emailMode() };
  }

  logger.info("email_logged", {
    to,
    from: env.EMAIL_FROM,
    subject,
    text,
    mode: "log",
  });

  return { sent: false, mode: "log" };
}

export const emailProviderName = "log";
