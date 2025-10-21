import { Shield, Lock, Eye, Database, UserCheck, Mail, FileText, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "October 21, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-slate-400">
            Your privacy is important to us
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <p className="text-slate-300 leading-relaxed m-0">
                At AI Universe, we are committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform.
              </p>
            </div>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-7 h-7 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white m-0">1. Information We Collect</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.1 Information You Provide</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                We collect information that you voluntarily provide to us when you:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Create an account (email address, name, password)</li>
                <li>Subscribe to our newsletter or premium plans</li>
                <li>Submit AI tools to our platform</li>
                <li>Contact our support team</li>
                <li>Participate in surveys or promotions</li>
                <li>Use our chat support feature</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.2 Automatically Collected Information</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                When you access our platform, we automatically collect:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Device information (browser type, operating system, device type)</li>
                <li>Usage data (pages viewed, time spent, click patterns)</li>
                <li>IP address and approximate geographic location</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Referral source and navigation patterns</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">1.3 Payment Information</h3>
              <p className="text-slate-300 leading-relaxed">
                Payment transactions are processed through Stripe. We do not store your credit card information on our servers.
                Stripe collects and processes payment data according to their privacy policy.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl font-bold text-white m-0">2. How We Use Your Information</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li><strong className="text-white">Account Management:</strong> Create and maintain your account, authenticate your identity</li>
                <li><strong className="text-white">Service Delivery:</strong> Provide access to AI Universe features and functionality</li>
                <li><strong className="text-white">Personalization:</strong> Customize content and recommendations based on your preferences</li>
                <li><strong className="text-white">Communication:</strong> Send updates, newsletters, support responses, and important notices</li>
                <li><strong className="text-white">Analytics:</strong> Analyze usage patterns to improve our platform and user experience</li>
                <li><strong className="text-white">Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                <li><strong className="text-white">Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
                <li><strong className="text-white">Marketing:</strong> Send promotional content (with your consent, where required)</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-7 h-7 text-blue-400" />
                <h2 className="text-2xl font-bold text-white m-0">3. Information Sharing and Disclosure</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Service Providers</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                We work with trusted third-party service providers who assist us in operating our platform:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li><strong className="text-white">Supabase:</strong> Database and authentication services</li>
                <li><strong className="text-white">Stripe:</strong> Payment processing</li>
                <li><strong className="text-white">Brevo:</strong> Email delivery services</li>
                <li><strong className="text-white">Vercel Analytics:</strong> Website analytics and performance monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Legal Requirements</h3>
              <p className="text-slate-300 leading-relaxed">
                We may disclose your information if required by law, court order, or government regulation, or to protect
                the rights, property, or safety of AI Universe, our users, or the public.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Business Transfers</h3>
              <p className="text-slate-300 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-7 h-7 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white m-0">4. Data Security</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted storage of sensitive data</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Monitoring for suspicious activity and security threats</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                While we strive to protect your information, no method of transmission over the internet or electronic storage
                is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-7 h-7 text-purple-400" />
                <h2 className="text-2xl font-bold text-white m-0">5. Cookies and Tracking Technologies</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Types of Cookies</h3>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li><strong className="text-white">Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong className="text-white">Authentication Cookies:</strong> Keep you logged in securely</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Managing Cookies</h3>
              <p className="text-slate-300 leading-relaxed">
                You can control cookies through your browser settings. However, disabling certain cookies may limit
                your ability to use some features of our platform.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-7 h-7 text-red-400" />
                <h2 className="text-2xl font-bold text-white m-0">6. Your Rights and Choices</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Access and Portability</h3>
              <p className="text-slate-300 leading-relaxed">
                You can access and download your personal information from your account settings.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Correction and Updates</h3>
              <p className="text-slate-300 leading-relaxed">
                You can update your account information at any time through your profile settings.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Deletion</h3>
              <p className="text-slate-300 leading-relaxed">
                You can request deletion of your account and associated data. Some information may be retained for
                legal or legitimate business purposes.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.4 Marketing Communications</h3>
              <p className="text-slate-300 leading-relaxed">
                You can opt out of marketing emails by clicking the unsubscribe link in any promotional email or
                updating your preferences in account settings.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.5 Do Not Track</h3>
              <p className="text-slate-300 leading-relaxed">
                Some browsers have "Do Not Track" features. Our platform does not currently respond to these signals.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-7 h-7 text-pink-400" />
                <h2 className="text-2xl font-bold text-white m-0">7. Children's Privacy</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                AI Universe is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children. If you believe we have collected information from a child, please contact us
                immediately so we can delete the information.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-7 h-7 text-orange-400" />
                <h2 className="text-2xl font-bold text-white m-0">8. International Data Transfers</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence.
                These countries may have different data protection laws. We ensure appropriate safeguards are in place
                to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-7 h-7 text-teal-400" />
                <h2 className="text-2xl font-bold text-white m-0">9. Data Retention</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the
                purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize
                your information within a reasonable timeframe, except where we are required to retain it for legal,
                regulatory, or legitimate business purposes.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-7 h-7 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white m-0">10. Changes to This Privacy Policy</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
                We will notify you of material changes by posting the updated policy on our platform and updating the
                "Last Updated" date. Your continued use of AI Universe after changes are posted constitutes your acceptance
                of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl font-bold text-white m-0">11. Contact Us</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="p-6 bg-slate-700/30 rounded-xl border border-slate-600">
                <p className="text-white font-semibold mb-2">AI Universe Support</p>
                <p className="text-slate-300">Email: novara.team.company@gmail.com</p>
                <p className="text-slate-300 mt-2">Support Page: <a href="/support" className="text-cyan-400 hover:text-cyan-300">AI Universe Support Center</a></p>
                <p className="text-slate-300 mt-4">
                  We will respond to your inquiries within 30 days.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-7 h-7 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white m-0">12. Additional Rights for Specific Jurisdictions</h2>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.1 GDPR Rights (EU/EEA Users)</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you are located in the European Union or European Economic Area, you have additional rights under GDPR:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Right to access your personal data</li>
                <li>Right to rectify inaccurate data</li>
                <li>Right to erasure (right to be forgotten)</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.2 CCPA Rights (California Users)</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="text-slate-300 space-y-2 ml-6">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to delete personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
            </section>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 text-center">
          <p className="text-slate-300 mb-4">
            This Privacy Policy is designed to be transparent and comprehensive. We value your trust and are
            committed to protecting your privacy.
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg font-semibold"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
