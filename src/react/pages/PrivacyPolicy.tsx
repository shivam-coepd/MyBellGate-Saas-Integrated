import React, { useState } from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Bell, Globe, Mail, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
      <button
        className="w-full flex items-center justify-between px-8 py-6 bg-white hover:bg-slate-50 transition-colors text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <h2 className="font-h2 text-xl text-primary">{title}</h2>
        {open ? <ChevronUp className="w-5 h-5 text-secondary shrink-0" /> : <ChevronDown className="w-5 h-5 text-secondary shrink-0" />}
      </button>
      {open && (
        <div className="px-8 pb-8 pt-2 bg-white text-on-surface-variant font-body-md leading-relaxed space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

const PrivacyPolicy: React.FC = () => {
  const highlights = [
    { icon: <Eye className="w-6 h-6 text-secondary" />, title: 'Transparent Collection', desc: 'We only collect data that is necessary to deliver our services.' },
    { icon: <Lock className="w-6 h-6 text-secondary" />, title: 'AES-256 Encryption', desc: 'All data is encrypted in transit and at rest using bank-grade standards.' },
    { icon: <UserCheck className="w-6 h-6 text-secondary" />, title: 'Your Rights', desc: 'Access, correct, or delete your personal data at any time.' },
    { icon: <Database className="w-6 h-6 text-secondary" />, title: 'No Data Selling', desc: 'We never sell or rent your personal information to third parties.' },
  ];

  return (
    <div className="bg-background font-body-md text-on-background">
      {/* Hero */}
      <section className="hero-gradient pt-40 pb-24 text-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-label-caps text-blue-400 uppercase tracking-widest text-xs font-bold">PRIVACY POLICY</span>
            </div>
            <h1 className="font-h1 text-h1 mb-6">Your Privacy, Our Responsibility.</h1>
            <p className="font-body-lg text-body-lg text-slate-400 mb-6 leading-relaxed max-w-2xl">
              At MyGateBell, we believe privacy is a fundamental right. This policy explains what data we collect, how we use it, and the controls you have over it.
            </p>
            <p className="text-sm text-slate-500">Last updated: <span className="text-slate-300">June 1, 2026</span></p>
          </div>
        </div>
        <div className="absolute right-[-8%] top-[15%] opacity-10 pointer-events-none hidden lg:block">
          <Shield className="w-[500px] h-[500px]" />
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((h) => (
            <div key={h.title} className="flex flex-col gap-3">
              <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center">
                {h.icon}
              </div>
              <h3 className="font-bold text-primary text-base">{h.title}</h3>
              <p className="text-sm text-on-surface-variant">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-20 bg-background">
        <div className="max-w-[900px] mx-auto px-8">

          <Section title="1. Information We Collect">
            <p>We collect information to provide and improve our services. The categories of data we collect include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, and profile photo when you register.</li>
              <li><strong>Society & Residence Data:</strong> Society name, flat/unit number, tower, and role (resident, admin, guard).</li>
              <li><strong>Visitor & Entry Logs:</strong> Visitor names, vehicle numbers, entry/exit timestamps, and photos captured at the gate.</li>
              <li><strong>Device Information:</strong> Device type, OS version, app version, and push notification tokens for service delivery.</li>
              <li><strong>Usage Data:</strong> Feature interactions, session duration, and crash reports to improve app performance.</li>
              <li><strong>Payment Information:</strong> Billing details for society maintenance payments, processed securely via our payment partners. We do not store raw card data.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>Your data is used solely to operate, maintain, and improve MyGateBell services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authenticating users and managing access to the platform.</li>
              <li>Processing visitor approvals, delivery notifications, and gate entry logs.</li>
              <li>Sending real-time security alerts and push notifications.</li>
              <li>Generating society management reports for administrators.</li>
              <li>Processing maintenance fee payments and generating receipts.</li>
              <li>Providing customer support and resolving disputes.</li>
              <li>Complying with legal obligations and responding to lawful requests.</li>
            </ul>
            <p>We do not use your data for advertising profiling or sell it to any third party.</p>
          </Section>

          <Section title="3. Data Sharing & Third Parties">
            <p>We share data only in the following limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Within Your Society:</strong> Resident data is visible to society administrators and security guards only to the extent required for gate management.</li>
              <li><strong>Service Providers:</strong> We engage trusted vendors (cloud hosting, payment gateways, SMS/email providers) under strict data processing agreements. They may not use your data for their own purposes.</li>
              <li><strong>Legal Requirements:</strong> We may disclose data when required by law, court order, or to protect the rights and safety of our users.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, user data may be transferred. We will notify you before any such transfer takes effect.</li>
            </ul>
            <p>We never sell, rent, or trade your personal information.</p>
          </Section>

          <Section title="4. Data Retention">
            <p>We retain your personal data for as long as your account is active or as needed to provide services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account data is retained for the duration of your active account plus 90 days after deletion.</li>
              <li>Visitor and entry logs are retained for 12 months by default, configurable by society administrators.</li>
              <li>Payment records are retained for 7 years to comply with financial regulations.</li>
              <li>Anonymized, aggregated analytics data may be retained indefinitely.</li>
            </ul>
          </Section>

          <Section title="5. Your Rights & Choices">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information via your profile settings or by contacting us.</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated personal data, subject to legal retention requirements.</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to certain types of processing, including direct communications.</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time without affecting prior processing.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:privacy@mygatebell.com" className="text-secondary underline">privacy@mygatebell.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="6. Security Measures">
            <p>We implement industry-leading security practices to protect your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AES-256 encryption for all data at rest and TLS 1.3 for data in transit.</li>
              <li>Multi-factor authentication for all administrative access.</li>
              <li>Regular third-party penetration testing and security audits.</li>
              <li>Role-based access controls ensuring staff access only what they need.</li>
              <li>Automated anomaly detection and 24/7 security monitoring.</li>
            </ul>
            <p>Despite these measures, no system is 100% secure. We encourage you to use a strong, unique password and enable two-factor authentication on your account.</p>
          </Section>

          <Section title="7. Cookies & Tracking">
            <p>Our web platform uses cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and core platform functionality. Cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform (e.g., page views, session duration). You may opt out via your browser settings.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings such as language and display preferences.</li>
            </ul>
            <p>You can manage cookie preferences through your browser settings. Disabling non-essential cookies will not affect core functionality.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>MyGateBell services are not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately at <a href="mailto:privacy@mygatebell.com" className="text-secondary underline">privacy@mygatebell.com</a> and we will delete it promptly.</p>
          </Section>

          <Section title="9. International Data Transfers">
            <p>MyGateBell primarily stores and processes data within India. If data is transferred internationally (e.g., to cloud infrastructure providers), we ensure appropriate safeguards are in place, including standard contractual clauses and data processing agreements compliant with applicable regulations including GDPR and India's DPDP Act 2023.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Update the "Last updated" date at the top of this page.</li>
              <li>Send an in-app notification and/or email to registered users.</li>
              <li>Provide a 30-day notice period before significant changes take effect.</li>
            </ul>
            <p>Continued use of our services after the effective date constitutes acceptance of the updated policy.</p>
          </Section>

          {/* Contact Card */}
          <div className="mt-12 bg-primary-container rounded-2xl p-10 text-white flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1">
              <h3 className="font-h2 text-2xl mb-3">Questions about your privacy?</h3>
              <p className="text-on-primary-container mb-6">Our Data Protection Officer is here to help. Reach out and we'll respond within 2 business days.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:privacy@mygatebell.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  privacy@mygatebell.com
                </a>
                <a
                  href="https://mygatebell.com"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  mygatebell.com
                </a>
              </div>
            </div>
            <Bell className="w-20 h-20 text-white/10 shrink-0 hidden md:block" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
