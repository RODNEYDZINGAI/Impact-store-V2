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
