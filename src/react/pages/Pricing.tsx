import React, { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown } from "lucide-react";

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  // Track the index of the open FAQ. null means all are closed.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Can I upgrade my plan later?",
      a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle, and credits will be applied accordingly.",
    },
    {
      q: "Is there a setup fee?",
      a: "No, we believe in transparent pricing. There are no hidden setup fees for any of our standard plans.",
    },
    {
      q: "Do you offer discounts for non-profits?",
      a: "Yes! We offer a 15% discount for verified non-profit organizations and registered NGOs.",
    },
    {
      q: "How secure is resident data?",
      a: "Data security is our priority. We use AES-256 encryption and are fully GDPR and SOC2 compliant.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-background font-body-md text-on-surface">
      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 text-center py-16">
        <span className="bg-[#4F6EF7]/10 text-secondary px-4 py-1.5 rounded-full font-label-caps text-label-caps uppercase mb-6 inline-block">
          Transparent Pricing
        </span>
        <h1 className="font-h1 text-h1 text-primary mb-6">
          Invest in Secure <br />
          Community Access
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
          Choose the perfect plan for your residential or commercial complex.
          Scalable security designed for modern living.
        </p>
        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span
            className={`font-body-md font-semibold ${!isAnnual ? "text-on-surface" : "text-on-surface-variant"}`}
          >
            Monthly
          </span>
          {/* <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-primary-container rounded-full p-1 relative transition-colors"
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute transition-all ${isAnnual ? 'right-1' : 'left-1'}`}></div>
          </button> */}
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            // Added 'flex items-center' to ensure vertical centering
            className="w-14 h-8 bg-primary-container rounded-full p-1 relative transition-colors flex items-center"
            aria-label="Toggle billing cycle"
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`font-body-md font-semibold flex items-center gap-2 ${isAnnual ? "text-secondary" : "text-on-surface-variant"}`}
          >
            Annual{" "}
            <span className="bg-secondary-container text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Save 20%
            </span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-3 gap-8 mb-24">
        {/* Basic */}
        <div className="bg-white p-10 rounded-[16px] premium-shadow flex flex-col">
          <div className="mb-8">
            <h3 className="font-h2 text-2xl text-primary mb-2">Basic</h3>
            <p className="text-on-surface-variant font-body-md">
              Essential entry management for small communities.
            </p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold text-primary">
              {isAnnual ? "$39" : "$49"}
            </span>
            <span className="text-on-surface-variant font-body-md">/month</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">Up to 50 Units</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">Digital Visitor Log</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">QR Code Entry</span>
            </li>
            <li className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-slate-300" />
              <span className="font-body-md text-slate-400">
                Security AI Analytics
              </span>
            </li>
          </ul>
          <button className="w-full py-4 border-2 border-slate-200 text-primary font-semibold rounded-[10px] hover:bg-slate-50 transition-colors">
            Select Basic
          </button>
        </div>

        {/* Professional */}
        <div className="bg-white p-10 rounded-[16px] premium-shadow flex flex-col relative border-2 border-secondary overflow-hidden">
          <div className="absolute top-0 right-0 bg-secondary text-white px-6 py-1.5 rounded-bl-[16px] font-label-caps text-label-caps">
            MOST POPULAR
          </div>
          <div className="mb-8">
            <h3 className="font-h2 text-2xl text-primary mb-2">Professional</h3>
            <p className="text-on-surface-variant font-body-md">
              Advanced tools for growing residential complexes.
            </p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold text-primary">
              {isAnnual ? "$99" : "$129"}
            </span>
            <span className="text-on-surface-variant font-body-md">/month</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">Up to 250 Units</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">Automated Guest Invites</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">Vehicle Plate Recognition</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">Resident Mobile App</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-body-md">Custom Branding</span>
            </li>
          </ul>
          <button className="w-full py-4 bg-secondary text-white font-semibold rounded-[10px] hover:shadow-lg hover:shadow-blue-200 transition-all">
            Select Professional
          </button>
        </div>

        {/* Enterprise */}
        <div className="bg-primary-container p-10 rounded-[16px] premium-shadow flex flex-col text-white">
          <div className="mb-8">
            <h3 className="font-h2 text-2xl text-white mb-2">Enterprise</h3>
            <p className="text-slate-400 font-body-md">
              Full-scale security infrastructure for large estates.
            </p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold text-white">Custom</span>
            <span className="text-slate-400 font-body-md">/tailored</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary-fixed" />
              <span className="font-body-md">Unlimited Units</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary-fixed" />
              <span className="font-body-md">Biometric Integration</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary-fixed" />
              <span className="font-body-md">24/7 Priority Support</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary-fixed" />
              <span className="font-body-md">Dedicated Success Manager</span>
            </li>
          </ul>
          <button className="w-full py-4 bg-white text-primary font-semibold rounded-[10px] hover:bg-slate-100 transition-colors">
            Contact Sales
          </button>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <h2 className="font-h2 text-3xl text-primary text-center mb-16">
          Compare all features
        </h2>
        <div className="overflow-x-auto bg-white rounded-[16px] premium-shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-8 text-left font-h2 text-lg text-primary min-w-[300px]">
                  Feature
                </th>
                <th className="p-8 text-center font-h2 text-lg text-primary">
                  Basic
                </th>
                <th className="p-8 text-center font-h2 text-lg text-primary">
                  Professional
                </th>
                <th className="p-8 text-center font-h2 text-lg text-primary">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-8 font-semibold text-primary">
                  Maximum Units
                </td>
                <td className="p-8 text-center text-on-surface-variant">
                  50 Units
                </td>
                <td className="p-8 text-center text-on-surface-variant font-bold">
                  250 Units
                </td>
                <td className="p-8 text-center text-on-surface-variant">
                  Unlimited
                </td>
              </tr>
              <tr>
                <td className="p-8 font-semibold text-primary">
                  Visitor Pass (QR)
                </td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
              </tr>
              <tr>
                <td className="p-8 font-semibold text-primary">
                  Advanced Analytics
                </td>
                <td className="p-8 text-center">—</td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
              </tr>
              <tr>
                <td className="p-8 font-semibold text-primary">API Access</td>
                <td className="p-8 text-center">—</td>
                <td className="p-8 text-center">—</td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
              </tr>
              <tr>
                <td className="p-8 font-semibold text-primary">
                  Custom Branding
                </td>
                <td className="p-8 text-center">—</td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
                <td className="p-8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary inline-block" />
                </td>
              </tr>
              <tr>
                <td className="p-8 font-semibold text-primary">
                  Support Level
                </td>
                <td className="p-8 text-center text-on-surface-variant">
                  Email
                </td>
                <td className="p-8 text-center text-on-surface-variant">
                  Priority Chat
                </td>
                <td className="p-8 text-center text-on-surface-variant">
                  24/7 Priority Phone
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface-container-low py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="font-h2 text-3xl text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-[12px] shadow-sm"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-lg text-primary">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeIndex === index ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Conditional Rendering: Only show if activeIndex matches */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${activeIndex === index ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-on-surface-variant font-body-md leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="bg-primary rounded-[32px] p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxArLeC09-BF8RQcv4srTVO6NW9r0tRQjCsHp17bENZYuTdEsDqLyrIFMueZOZ8ncCoXrCagSFT2OT609IFt-h4KNvAIOEG7fFBGUpRRohU-sCr4NqnzsnilAf4jNeuKH8rc33YdyEyrKTjnLaIlJdIcEgNrF3QqwarIb9CQ4zo5UR0rFn-ciYMYQhSBhFs3getAWdO2Huu9U_1_GBklCP_2ydDFFn1B-l9VL6emD6HCEAsDZ5HGkn4N6O1pVdh-4LtvnlQyXEn4g"
              alt="Grid Overlay"
            />
          </div>
          <h2 className="font-h2 text-4xl mb-6 relative z-10">
            Ready to secure your gates?
          </h2>
          <p className="font-body-lg text-slate-300 mb-10 max-w-xl mx-auto relative z-10">
            Join 5,000+ communities who trust MyGateBell for their daily
            security and visitor management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button className="bg-secondary text-white px-8 py-4 rounded-[10px] font-bold text-lg hover:shadow-xl transition-all">
              Start Free Trial
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-[10px] font-bold text-lg hover:bg-white/20 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;