import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-500 mb-12">Last updated: April 25, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using The Locker Room (&quot;Platform,&quot; &quot;we,&quot; &quot;our&quot;), you agree to
              these Terms of Service. If you disagree with any part of these terms, you may not access the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">2. Eligibility</h2>
            <p>
              The Locker Room is exclusively for current and former collegiate student-athletes. You must:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide a valid .edu university email address.</li>
              <li>Submit verifiable evidence of your roster membership.</li>
              <li>Be at least 18 years of age, or have parental consent if under 18.</li>
              <li>Only create one account per person.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">3. Review Standards</h2>
            <p>When submitting reviews, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Only review programs at institutions where you were a current or former roster member.</li>
              <li>Provide honest, factual assessments based on your personal experience.</li>
              <li>Not submit defamatory, false, or misleading content.</li>
              <li>Not include personal identifying information about coaches, staff, or other athletes by name in a harmful context.</li>
              <li>Not use the Platform to harass, threaten, or bully any individual.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">4. Content Moderation</h2>
            <p>
              We reserve the right to review, approve, reject, or remove any content that violates these
              Terms or our community standards. All reviews undergo manual moderation before publication.
              We may terminate accounts that repeatedly submit policy-violating content.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">5. Anonymity and Confidentiality</h2>
            <p>
              Reviews are published anonymously. However, we maintain internal records linking reviews to
              accounts for moderation purposes. In cases of legal compulsion or credible threats of harm,
              we may be required to disclose account information to appropriate authorities.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">6. Intellectual Property</h2>
            <p>
              By submitting a review, you grant The Locker Room a non-exclusive, royalty-free license to
              display, distribute, and use your review content on the Platform. You retain ownership of
              your original content. The Locker Room retains all rights to the Platform, its design,
              code, and aggregated data products.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The Platform is provided &quot;as is&quot; without warranties of any kind. Program ratings and
              reviews represent the opinions of individual athletes and do not constitute endorsements
              or official assessments by The Locker Room. We make no guarantees about the accuracy or
              completeness of ratings data.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, The Locker Room is not liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">9. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the Platform after changes
              constitutes acceptance of the revised Terms. We will notify users of material changes
              via email.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">10. Contact</h2>
            <p>
              Questions about these Terms?{" "}
              <a href="mailto:legal@thelockerroom.app" className="text-yellow-500 hover:text-yellow-400">
                legal@thelockerroom.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
