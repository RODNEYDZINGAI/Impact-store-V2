import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

const EMAIL_DOMAIN = normalizeHost(process.env.RESEND_EMAIL_DOMAIN) || APP_DOMAIN;
const CONTACT_EMAIL = process.env.CONTACT_ADMIN_EMAIL || `info@${EMAIL_DOMAIN}`;

const FROM_SECURITY = resolveSender(
  process.env.RESEND_FROM_SECURITY ||
    process.env.RESEND_FROM_EMAIL,
  "security"
);
const FROM_ORDERS = resolveSender(
  process.env.RESEND_FROM_ORDERS ||
    process.env.RESEND_FROM_EMAIL,
  "orders"
);
const FROM_NOREPLY = resolveSender(
  process.env.RESEND_FROM_NOREPLY ||
    process.env.RESEND_FROM_EMAIL,
  "noreply"
);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = FROM_NOREPLY }: EmailOptions) {
  console.log(`[Email] Sending email from ${from} to ${to}`);
  console.log(`[Email] Subject: ${subject}`);
  console.log(`[Email] API Key exists: ${!!process.env.RESEND_API_KEY}`);
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set, email not sent");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error };
    }

    console.log("[Email] Sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Send error:", error);
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
          <td colspan="2" style="padding: 12px; text-align: right; color: #10b981;">Referral Discount (5%)</td>
          <td style="padding: 12px; text-align: right; color: #10b981;">-R${discount.toLocaleString()}</td>
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
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align: center; padding: 40px 20px; }
          .logo { font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .logo span { color: #c9a227; }
          .order-badge { display: inline-block; background: rgba(255,255,255,0.1); color: #c9a227; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-top: 15px; }
          .content { padding: 40px 30px; }
          .success-banner { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .success-banner h2 { margin: 0; font-size: 24px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 15px; font-weight: 600; }
          .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .items-table th { background: #1a1a2e; color: white; padding: 12px; text-align: left; font-weight: 600; }
          .items-table th:last-child { text-align: right; }
          .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .items-table td:last-child { text-align: right; }
          .total-section { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 25px; border-radius: 12px; margin-top: 30px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.grand-total { font-size: 20px; font-weight: 700; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #b8941d 100%); color: #1a1a2e; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          .footer { background: #1a1a2e; color: #999; text-align: center; padding: 30px; font-size: 12px; }
          .footer a { color: #c9a227; text-decoration: none; }
          @media (max-width: 600px) {
            .content { padding: 30px 20px; }
            .items-table { font-size: 14px; }
          }
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
              <h2>🎉 Payment Successful!</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your order, ${name}</p>
            </div>

            <div class="section">
              <div class="section-title">Order Details</div>
              <div class="info-box">
                <div class="info-row">
                  <span>Order Number</span>
                  <span style="font-weight: 600; color: #1a1a2e;">#${orderNumber}</span>
                </div>
                <div class="info-row">
                  <span>Order Date</span>
                  <span>${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div class="info-row">
                  <span>Payment Status</span>
                  <span style="color: #10b981; font-weight: 600;">✓ Paid</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Items Ordered</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
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
                <p style="margin: 0; font-weight: 600;">${shippingAddress.fullName}</p>
                <p style="margin: 5px 0 0 0; color: #666;">${shippingAddress.address}</p>
                <p style="margin: 5px 0 0 0; color: #666;">${shippingAddress.city}, ${shippingAddress.province}</p>
                <p style="margin: 5px 0 0 0; color: #666;">${shippingAddress.postalCode}</p>
              </div>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span>Subtotal</span>
                <span>R${subtotal.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Shipping</span>
                <span>R${shipping.toLocaleString()}</span>
              </div>
              ${discountRow}
              <div class="total-row grand-total">
                <span>Total Paid</span>
                <span>R${total.toLocaleString()}</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin-bottom: 20px;">You can track your order status in your account</p>
              <a href="${APP_URL}/profile" class="cta-button">View My Orders</a>
            </div>

            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; line-height: 1.8;">
                <strong>What's Next?</strong><br>
                • We'll send you a shipping confirmation email once your order is dispatched<br>
                • You can track your order status in your profile<br>
                • Questions? Reply to this email or contact our support team
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #fff;">Impact Store</p>
            <p style="margin: 0 0 5px 0;">ICT Hardware and Business Technology</p>
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
  });
}
