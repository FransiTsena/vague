import nodemailer from "nodemailer";

export type SendMailResult = {
  status: string;
  error?: string;
  sentAt?: Date;
};

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_FROM,
  );
}

export async function sendMemberEmail(
  to: string,
  subject: string,
  text: string,
): Promise<SendMailResult> {
  if (!isSmtpConfigured()) {
    return {
      status: "SKIPPED",
      error: "SMTP not configured (set SMTP_HOST, SMTP_PORT, SMTP_FROM; optional SMTP_USER/SMTP_PASSWORD)",
    };
  }

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.isFinite(port) ? port : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });
    return { status: "SENT", sentAt: new Date() };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown send error";
    return { status: "FAILED", error: message };
  }
}
