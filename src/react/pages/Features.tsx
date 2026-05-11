import React from 'react';
import { QrCode, ShieldCheck, History, CreditCard, CheckCircle2, MessageSquare, CalendarCheck } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-background antialiased">
      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-8 py-24">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-label-caps mb-6">THE NEW STANDARD</span>
          <h1 className="font-h1 text-h1 text-primary mb-8 leading-[1.1]">Everything you need for a <span className="text-secondary">premium community.</span></h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">MyGateBell redefines secure living with sophisticated modules designed for efficiency, transparency, and safety.</p>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="max-w-[1200px] mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Visitor Management */}
          <div className="md:col-span-8 bg-white rounded-[16px] ambient-shadow p-10 overflow-hidden relative group">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 text-secondary">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="font-h2 text-[32px] text-primary mb-4">Visitor Management</h3>
              <p className="font-body-md text-on-surface-variant max-w-md mb-8">Secure pre-approvals and lightning-fast QR entries. Transform the gate experience with a system that prioritizes both security and hospitality.</p>
              <div className="mt-auto grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-background p-4 rounded-xl border border-surface-variant/30">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                  <span className="font-semibold text-sm">Instant Verification</span>
                </div>
                <div className="flex items-center gap-3 bg-background p-4 rounded-xl border border-surface-variant/30">
                  <History className="w-5 h-5 text-secondary" />
                  <span className="font-semibold text-sm">Digital Logs</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-br from-secondary/10 to-transparent rounded-full opacity-50 blur-3xl"></div>
          </div>

          {/* Smart Accounting */}
          <div className="md:col-span-4 bg-primary-container rounded-[16px] p-10 text-white flex flex-col relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-secondary-fixed" />
              </div>
              <h3 className="font-h2 text-2xl mb-4 text-white">Smart Accounting</h3>
              <p className="font-body-md text-on-primary-container mb-8">Automated GST billing, payment reminders, and real-time ledger tracking for seamless society finances.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
                  Auto-generated Invoices
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
                  Multiple Payment Modes
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
                  Tally Integration
                </li>
              </ul>
            </div>
            <img
              alt="Accounting"
              className="absolute bottom-[-40px] left-0 w-full opacity-20 transform scale-125 object-cover grayscale brightness-150"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf6cZ1dg1QgF6Xd7HA1wyFesHSaFq5byHSxyefEfzaK9UALo2MAOlGs4Y4W_zrJGwzT8CnP_G-hHfLsSGsMc7Dz1LxaIfliKX_eEUngYl8iokTkm97Ej1GiQOGbX0v18wF5XeaUPDPSpoe2cll1EbKAG-kszC78SaEwDhb3QWPGrgL1A9vF-z0FSAvTsp_3J-3ZDJ6EDEArIgBJcT7ZZFdwUwmZrfiMM1U7W4Xol5WyEvSjKjdlUr23hy62ajiXrItVsXBAxcazz8"
            />
          </div>

          {/* Community Feed */}
          <div className="md:col-span-4 bg-white rounded-[16px] ambient-shadow p-10">
            <div className="w-12 h-12 bg-tertiary-fixed/30 rounded-xl flex items-center justify-center mb-6 text-on-tertiary-fixed-variant">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-h2 text-2xl text-primary mb-4">Community Feed</h3>
            <p className="font-body-md text-on-surface-variant text-sm">Foster a vibrant neighborhood with digital notices, polls, and classifieds in a private, secure environment.</p>
          </div>

          {/* Facility Booking */}
          <div className="md:col-span-8 bg-surface-container-low rounded-[16px] p-10 flex flex-col md:flex-row gap-8 items-center overflow-hidden">
            <div className="flex-1">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 text-secondary">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="font-h2 text-[32px] text-primary mb-4">Facility Booking</h3>
              <p className="font-body-md text-on-surface-variant mb-6">Manage common areas, clubhouses, and sports courts with an intelligent slots system and rule-based priority.</p>
              <button className="bg-primary text-white px-6 py-2.5 rounded-[10px] text-sm font-semibold hover:bg-secondary transition-colors">Learn More</button>
            </div>
            <div className="flex-1 relative">
              <div className="bg-white p-6 rounded-2xl ambient-shadow w-full max-w-[320px] mx-auto rotate-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-sm">Pool Deck Booking</span>
                  <span className="text-secondary text-xs font-bold uppercase">Active</span>
                </div>
                <div className="h-2 w-full bg-surface-variant rounded-full mb-4">
                  <div className="h-full w-2/3 bg-secondary rounded-full"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed"></div>
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed"></div>
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-container py-24 text-center">
        <div className="max-w-[1200px] mx-auto px-8">
          <h2 className="font-h2 text-h2 text-white mb-6">Ready to upgrade your society?</h2>
          <p className="text-on-primary-container font-body-lg max-w-2xl mx-auto mb-10">Join over 5,000+ premium communities who trust MyGateBell for their daily operations and security.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-secondary text-white px-8 py-4 rounded-[10px] font-bold text-lg hover:translate-y-[-2px] transition-transform">Request a Demo</button>
            <button className="border border-white/20 text-white px-8 py-4 rounded-[10px] font-bold text-lg hover:bg-white/5 transition-colors">Pricing Plans</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
