import { FileText, Scale, AlertCircle, UserCheck, Shield, CreditCard, Ban, Mail } from 'lucide-react';

export default function TermsOfUse() {
  const lastUpdated = "October 21, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6">
            <Scale className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Terms of Use</h1>
          <p className="text-xl text-slate-400">
            Please read these terms carefully before using AI Universe
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <p className="text-slate-300 leading-relaxed m-0">
                By accessing or using AI Universe, you agree to be bound by these Terms of Use and all applicable laws and regulations.
                If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
            </div>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-7 h-7 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white m-0">1. Acceptance of Terms</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                These Terms of Use constitute a legally binding agreement between you and AI Universe. By creating an account,
                accessing our website, or using our services, you acknowledge that you have read, understood, and agree to be
                bound by these terms.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Your continued use of the platform following any changes
                constitutes acceptance of those changes. We will notify you of material changes via email or through platform notifications.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl font-bold text-white m-0">2. Eligibility and Account Registration</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Age Requirement</h3>
              <p className="text-slate-300 leading-relaxed">
                You must be at least 13 years old to use AI Universe. If you are under 18, you must have parental or
                guardian consent to use our services.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Account Responsibilities</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                When creating an account, you agree to:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Account Termination</h3>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent
                activity, or use the platform in a manner that could harm AI Universe or other users.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-7 h-7 text-blue-400" />
                <h2 className="text-2xl font-bold text-white m-0">3. Acceptable Use Policy</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                You agree to use AI Universe only for lawful purposes and in accordance with these Terms. You agree NOT to:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Prohibited Activities</h3>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Transmit any harmful code, viruses, malware, or malicious software</li>
                <li>Attempt to gain unauthorized access to our systems or other user accounts</li>
                <li>Use automated systems (bots, scrapers) without explicit permission</li>
                <li>Reverse engineer, decompile, or disassemble any part of our platform</li>
                <li>Interfere with or disrupt the integrity or performance of the platform</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Collect or harvest personal data from other users</li>
                <li>Use the platform for spam, advertising, or commercial solicitation without permission</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Bypass any measures designed to prevent or restrict access to the platform</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Content Standards</h3>
              <p className="text-slate-300 leading-relaxed">
                Any content you submit (tool submissions, reviews, comments) must not contain material that is unlawful,
                defamatory, obscene, offensive, discriminatory, or infringes on intellectual property rights.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-7 h-7 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white m-0">4. User Content and Submissions</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Content Ownership</h3>
              <p className="text-slate-300 leading-relaxed">
                You retain ownership of any content you submit to AI Universe. However, by submitting content, you grant
                us a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, display,
                and perform your content in connection with operating and promoting our platform.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Tool Submissions</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                When submitting AI tools to our platform:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>You must have the right to submit the information</li>
                <li>Information must be accurate and not misleading</li>
                <li>You must not submit tools you have a financial interest in without disclosure</li>
                <li>We reserve the right to reject, modify, or remove any submission</li>
                <li>Premium members receive priority review but approval is not guaranteed</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Content Moderation</h3>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right, but have no obligation, to monitor, review, and remove content that violates these
                terms or is otherwise objectionable at our sole discretion.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-7 h-7 text-purple-400" />
                <h2 className="text-2xl font-bold text-white m-0">5. Intellectual Property Rights</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Platform Content</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                The AI Universe platform, including its design, features, software, code, text, graphics, logos, and other
                content (excluding user-submitted content), is owned by AI Universe and protected by intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Limited License</h3>
              <p className="text-slate-300 leading-relaxed">
                We grant you a limited, non-exclusive, non-transferable license to access and use AI Universe for personal
                or internal business purposes. This license does not include any right to:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6 mt-3">
                <li>Reproduce, duplicate, or copy the platform</li>
                <li>Sell, resell, or commercially exploit the platform</li>
                <li>Modify or create derivative works based on the platform</li>
                <li>Use the platform for any commercial purpose without our consent</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Trademarks</h3>
              <p className="text-slate-300 leading-relaxed">
                "AI Universe" and related marks are trademarks of AI Universe. You may not use these trademarks without
                our prior written permission.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl font-bold text-white m-0">6. Subscriptions and Payments</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Subscription Plans</h3>
              <p className="text-slate-300 leading-relaxed">
                AI Universe offers Free, Plus, and Pro subscription plans. Features and pricing are detailed on our Pricing page
                and may be changed at any time with notice to active subscribers.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Payment Terms</h3>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                <li>All payments are processed securely through Stripe</li>
                <li>Prices are in USD unless otherwise stated</li>
                <li>You authorize us to charge your payment method for applicable fees</li>
                <li>Failed payments may result in suspension or termination of service</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Cancellation and Refunds</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                You may cancel your subscription at any time from your account settings:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>You will retain access to paid features until the end of your billing period</li>
                <li>No refunds are provided for partial months or unused time</li>
                <li>Refunds may be issued at our discretion for exceptional circumstances</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.4 Price Changes</h3>
              <p className="text-slate-300 leading-relaxed">
                We may change subscription prices at any time. Price changes will not affect current subscribers until
                their next billing cycle, and we will provide at least 30 days notice of any price increases.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
                <h2 className="text-2xl font-bold text-white m-0">7. Disclaimers and Limitations of Liability</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Service "As Is"</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                AI Universe is provided "as is" and "as available" without warranties of any kind, either express or implied,
                including but not limited to:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                <li>Guarantees of uninterrupted, timely, secure, or error-free service</li>
                <li>Guarantees regarding the accuracy or reliability of information on the platform</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Third-Party Tools</h3>
              <p className="text-slate-300 leading-relaxed">
                AI Universe provides information about third-party AI tools. We do not endorse, warrant, or guarantee
                these tools. We are not responsible for the performance, quality, or conduct of third-party tools or services.
                Your use of third-party tools is at your own risk.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.3 Limitation of Liability</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                To the maximum extent permitted by law, AI Universe and its affiliates, officers, employees, and agents
                shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including
                but not limited to:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Loss of profits, data, use, or goodwill</li>
                <li>Service interruptions or errors</li>
                <li>Cost of substitute services</li>
                <li>Any damages resulting from your use of or inability to use the platform</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Our total liability to you for all claims arising from or related to these terms or your use of the platform
                shall not exceed the amount you paid to us in the 12 months preceding the claim, or $100 USD, whichever is greater.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.4 Indemnification</h3>
              <p className="text-slate-300 leading-relaxed">
                You agree to indemnify, defend, and hold harmless AI Universe and its affiliates from any claims, liabilities,
                damages, losses, costs, or expenses arising from your use of the platform, violation of these terms, or
                infringement of any rights of another person or entity.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-7 h-7 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white m-0">8. Privacy and Data Protection</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Your use of AI Universe is also governed by our Privacy Policy, which is incorporated into these Terms by reference.
                Please review our <a href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a> to
                understand how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Ban className="w-7 h-7 text-orange-400" />
                <h2 className="text-2xl font-bold text-white m-0">9. Termination</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.1 Termination by You</h3>
              <p className="text-slate-300 leading-relaxed">
                You may terminate your account at any time by deleting your account through the settings page or by
                contacting our support team.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.2 Termination by Us</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                We may suspend or terminate your access to AI Universe immediately, without prior notice or liability, for any reason,
                including if you:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Breach these Terms of Use</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Violate the rights of other users or third parties</li>
                <li>Pose a security or legal risk to AI Universe</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.3 Effect of Termination</h3>
              <p className="text-slate-300 leading-relaxed">
                Upon termination, your right to use AI Universe will immediately cease. We may delete your account and
                content at our discretion. Provisions that by their nature should survive termination shall survive,
                including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-7 h-7 text-pink-400" />
                <h2 className="text-2xl font-bold text-white m-0">10. Dispute Resolution</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.1 Governing Law</h3>
              <p className="text-slate-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where
                AI Universe is registered, without regard to conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.2 Dispute Resolution Process</h3>
              <p className="text-slate-300 leading-relaxed">
                In the event of any dispute, claim, or controversy arising from or relating to these Terms or the platform,
                you agree to first contact us to attempt to resolve the dispute informally. If we cannot resolve the dispute
                within 30 days, either party may pursue formal dispute resolution.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.3 Arbitration</h3>
              <p className="text-slate-300 leading-relaxed">
                Any disputes not resolved informally shall be resolved through binding arbitration, except where prohibited
                by law. You waive any right to a jury trial or to participate in a class action lawsuit.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-7 h-7 text-teal-400" />
                <h2 className="text-2xl font-bold text-white m-0">11. General Provisions</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.1 Entire Agreement</h3>
              <p className="text-slate-300 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and AI Universe
                regarding use of the platform.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.2 Severability</h3>
              <p className="text-slate-300 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited
                or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.3 Waiver</h3>
              <p className="text-slate-300 leading-relaxed">
                Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.4 Assignment</h3>
              <p className="text-slate-300 leading-relaxed">
                You may not assign or transfer these Terms or your rights hereunder without our prior written consent.
                We may assign these Terms without restriction.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.5 Force Majeure</h3>
              <p className="text-slate-300 leading-relaxed">
                We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable
                control, including natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities,
                fire, floods, accidents, network infrastructure failures, or other events beyond our control.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl font-bold text-white m-0">12. Contact Information</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you have any questions about these Terms of Use, please contact us:
              </p>
              <div className="p-6 bg-slate-700/30 rounded-xl border border-slate-600">
                <p className="text-white font-semibold mb-2">AI Universe Legal Team</p>
                <p className="text-slate-300">Email: novara.team.company@gmail.com</p>
                <p className="text-slate-300 mt-2">Support Page: <a href="/support" className="text-cyan-400 hover:text-cyan-300">AI Universe Support Center</a></p>
              </div>
            </section>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">Important Notice</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                By using AI Universe, you acknowledge that you have read, understood, and agree to be bound by these
                Terms of Use. If you do not agree to these terms, please do not use our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
