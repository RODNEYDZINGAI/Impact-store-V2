import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const EMAIL_MODULE = "src/lib/email.ts";
const MAILEROO_ENDPOINT = "smtp.maileroo.com/api/v2/emails";

test("email module uses Maileroo instead of Resend", () => {
  const content = readFileSync(EMAIL_MODULE, "utf8");

  // Should NOT import Resend
  assert.doesNotMatch(content, /from\s+["']resend["']/, "should not import from resend");
  assert.doesNotMatch(content, /new\s+Resend/, "should not instantiate Resend client");

  // Should use Maileroo endpoint
  assert.match(content, new RegExp(MAILEROO_ENDPOINT), "should reference Maileroo endpoint");

  // Should use MAILEROO_ env vars, not RESEND_
  assert.match(content, /MAILEROO_SENDING_KEY/, "should use MAILEROO_SENDING_KEY");
  assert.doesNotMatch(content, /RESEND_API_KEY/, "should not reference RESEND_API_KEY");
  assert.doesNotMatch(content, /RESEND_EMAIL_DOMAIN/, "should not reference RESEND_EMAIL_DOMAIN");
  assert.doesNotMatch(content, /RESEND_FROM_/, "should not reference RESEND_FROM_* env vars");
});

test("package.json does not depend on resend", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));

  assert.ok(!pkg.dependencies?.resend, "resend should not be in dependencies");
  assert.ok(!pkg.devDependencies?.resend, "resend should not be in devDependencies");
});

test("email module builds Maileroo-compatible from address objects", () => {
  const content = readFileSync(EMAIL_MODULE, "utf8");

  // Maileroo uses { address, display_name } for from field
  assert.match(content, /address.*display_name/, "should include Maileroo EmailObject shape for from address");
});

test("email module supports reply_to parameter for Maileroo", () => {
  const content = readFileSync(EMAIL_MODULE, "utf8");

  assert.match(content, /reply_to/, "should include reply_to for Maileroo");
  assert.match(content, /MAILEROO_REPLY_TO_EMAIL/, "should use MAILEROO_REPLY_TO_EMAIL env var");
});

test("order confirmation email footer includes Impact Holdings Group trading-name disclosure", () => {
  const content = readFileSync(EMAIL_MODULE, "utf8");

  // The sendOrderConfirmationEmail template must carry the trading-name statement
  const orderFnStart = content.indexOf("export async function sendOrderConfirmationEmail(");
  assert.ok(orderFnStart !== -1, "sendOrderConfirmationEmail must exist");

  const orderFnBody = content.slice(orderFnStart);
  assert.match(
    orderFnBody,
    /Impact Store is a trading name of Impact Holdings Group/,
    "order confirmation email must state the trading name of Impact Holdings Group"
  );
});

test("quote acknowledgment email footer includes Impact Holdings Group trading-name disclosure", () => {
  const content = readFileSync(EMAIL_MODULE, "utf8");

  const quoteFnStart = content.indexOf("export async function sendQuoteAcknowledgmentEmail(");
  assert.ok(quoteFnStart !== -1, "sendQuoteAcknowledgmentEmail must exist");

  const quoteFnBody = content.slice(quoteFnStart);
  assert.match(
    quoteFnBody,
    /Impact Store is a trading name of Impact Holdings Group/,
    "quote acknowledgment email must state the trading name of Impact Holdings Group"
  );
});

test("all email-sending functions route through the shared sendEmail helper", () => {
  const content = readFileSync(EMAIL_MODULE, "utf8");

  // Every exported async function that sends email must call sendEmail().
  // We find each function's body by slicing from its declaration to the
  // next exported function declaration (or end-of-file), avoiding fixed
  // char-count limits that break on large template strings.
  const fnNames = [
    "sendWelcomeEmail",
    "sendPasswordResetEmail",
    "sendVerificationCodeEmail",
    "sendPasswordChangedEmail",
    "sendContactInquiryEmail",
    "sendContactAcknowledgmentEmail",
    "sendQuoteRequestEmail",
    "sendQuoteAcknowledgmentEmail",
    "sendOrderConfirmationEmail",
  ];

  for (let i = 0; i < fnNames.length; i++) {
    const fn = fnNames[i];
    const start = content.indexOf(`export async function ${fn}(`);
    if (start === -1) continue;
    // Slice up to the next exported declaration or end of file
    const nextExport = content.indexOf("\nexport ", start + 1);
    const body = nextExport === -1 ? content.slice(start) : content.slice(start, nextExport);
    assert.match(body, /return sendEmail\(/, `${fn} must delegate to sendEmail()`);
  }

  // Only one raw fetch call to the Maileroo API endpoint exists in the module
  const fetchMatches = [...content.matchAll(/await fetch\(MAILEROO_API/g)];
  assert.equal(fetchMatches.length, 1, "only sendEmail() itself should call fetch(MAILEROO_API)");
});
