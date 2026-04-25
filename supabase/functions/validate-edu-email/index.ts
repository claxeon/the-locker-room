/**
 * Supabase Auth Hook — validate-edu-email
 *
 * PURPOSE
 * -------
 * This Edge Function acts as a "before user is created" Auth Hook (also called
 * a "signup hook" or "custom access token hook" for pre-signup validation).
 * It rejects any signup whose email address does not end in .edu.
 *
 * HOW TO REGISTER IN THE SUPABASE DASHBOARD
 * ------------------------------------------
 * 1. Deploy this function:
 *      supabase functions deploy validate-edu-email --no-verify-jwt
 *
 * 2. In the Supabase Dashboard → Authentication → Hooks:
 *      Hook type:  "Before user is created" (signup hook)
 *      URL:        https://<your-project-ref>.supabase.co/functions/v1/validate-edu-email
 *      Secret:     Set SUPABASE_WEBHOOK_SECRET in your project env vars
 *                  (Dashboard → Settings → Edge Functions → Secrets)
 *                  The same value must be provided as the Authorization header
 *                  in the hook configuration — Supabase sends it automatically
 *                  as "Bearer <secret>".
 *
 * 3. Under Dashboard → Settings → Edge Functions, add the secret:
 *      SUPABASE_WEBHOOK_SECRET=<your-random-secret>
 *
 * PAYLOAD SHAPE (sent by Supabase Auth)
 * --------------------------------------
 * {
 *   "type": "signup",
 *   "event": {
 *     "user": {
 *       "email": "student@university.edu",
 *       ...
 *     },
 *     ...
 *   }
 * }
 *
 * RETURN CONTRACT
 * ---------------
 * - Allow:  HTTP 200 with the original event payload echoed back (or augmented).
 * - Block:  HTTP 422 with { "error": "<message>" } — Supabase surfaces this
 *           error to the client automatically.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthUser {
  id?: string;
  email?: string;
  phone?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AuthHookEvent {
  user: AuthUser;
  [key: string]: unknown;
}

interface AuthHookPayload {
  type: string;
  event: AuthHookEvent;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EDU_SUFFIX = ".edu";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Verify that the incoming request was sent by Supabase using the shared
 * SUPABASE_WEBHOOK_SECRET. The secret is passed as a Bearer token in the
 * Authorization header.
 */
function verifyWebhookSecret(req: Request): boolean {
  const webhookSecret = Deno.env.get("SUPABASE_WEBHOOK_SECRET");

  // If no secret is configured, fail closed — do not allow unauthenticated calls.
  if (!webhookSecret) {
    console.error(
      "[validate-edu-email] SUPABASE_WEBHOOK_SECRET env var is not set. Blocking request."
    );
    return false;
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.warn("[validate-edu-email] Missing Authorization header.");
    return false;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    console.warn("[validate-edu-email] Malformed Authorization header.");
    return false;
  }

  // Constant-time comparison to prevent timing attacks.
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(webhookSecret);
  const tokenBytes = encoder.encode(token);

  if (secretBytes.length !== tokenBytes.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < secretBytes.length; i++) {
    mismatch |= secretBytes[i] ^ tokenBytes[i];
  }

  return mismatch === 0;
}

/**
 * Returns true if the email ends with ".edu" (case-insensitive).
 * Also handles sub-domains like "student@mail.university.edu".
 */
function isEduEmail(email: string): boolean {
  return email.toLowerCase().trim().endsWith(EDU_SUFFIX);
}

// ---------------------------------------------------------------------------
// JSON response helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {
  // Only accept POST requests — Supabase Auth hooks always POST.
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  // Verify the shared secret before processing anything.
  if (!verifyWebhookSecret(req)) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  // Parse the incoming JSON payload.
  let payload: AuthHookPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  // Extract the user's email from the hook event.
  const email: string | undefined = payload?.event?.user?.email;

  if (!email) {
    // No email present — block the signup to be safe.
    console.warn("[validate-edu-email] No email found in hook payload.");
    return jsonResponse(
      {
        error:
          "An email address is required. Please sign up with your university .edu email.",
      },
      422
    );
  }

  // Core business rule: only .edu email addresses are permitted.
  if (!isEduEmail(email)) {
    console.log(
      `[validate-edu-email] Blocked signup for non-.edu email: ${email}`
    );
    return jsonResponse(
      {
        error:
          "Only .edu email addresses are permitted. Please sign up with your university email.",
      },
      422
    );
  }

  // Email is valid — echo the original payload back to allow signup to proceed.
  console.log(
    `[validate-edu-email] Approved signup for .edu email: ${email}`
  );
  return jsonResponse(payload, 200);
});
