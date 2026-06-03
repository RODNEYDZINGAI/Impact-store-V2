const MAILEROO_API = "https://smtp.maileroo.com/api/v2/emails";

const normalizeHost = (value?: string) =>
  (value || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();

const normalizeEmail = (value?: string) =>
  (value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");

const resolveSender = (value: string | undefined, localPart: string) => {
  const normalized = normalizeEmail(value);
  if (normalized.includes("@")) return normalized;

  const domain = normalizeHost(normalized || EMAIL_DOMAIN);
  return `${localPart}@${domain}`;
};

const APP_DOMAIN =
  normalizeHost(process.env.NEXT_PUBLIC_APP_DOMAIN) ||
  normalizeHost(process.env.NEXT_PUBLIC_BASE_URL) ||
  "localhost:3000";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  `http://${APP_DOMAIN}`;

const EMAIL_DOMAIN = normalizeHost(process.env.MAILEROO_FROM_DOMAIN) || APP_DOMAIN;
const CONTACT_EMAIL = process.env.CONTACT_ADMIN_EMAIL || `info@${EMAIL_DOMAIN}`;

const FROM_SECURITY = resolveSender(
  process.env.MAILEROO_FROM_SECURITY ||
    process.env.MAILEROO_FROM_EMAIL,
  "security"
);
const FROM_ORDERS = resolveSender(
  process.env.MAILEROO_FROM_ORDERS ||
    process.env.MAILEROO_FROM_EMAIL,
  "orders"
);
const FROM_NOREPLY = resolveSender(
  process.env.MAILEROO_FROM_NOREPLY ||
    process.env.MAILEROO_FROM_EMAIL,
  "noreply"
);

const REPLY_TO_EMAIL = normalizeEmail(
  process.env.MAILEROO_REPLY_TO_EMAIL || CONTACT_EMAIL
);

function toEmailObject(address: string, displayName?: string) {
  return { address, ...(displayName ? { display_name: displayName } : {}) };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = FROM_NOREPLY,
  fromName,
}: EmailOptions) {
  const sendingKey = process.env.MAILEROO_SENDING_KEY;
  if (!sendingKey) {
    console.warn("[Email] MAILEROO_SENDING_KEY not set, email not sent");
    return { success: false, error: "MAILEROO_SENDING_KEY not configured" };
  }

  const body = {
    from: toEmailObject(from, fromName),
    to: [toEmailObject(to)],
    subject,
    html,
    reply_to: toEmailObject(REPLY_TO_EMAIL),
  };

  console.log("[Email] Sending:", JSON.stringify({
    to,
    from: `${fromName ? fromName + " " : ""}<${from}>`,
    subject,
    reply_to: REPLY_TO_EMAIL,
    html_length: html.length,
  }));

  try {
    const response = await fetch(MAILEROO_API, {
      method: "POST",
      headers: {
        "X-API-Key": sendingKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("[Email] Maileroo error:", JSON.stringify({
        status: response.status,
        to,
        from,
        subject,
        error: result.message || result,
      }));
      return {
        success: false,
        error: result.message || `Maileroo responded with status ${response.status}`,
      };
    }

    console.log("[Email] Sent successfully:", JSON.stringify({
      to,
      from,
      subject,
      reference_id: result.data?.reference_id,
    }));
    return { success: true, data: result.data };
  } catch (error) {
    console.error("[Email] Send error:", JSON.stringify({
      to,
      from,
      subject,
      error: error instanceof Error ? error.message : String(error),
    }));
    return { success: false, error };
  }
}

// Account Creation Welcome Email
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0; }
          .logo { font-size: 28px; font-weight: bold; color: #1a1a2e; }
          .logo span { color: #c9a227; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #1a1a2e, #16213e); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for creating an account with Impact Store. We're excited to have you on board!</p>
            <p>You can now:</p>
            <ul>
              <li>Browse our collection of business-ready technology and ICT hardware</li>
              <li>Save your favorite products</li>
              <li>Track your orders easily</li>
              <li>Enjoy exclusive member benefits</li>
            </ul>
            <center>
              <a href="${APP_URL}/products" class="button">Start Shopping</a>
            </center>
            <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
          </div>
          <div class="footer">
            <p>Impact Store - ICT Hardware and Business Technology</p>
            <p>This email was sent to ${to} as part of your account registration.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Welcome to Impact Store - Your Account is Ready!",
    html,
    from: FROM_SECURITY,
  });
}

// Password Reset Email
export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: {
  to: string;
  name: string;
  resetToken: string;
}) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0; }
          .logo { font-size: 28px; font-weight: bold; color: #1a1a2e; }
          .logo span { color: #c9a227; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #1a1a2e, #16213e); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password for your Impact Store account. If you made this request, click the button below to reset your password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
            </div>
          </div>
          <div class="footer">
            <p>Impact Store - Security Team</p>
            <p>This email was sent to ${to} for security purposes.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Password Reset Request - Impact Store",
    html,
    from: FROM_SECURITY,
  });
}

// Email Verification Code Email
export async function sendVerificationCodeEmail({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0; }
          .logo { font-size: 28px; font-weight: bold; color: #1a1a2e; }
          .logo span { color: #c9a227; }
          .content { padding: 30px 0; }
          .code-box { background: linear-gradient(to right, #1a1a2e, #16213e); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${name},</p>
            <p>Thank you for creating an account with Impact Store. To complete your registration, please enter the verification code below:</p>
            <div class="code-box">${code}</div>
            <div class="warning">
              <strong>Important:</strong> This code will expire in 30 minutes. If you didn't create an account with us, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>Impact Store - Security Team</p>
            <p>This email was sent to ${to} for verification purposes.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Your Verification Code - Impact Store",
    html,
    from: FROM_SECURITY,
  });
}

// Password Changed Confirmation Email
export async function sendPasswordChangedEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0; }
          .logo { font-size: 28px; font-weight: bold; color: #1a1a2e; }
          .logo span { color: #c9a227; }
          .content { padding: 30px 0; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; color: #155724; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
          </div>
          <div class="content">
            <h2>Password Successfully Changed</h2>
            <p>Hi ${name},</p>
            <div class="success">
              Your password has been successfully changed. You can now log in with your new password.
            </div>
            <p>If you didn't make this change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>Impact Store - Security Team</p>
            <p>This email was sent to ${to} for security purposes.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Password Changed Successfully - Impact Store",
    html,
    from: FROM_SECURITY,
  });
}

// Contact Form - Send inquiry to admin
export async function sendContactInquiryEmail({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = CONTACT_EMAIL;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align: center; padding: 40px 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .logo span { color: #c9a227; }
          .content { padding: 40px 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 10px; font-weight: 600; }
          .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; }
          .info-row { padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: 600; color: #1a1a2e; display: block; margin-bottom: 4px; }
          .message-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-top: 15px; white-space: pre-wrap; }
          .footer { background: #1a1a2e; color: #999; text-align: center; padding: 30px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
            <p style="color: #c9a227; margin: 10px 0 0 0; font-size: 14px;">New Contact Form Submission</p>
          </div>

          <div class="content">
            <div class="section">
              <div class="section-title">Sender Information</div>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Name</span>
                  ${name}
                </div>
                <div class="info-row">
                  <span class="info-label">Email</span>
                  <a href="mailto:${email}" style="color: #1f4f8f;">${email}</a>
                </div>
                ${phone ? `
                <div class="info-row">
                  <span class="info-label">Phone</span>
                  ${phone}
                </div>
                ` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Subject</div>
              <p style="font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0;">${subject}</p>
            </div>

            <div class="section">
              <div class="section-title">Message</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
                 style="display: inline-block; background: linear-gradient(135deg, #1f4f8f 0%, #fbbf24 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Reply to ${name}
              </a>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #fff;">Impact Store</p>
            <p style="margin: 0 0 5px 0;">ICT Hardware and Business Technology</p>
            <p style="margin: 15px 0 0 0; opacity: 0.6;">This inquiry was submitted via the contact form on ${APP_DOMAIN}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Contact Inquiry: ${subject}`,
    html,
    from: FROM_NOREPLY,
  });
}

// Contact Form - Send acknowledgment to user
export async function sendContactAcknowledgmentEmail({
  to,
  name,
  subject,
}: {
  to: string;
  name: string;
  subject: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We Received Your Message - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align: center; padding: 40px 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .logo span { color: #c9a227; }
          .content { padding: 40px 30px; }
          .success-banner { background: linear-gradient(135deg, #1f4f8f 0%, #fbbf24 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .success-banner h2 { margin: 0; font-size: 22px; }
          .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #1f4f8f 0%, #fbbf24 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #1a1a2e; color: #999; text-align: center; padding: 30px; font-size: 12px; }
          .footer a { color: #c9a227; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
          </div>

          <div class="content">
            <div class="success-banner">
              <h2>✓ Message Received!</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for contacting us, ${name}</p>
            </div>

            <p>Hi ${name},</p>

            <p>We&apos;ve received your message regarding <strong>${subject}</strong> and wanted to let you know that we&apos;re on it!</p>

            <p>Our team typically responds to inquiries within 24-48 business hours. If your matter is urgent, please feel free to reach out to us directly at <a href="mailto:${CONTACT_EMAIL}" style="color: #1f4f8f;">${CONTACT_EMAIL}</a>.</p>

            <div class="info-box">
              <p style="margin: 0; font-weight: 600; color: #1a1a2e;">What happens next?</p>
              <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #666;">
                <li>Our support team will review your inquiry</li>
                <li>We&apos;ll research your question or concern</li>
                <li>You&apos;ll receive a detailed response via email</li>
              </ul>
            </div>

            <center>
              <a href="${APP_URL}/products" class="cta-button">
                Browse Our Products
              </a>
            </center>

            <p style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              Best regards,<br>
              <strong style="color: #1a1a2e;">The Impact Store Team</strong>
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #fff;">Impact Store</p>
            <p style="margin: 0 0 5px 0;">ICT Hardware and Business Technology</p>
            <p style="margin: 15px 0 0 0;">
              <a href="${APP_URL}">Visit Website</a> |
              <a href="${APP_URL}/contact">Contact Support</a>
            </p>
            <p style="margin: 15px 0 0 0; opacity: 0.6;">This email was sent to ${to} in response to your contact form submission.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "We Received Your Message - Impact Store",
    html,
    from: FROM_NOREPLY,
  });
}

// Quote Request - Notify admin of new quote submission
export async function sendQuoteRequestEmail({
  name,
  email,
  phone,
  company,
  budget,
  timeline,
  source,
  message,
  products,
  quoteId,
}: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: string;
  timeline?: string;
  source?: string;
  message?: string;
  products: { name: string; quantityMin?: number; quantityMax?: number }[];
  quoteId: string;
}) {
  const adminEmail = CONTACT_EMAIL;

  const productRows = products
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${p.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${
            p.quantityMin || p.quantityMax
              ? `${p.quantityMin ?? 1}${p.quantityMax ? ` – ${p.quantityMax}` : "+"}`
              : "—"
          }</td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Quote Request - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align: center; padding: 40px 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #ffffff; }
          .logo span { color: #c9a227; }
          .content { padding: 40px 30px; }
          .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 10px; font-weight: 600; }
          .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
          .info-row { padding: 6px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: 600; color: #1a1a2e; display: inline-block; min-width: 80px; }
          .products-table { width: 100%; border-collapse: collapse; }
          .products-table th { background: #1a1a2e; color: #fff; padding: 8px 12px; text-align: left; font-size: 13px; }
          .footer { background: #1a1a2e; color: #999; text-align: center; padding: 24px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
            <p style="color:#c9a227;margin:10px 0 0;font-size:14px;">New Quote Request</p>
          </div>
          <div class="content">
            <div class="section-title">Contact Details</div>
            <div class="info-box">
              <div class="info-row"><span class="info-label">Name</span> ${name}</div>
              <div class="info-row"><span class="info-label">Email</span> <a href="mailto:${email}" style="color:#1f4f8f;">${email}</a></div>
              ${phone ? `<div class="info-row"><span class="info-label">Phone</span> ${phone}</div>` : ""}
              ${company ? `<div class="info-row"><span class="info-label">Company</span> ${company}</div>` : ""}
            </div>

            ${
              budget || timeline || source
                ? `<div class="section-title">Quote Context</div>
                   <div class="info-box">
                     ${budget ? `<div class="info-row"><span class="info-label">Budget</span> ${budget}</div>` : ""}
                     ${timeline ? `<div class="info-row"><span class="info-label">Timeline</span> ${timeline}</div>` : ""}
                     ${source ? `<div class="info-row"><span class="info-label">Source</span> ${source}</div>` : ""}
                   </div>`
                : ""
            }

            <div class="section-title">Products of Interest</div>
            <table class="products-table" style="margin-bottom:24px;">
              <thead><tr><th>Product</th><th style="text-align:center;">Qty Range</th></tr></thead>
              <tbody>${productRows}</tbody>
            </table>

            ${
              message
                ? `<div class="section-title">Message</div>
                   <div class="info-box" style="white-space:pre-wrap;">${message.replace(/\n/g, "<br>")}</div>`
                : ""
            }

            <div style="text-align:center;margin-top:24px;">
              <a href="${APP_URL}/admin/quotes/${quoteId}"
                 style="display:inline-block;background:linear-gradient(135deg,#1f4f8f 0%,#fbbf24 100%);color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">
                Review in Admin
              </a>
            </div>
          </div>
          <div class="footer">
            <p style="margin:0 0 5px;font-size:15px;font-weight:600;color:#fff;">Impact Store</p>
            <p style="margin:0;">Quote ID: ${quoteId}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Quote Request from ${name}`,
    html,
    from: FROM_NOREPLY,
  });
}

// Quote Request - Confirmation email to requester
export async function sendQuoteAcknowledgmentEmail({
  to,
  name,
  products,
}: {
  to: string;
  name: string;
  products: { name: string }[];
}) {
  const productList = products.map((p) => `<li>${p.name}</li>`).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Request Received - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align: center; padding: 40px 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #ffffff; }
          .logo span { color: #c9a227; }
          .content { padding: 40px 30px; }
          .success-banner { background: linear-gradient(135deg, #1f4f8f 0%, #fbbf24 100%); color: #fff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .footer { background: #1a1a2e; color: #999; text-align: center; padding: 24px; font-size: 12px; }
          .footer a { color: #c9a227; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
          </div>
          <div class="content">
            <div class="success-banner">
              <h2 style="margin:0;">Quote Request Received</h2>
              <p style="margin:10px 0 0;opacity:0.9;">Thank you, ${name}!</p>
            </div>
            <p>Hi ${name},</p>
            <p>We have received your quote request for the following product(s):</p>
            <ul style="margin:16px 0;padding-left:20px;color:#555;">${productList}</ul>
            <p>Our team will review your request and get back to you within <strong>1–2 business days</strong> with a tailored quote.</p>
            <p>If you have any urgent questions in the meantime, contact us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1f4f8f;">${CONTACT_EMAIL}</a>.</p>
            <p style="margin-top:32px;color:#666;font-size:14px;">
              Best regards,<br>
              <strong style="color:#1a1a2e;">The Impact Store Team</strong>
            </p>
          </div>
          <div class="footer">
            <p style="margin:0 0 5px;font-size:15px;font-weight:600;color:#fff;">Impact Store</p>
            <p style="margin:0 0 5px;">ICT Hardware and Business Technology</p>
            <p style="margin:0 0 10px;opacity:0.8;">Impact Store is a trading name of Impact Holdings Group</p>
            <p style="margin:0;"><a href="${APP_URL}">Visit Website</a> | <a href="${APP_URL}/contact">Contact Support</a></p>
            <p style="margin:12px 0 0;opacity:0.6;">This email was sent to ${to} in response to your quote request.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Quote Request Received - Impact Store",
    html,
    from: FROM_NOREPLY,
  });
}

// Aliases used by the quotes API route
export const sendQuoteNotificationEmail = sendQuoteRequestEmail;
export const sendQuoteConfirmationEmail = sendQuoteAcknowledgmentEmail;

// Order Confirmation Email
export async function sendOrderConfirmationEmail({
  to,
  name,
  orderId,
  items,
  subtotal,
  shipping,
  discount,
  total,
  shippingAddress,
}: {
  to: string;
  name: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
}) {
  console.log("[Email] Order confirmation triggered:", JSON.stringify({
    to,
    name,
    orderId: orderId.slice(-8).toUpperCase(),
    items_count: items.length,
    total: `R${total.toLocaleString()}`,
  }));
  const orderNumber = orderId.slice(-8).toUpperCase();
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  const discountRow =
    discount > 0
      ? `
        <tr>
          <td style="padding: 8px 0; color: #6ee7b7; font-size: 14px;">Referral Discount (5%)</td>
          <td style="padding: 8px 0; text-align: right; color: #6ee7b7; font-size: 14px; white-space: nowrap;">-R${discount.toLocaleString()}</td>
        </tr>
      `
      : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Impact Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f0f0f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align: center; padding: 40px 20px; }
          .logo { font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .logo span { color: #c9a227; }
          .order-badge { display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(201,162,39,0.5); color: #c9a227; padding: 7px 18px; border-radius: 20px; font-size: 13px; margin-top: 16px; letter-spacing: 0.5px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .success-banner { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px 20px; border-radius: 10px; text-align: center; margin-bottom: 32px; }
          .success-banner h2 { margin: 0; font-size: 22px; font-weight: 700; }
          .section { margin-bottom: 28px; }
          .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 12px; font-weight: 700; }
          .info-box { background: #f8f9fa; border-radius: 8px; padding: 18px 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .items-table th { background: #1a1a2e; color: #ffffff; padding: 11px 14px; text-align: left; font-weight: 600; font-size: 13px; }
          .items-table th:nth-child(2) { text-align: center; width: 52px; }
          .items-table th:last-child { text-align: right; white-space: nowrap; }
          .items-table td { padding: 12px 14px; border-bottom: 1px solid #eeeeee; font-size: 14px; vertical-align: top; }
          .items-table td:nth-child(2) { text-align: center; color: #555; }
          .items-table td:last-child { text-align: right; font-weight: 500; white-space: nowrap; }
          .total-section { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; padding: 24px; border-radius: 10px; margin-top: 28px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #b8941d 100%); color: #1a1a2e; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; margin-top: 20px; font-size: 15px; }
          .footer { background: #1a1a2e; color: #999; text-align: center; padding: 30px; font-size: 12px; }
          .footer a { color: #c9a227; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Impact<span>Store</span></div>
            <div class="order-badge">Order #${orderNumber}</div>
          </div>

          <div class="content">
            <div class="success-banner">
              <h2>Payment Successful</h2>
              <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">Thank you for your order, ${name}</p>
            </div>

            <div class="section">
              <div class="section-title">Order Details</div>
              <div class="info-box">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 9px 0; border-bottom: 1px solid #e8e8e8; color: #555; font-size: 14px;">Order Number</td>
                    <td style="padding: 9px 0; border-bottom: 1px solid #e8e8e8; text-align: right; font-weight: 600; color: #1a1a2e; font-size: 14px;">#${orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 9px 0; border-bottom: 1px solid #e8e8e8; color: #555; font-size: 14px;">Order Date</td>
                    <td style="padding: 9px 0; border-bottom: 1px solid #e8e8e8; text-align: right; font-size: 14px;">${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 9px 0; color: #555; font-size: 14px;">Payment Status</td>
                    <td style="padding: 9px 0; text-align: right; color: #10b981; font-weight: 600; font-size: 14px;">Paid</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Items Ordered</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Shipping Address</div>
              <div class="info-box">
                <p style="margin: 0; font-weight: 600; color: #1a1a2e;">${shippingAddress.fullName}</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${shippingAddress.address}</p>
                <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">${shippingAddress.city}, ${shippingAddress.province}</p>
                <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">${shippingAddress.postalCode}</p>
              </div>
            </div>

            <div class="total-section">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.75); font-size: 14px;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #ffffff; font-size: 14px; white-space: nowrap;">R${subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.75); font-size: 14px;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right; color: #ffffff; font-size: 14px; white-space: nowrap;">R${shipping.toLocaleString()}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td style="padding: 14px 0 6px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 18px; font-weight: 700; color: #c9a227;">Total Paid</td>
                  <td style="padding: 14px 0 6px; border-top: 1px solid rgba(255,255,255,0.2); text-align: right; font-size: 18px; font-weight: 700; color: #c9a227; white-space: nowrap;">R${total.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #666; margin-bottom: 16px; font-size: 14px;">Track your order status in your account</p>
              <a href="${APP_URL}/profile" class="cta-button">View My Orders</a>
            </div>

            <div style="margin-top: 40px; padding: 22px 24px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #c9a227;">
              <p style="margin: 0 0 10px 0; font-weight: 700; color: #1a1a2e; font-size: 14px;">What happens next?</p>
              <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.9;">
                We will send you a shipping confirmation once your order is dispatched.<br>
                You can track your order status anytime in your profile.<br>
                Questions? Reply to this email or contact our support team.
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #fff;">Impact Store</p>
            <p style="margin: 0 0 5px 0;">ICT Hardware and Business Technology</p>
            <p style="margin: 0 0 5px 0; opacity: 0.8;">Impact Store is a trading name of Impact Holdings Group</p>
            <p style="margin: 15px 0 0 0;">
              <a href="${APP_URL}">Visit Website</a> |
              <a href="${APP_URL}/contact">Contact Support</a>
            </p>
            <p style="margin: 15px 0 0 0; opacity: 0.6;">This email was sent to ${to} regarding your order.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmed #${orderNumber} - Impact Store`,
    html,
    from: FROM_ORDERS,
    fromName: "Impact Store",
  });
}
