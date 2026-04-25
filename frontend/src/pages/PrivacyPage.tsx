import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500 mb-3">Legal</p>
        <h1
          className="text-white mb-2"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-500 mb-12">Last updated: April 25, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-3">1. Overview</h2>
            <p>
              The Locker Room (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates thelockerroom.app. This Privacy Policy explains
              how we collect, use, and protect information when you use our platform. We are committed to
              protecting student-athlete privacy and will never sell personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Account information:</strong> Your university email address (.edu only), full name, and password (hashed — we never store plaintext passwords).</li>
              <li><strong className="text-white">Athletic profile:</strong> Your school, sport, gender division, and graduation year.</li>
              <li><strong className="text-white">Verification evidence:</strong> Roster links or other documentation submitted for athlete verification. This is reviewed by our team and never displayed publicly.</li>
              <li><strong className="text-white">Reviews:</strong> Anonymous program reviews you submit. Reviews are linked to your account internally for moderation purposes but are never publicly attributed to you.</li>
              <li><strong className="text-white">Usage data:</strong> Pages visited, interactions, and session data collected via Vercel Analytics (aggregated, no personal identifiers).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To verify your student-athlete status before allowing review submissions.</li>
              <li>To maintain the integrity of anonymous reviews and prevent abuse.</li>
              <li>To send transactional emails (verification confirmation, account-related notices).</li>
              <li>To improve the platform based on aggregated usage analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">4. Anonymity of Reviews</h2>
            <p>
              All reviews are published anonymously. Your name, email, and specific identifying information
              are never displayed alongside your review. We internally retain the association between your
              account and your review solely to enforce our content policies (e.g., removing content that
              violates our Terms of Service).
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">5. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Supabase:</strong> Our database and authentication provider. Data is stored in US-based servers.</li>
              <li><strong className="text-white">Vercel:</strong> Our hosting provider. Vercel Analytics collects aggregated, anonymized traffic data.</li>
              <li><strong className="text-white">Law enforcement:</strong> If required by law or to prevent harm.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you request account
              deletion, we will remove your personal information within 30 days. Published reviews may
              be retained in anonymized, de-identified form to preserve the integrity of program ratings.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us at{" "}
              <a href="mailto:privacy@thelockerroom.app" className="text-yellow-500 hover:text-yellow-400">
                privacy@thelockerroom.app
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">8. Contact</h2>
            <p>
              Questions about this Privacy Policy?{" "}
              <a href="mailto:privacy@thelockerroom.app" className="text-yellow-500 hover:text-yellow-400">
                privacy@thelockerroom.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
