import React from 'react';
import { Shield, Users } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-surface">
      {/* Hero Section */}
      <section className="hero-gradient py-8 md:py-16 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-1 md:grid-cols-12 items-center gap-16">
          <div className="md:col-span-7">
            <span className="text-label-caps font-label-caps text-secondary uppercase tracking-widest mb-6 block">Our Story</span>
            <h1 className="font-h1 text-h1 text-white/80 mb-8">Securing 1,000+ communities across India.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              MyGateBell is more than just a security app. We are the digital backbone of modern community living, ensuring safety, convenience, and peace of mind for millions of residents from Mumbai to Meghalaya.
            </p>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden editorial-shadow">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoILLJGd6CRO-7cojjiW-4NSzxXva3Z06kiPTQ6Hyhcnk6yQUzmCpQ2vUgroFkrHMXQmtxizgPUIJl4YV00xMDEq7__3hSRrAAjzsGo9qI3_R2BhqGOsfjEj5ReTwrYuo02FPhPkpoASPYyOsDP6eXKI4kFWf5nYClgwt_nQy3eAQOY12Z5b0ROCk2LvHaOQ2U8ko9_P_0XwwmsgFEilkF6vSda_3gFfs1mlebTBZb4h9noRejkdWpgB3TlbYOFVkS22BSkVnp7j0" alt="Modern Apartment" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-label-caps font-label-caps mb-8">Mission</span>
            <h2 className="font-h2 text-h2 text-primary mb-8">Redefining the Standard of Entry</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant italic">
              "Our mission is to empower every community with the technology to be safer, smarter, and more connected. We believe that true security is invisible, and true convenience is effortless."
            </p>
          </div>
        </div>
      </section>

      {/* Key Milestones */}
      <section className="py-24 bg-background">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 md:order-1">
              <img className="rounded-2xl editorial-shadow w-full aspect-video object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7FMypKPX_1s67XBeZO9mbYLUaJFQEWu8kMv_-c3NOJud36t4I685xq6oJkojSER9XmgYFMsoi72Uoze3IPSYyRuogaal6T87kkY0iBaiFSMV6WXEwZYfQQ1s9K_t56nkIvfP8PvJi_gUymtW5E7YocaKHDmPl9Tw5h9JOdFjxiGE-zj6EuMVfes_lYdwRg-P8dYETVZvZcZBm_XwDHNJwvo1McNYSSfj8_YB-jvso9uCdCxN0vACtnwTyas_FDe-2roNPIgSkKNY" alt="Team Collaboration" />
            </div>
            <div className="order-1 md:order-2 md:pl-12">
              <span className="text-secondary font-label-caps text-label-caps mb-4 block">2018 - The Spark</span>
              <h3 className="font-h2 text-h2 text-primary text-3xl mb-6">Born from a local challenge.</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                MyGateBell started in a small office in Bangalore with a simple question: why is entry still documented on paper in the digital age? We built our first prototype for a single society of 40 homes.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-secondary font-label-caps text-label-caps mb-4 block">2024 - Today</span>
              <h3 className="font-h2 text-h2 text-primary text-3xl mb-6">Nationwide Scale.</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Today, MyGateBell is the trusted partner for over 27,000 communities. From gated villas to high-rise townships, we process over 5 million check-ins daily, making us the fastest-growing security platform in the region.
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-container p-8 rounded-2xl text-center text-white">
                  <div className="text-4xl font-bold mb-2">27k+</div>
                  <div className="text-blue-400 font-label-caps text-xs uppercase">Societies</div>
                </div>
                <div className="bg-white p-8 rounded-2xl text-center editorial-shadow">
                  <div className="text-4xl font-bold text-primary mb-2">12M+</div>
                  <div className="text-secondary font-label-caps text-xs uppercase">Residents</div>
                </div>
                <div className="bg-white p-8 rounded-2xl text-center editorial-shadow">
                  <div className="text-4xl font-bold text-primary mb-2">150+</div>
                  <div className="text-secondary font-label-caps text-xs uppercase">Cities</div>
                </div>
                <div className="bg-secondary-container p-8 rounded-2xl text-center text-white">
                  <div className="text-4xl font-bold mb-2">99.9%</div>
                  <div className="text-white/80 font-label-caps text-xs uppercase">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-h2 text-h2 text-primary">Our Commitment</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4">Building more than just software; building trust.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-surface-container-low p-10 rounded-3xl relative overflow-hidden flex flex-col justify-end min-h-[400px]">
              <img className="absolute inset-0 w-full h-full object-cover opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_VNLlqZjNtiPYtv72nkOw7gdlDDgDv5gJPUlTbKRFz6TW4rvn0_e4yOmzcRmsyxLDRuQXsoWqJVj9QZA1Xbf8NP_S_7csamgPcwc6iBWdqA7AQEO1iArnPNwFWzxJiNzBq4kg9OflZhEoY7da018SK57Sp6w5olO78XTdoLlRGdMfSM3Jw8NxIjKxM9WoddU830CxpxJx4lcczCMkECRw2ovhhnIydrd4XOAfuJGXCpff05sq9edpcdMTaFWBkPN7qrs3V4nl9SM" alt="Community Park" />
              <div className="relative z-10">
                <h4 className="font-h2 text-3xl text-primary mb-4">Human-First Security</h4>
                <p className="font-body-md text-on-surface-variant max-w-md">We design our tools to be accessible for everyone—from grandmothers to security guards—ensuring technology never becomes a barrier to safety.</p>
              </div>
            </div>
            <div className="bg-primary-container p-10 rounded-3xl text-white flex flex-col justify-center">
              <Shield className="w-10 h-10 text-blue-400 mb-6" />
              <h4 className="font-h2 text-2xl mb-4">Uncompromising Privacy</h4>
              <p className="text-on-primary-container font-body-md">Your data belongs to you. We employ bank-grade encryption and strict data sovereignty policies to ensure resident information is never sold or misused.</p>
            </div>
            <div className="bg-secondary-container p-10 rounded-3xl text-white flex flex-col justify-center">
              <Users className="w-10 h-10 text-white mb-6" />
              <h4 className="font-h2 text-2xl mb-4">Community Growth</h4>
              <p className="text-white/80 font-body-md">We reinvest into the communities we serve through safety workshops, local guard training programs, and neighborhood connectivity initiatives.</p>
            </div>
            <div className="md:col-span-2 bg-surface-container-highest p-10 rounded-3xl flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
              <div className="hidden sm:block w-48 h-48 rounded-2xl overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD9PmEF-eQIQT7uzXfgdwoKtgmDOpskpJ68B6Df8Suvpq3j6UatEnU9cBX_-TlMtCdp1-6pO-nQIb1a8FD_kDaxhOniRq12Nrsz1kJjlEJKtc5qQePE4Y8PgbChyGeaNYT7c_lVUQZ4FXnZgxCcz_lK2Vfxd7gHX_bSSLgZ_X9E9mnKr-cZVkTFqlyNEAv_RT6_YReidnuJ0_uxva-vkrCz7ipR3rvBe8FA66DdNm-XgrysVvfwn680nh4FaY2Kn2OusTRMWmIS3M" alt="Security Guard" />
              </div>
              <div>
                <h4 className="font-h2 text-3xl text-primary mb-4">Local Impact</h4>
                <p className="font-body-md text-on-surface-variant">MyGateBell has trained over 150,000 security personnel across India, providing them with digital literacy and elevating the standard of professional guarding services.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
