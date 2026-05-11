import React from 'react';
import { Shield, Key, Network, EyeOff, CheckCircle2, Verified, Lock, ShieldCheck } from 'lucide-react';

const Security: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-background">
      {/* Hero Section */}
      <section className="hero-gradient pt-40 pb-32 text-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-label-caps text-blue-400">SECURE BY DESIGN</span>
            </div>
            <h1 className="font-h1 text-h1 mb-8">The Gold Standard of Community Trust.</h1>
            <p className="font-body-lg text-body-lg text-slate-400 mb-10 leading-relaxed">
              Security isn't a feature; it's our foundation. We employ bank-grade encryption and institutional-level protocols to ensure your data and access points remain impenetrable.
            </p>
            <div className="flex items-center gap-6">
              <img className="h-12 opacity-80 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRIHEKaiB2FNGd6Ri3_enVDJbIB1VPejKs-h04PYuTDHhsGj0U9jhRO7RBe5ZAd8vAYZF7zQmcrk8bsoXlnXRdjsTqnFCGuDhDxr0EXV0xpW_i7l34293qFSWMygGRf8sNyUr92Dw60AZyiH_xVGMupM2ZqVk7bXO_lRbvuorJ_a0Fl8AcjhR4GBDzDGFOI8BsoTa0fmcg4HsMtHrdljIDNR5txxjRd7qMUP2s3CJTdB_Bz_0F3JCA5EYNbpXac7LjVaWMPS3_RRk" alt="ISO Certification" />
              <img className="h-12 opacity-80 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsB9wV_WEp-CSS4yVAl6ltbytIM1m2rVT4RlkUxy_L0ddWdo7eZHFTJTvt_AtvvoR0E-882fev74kReifsEIr3AAyQJuKQzCCiwetw10KWaTmu4sPJhvW2CfsEH_a-aaxKM-xxwur0GsM7NMUkKwNvXf9p0eq30i0aj9y6luOHM2NnZcQGU8lpCL5ooQQxi0Fk2x6sTm-b66Hx9OaYaqqQxhLtXr0wqeVl3xKnX3_akh33moiYzxjAVVT_0R7AUSv7q38mptxbro4" alt="GDPR" />
              <img className="h-12 opacity-80 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtGGoV_Z7ew7weJmRWFaI2suCubJF8RzalNpY_hs1dv6ab1jqBLqbK-t55aHUiAwdfl5yt_dxU_-n936rCXAjviixcreur2k9V03SJ2zf78Nmn1crn1khLOayfpypQ9llCgtalvIdaOnDKbQ-90GNF-qe2B39HzTLAKAXKoCWVN-T6q0nUxa3V5gJyAvoRcZssGy_MPE9uN0hAUvAULdBT-1f6TS-RXzeBBTNK4C4-6gbPXd-TiOXbfYSuWNGtaKVfuFllxu4GY8o" alt="SOC2" />
            </div>
          </div>
        </div>
        {/* Decorative Shield Element */}
        <div className="absolute right-[-10%] top-[20%] opacity-10 pointer-events-none hidden lg:block">
          <Shield className="w-[600px] h-[600px]" />
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="py-[100px] bg-background">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-xl ambient-shadow border border-slate-100">
              <div className="w-14 h-14 bg-secondary/5 rounded-xl flex items-center justify-center mb-8">
                <Key className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-h2 text-[24px] mb-4">End-to-End Encryption</h3>
              <p className="font-body-md text-on-surface-variant">Every byte of data—from visitor logs to resident profiles—is encrypted using AES-256 standards both in transit and at rest.</p>
            </div>
            <div className="bg-white p-10 rounded-xl ambient-shadow border border-slate-100">
              <div className="w-14 h-14 bg-secondary/5 rounded-xl flex items-center justify-center mb-8">
                <Network className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-h2 text-[24px] mb-4">Zero-Trust Architecture</h3>
              <p className="font-body-md text-on-surface-variant">We operate on a 'never trust, always verify' model. Multi-factor authentication is mandatory for all administrative access points.</p>
            </div>
            <div className="bg-white p-10 rounded-xl ambient-shadow border border-slate-100">
              <div className="w-14 h-14 bg-secondary/5 rounded-xl flex items-center justify-center mb-8">
                <EyeOff className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-h2 text-[24px] mb-4">Privacy by Default</h3>
              <p className="font-body-md text-on-surface-variant">Data is anonymized wherever possible. MyGateBell never sells your community's data; we are providers, not brokers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Section */}
      <section className="pb-[100px] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-7/12">
            <span className="font-label-caps text-secondary mb-4 block">NETWORK INTEGRITY</span>
            <h2 className="font-h2 text-h2 mb-8">Infrastructure Built for Resilience.</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">99.99% Uptime SLA</h4>
                  <p className="text-on-surface-variant">Our distributed server network ensures that your security gates and access points never go offline, even during local outages.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Real-time Threat Monitoring</h4>
                  <p className="text-on-surface-variant">Automated systems scan for unusual patterns, DDoS attempts, and unauthorized access attempts 24/7/365.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Continuous Penetration Testing</h4>
                  <p className="text-on-surface-variant">We partner with independent cybersecurity firms to regularly attempt breaches, ensuring our defenses stay ahead of threats.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-5/12">
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/10 rounded-[32px] blur-2xl"></div>
              <img className="relative z-10 rounded-2xl ambient-shadow w-full aspect-square object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVh7wj7G3nusIekjHdOTGlehfLtR3_n7VW_T1p8_Yit_BACAYe41byZi-FZP3hLLxaPQir8rOiSeT0tunSy0B7JrMuuunDx1NobLUNmTlyM7giA5F1AWZp-tgrdszJ4pM0Drm7xKLGpKq-vISt_uqKMXe8EhB8oYoJCDtaJVbwRCwlW9blnXhhyTQGmhv6MkuH3XLm23wbdM2pA5WRSTKPXx11GmZC8rFYq3u_7Pbb-1AWC85-lXr3OsdY8PySj8OlIAtoBP5-nWE" alt="Server Racks" />
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Bento Grid */}
      <section className="py-[100px] bg-primary-container text-white">
        <div className="max-w-[1200px] mx-auto px-8 text-center mb-16">
          <h2 className="font-h2 text-h2 mb-4">Certified Compliance</h2>
          <p className="text-on-primary-container max-w-2xl mx-auto">We don't just ask for trust; we earn it through rigorous independent audits and global compliance certifications.</p>
        </div>
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-h2 text-2xl mb-4">ISO 27001 certified</h4>
              <p className="text-slate-400">The international standard for information security management systems (ISMS). We are audited annually to ensure compliance.</p>
            </div>
            <div className="mt-12 flex justify-end">
              <Verified className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-blue-400 mb-6" />
            <h4 className="font-bold text-xl mb-2">GDPR</h4>
            <p className="text-sm text-slate-400">Comprehensive data protection and privacy rights for all users globally.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <Lock className="w-8 h-8 text-blue-400 mb-6" />
            <h4 className="font-bold text-xl mb-2">CCPA</h4>
            <p className="text-sm text-slate-400">Strict adherence to California Consumer Privacy Act standards and regulations.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <Verified className="w-8 h-8 text-blue-400 mb-6" />
            <h4 className="font-bold text-xl mb-2">SOC2</h4>
            <p className="text-sm text-slate-400">Independent verification of our security controls and operational effectiveness.</p>
          </div>
          <div className="md:col-span-4 bg-secondary-container/20 border border-secondary-container/40 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="flex-1">
              <h4 className="font-h2 text-2xl mb-2">Ready to secure your community?</h4>
              <p className="text-blue-100">Review our full security whitepaper or speak with a specialist today.</p>
            </div>
            <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shrink-0">Download Whitepaper</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Security;
