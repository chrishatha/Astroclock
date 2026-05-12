import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";

const router: IRouter = Router();

const RECIPIENT = "Chris.hatha@proton.me";

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

router.post("/contact", async (req, res) => {
  const { senderEmail, message } = req.body as {
    senderEmail?: string;
    message?: string;
  };

  if (!senderEmail || !message) {
    res.status(400).json({ error: "senderEmail and message are required" });
    return;
  }

  req.log.info({ senderEmail, messageLength: message.length }, "contact submission received");

  const transporter = buildTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Astro Clock Contact" <${process.env.SMTP_USER}>`,
        to: RECIPIENT,
        replyTo: senderEmail,
        subject: `Astro Clock message from ${senderEmail}`,
        text: `From: ${senderEmail}\n\n${message}`,
        html: `<p><strong>From:</strong> ${senderEmail}</p><p>${message.replace(/\n/g, "<br>")}</p>`,
      });
      req.log.info({ senderEmail }, "contact email sent successfully");
    } catch (err) {
      req.log.error({ err }, "failed to send contact email — submission logged only");
    }
  } else {
    req.log.warn(
      "SMTP not configured (set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS). Contact submission logged only.",
    );
  }

  res.json({ ok: true });
});

export default router;
