import React from 'react';

const Product: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-surface">
      {/* Hero Section */}
      <header className="hero-gradient pt-40 pb-32 text-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6">
              <span className="text-label-caps text-blue-400">NEW RELEASE</span>
              <span className="w-1 h-1 rounded-full bg-blue-400"></span>
              <span className="text-label-caps opacity-80">V3.0 IS NOW LIVE</span>
            </div>
            <h1 className="font-h1 text-h1 mb-6">Security Simplified.<br/><span className="text-secondary-container">Living Elevated.</span></h1>
            <p className="font-body-lg text-body-lg text-slate-300 max-w-xl mb-10">
              The premium ecosystem connecting residents, guards, and management in one seamless interface. Experience the new standard of entry for high-end gated communities.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-secondary px-8 py-4 rounded-[10px] text-white font-medium hover:bg-blue-600 transition-colors">Explore the Ecosystem</button>
              <button className="bg-white/5 border border-white/20 px-8 py-4 rounded-[10px] text-white font-medium hover:bg-white/10 transition-colors">Watch Film</button>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 ambient-shadow rounded-[24px] overflow-hidden">
              <img
                className="w-full h-auto object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8fsGYUVTGoAA0AUZjfX2jouWGIXiV5wJtFLoopW4ZDSvq86USrX1b4miL-DKJTBgdjdhy1vlZi4UYzyHqQUHcW_swlstEBRYh64UeeJ-VykibmN0AAfXxl1emt1eXAkel0Mm-2P3ylK4Y_m8x5D7hV9rwwLYyMDaYHj1AJy00Lwj3qaXogJJI0YIHCTgbR7PHsHhGfLAdr55A7htkZGVp34PJPZ5VYPleD4HbjQhV3UG8RYMrYmvhd8GQaKQa3_qpTEmke_M-9Hc"
                alt="Luxury Apartment"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 blur-3xl"></div>
          </div>
        </div>
      </header>

      {/* The Ecosystem Grid */}
      <section className="py-section_padding">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-label-caps text-secondary mb-4">THE THREE PILLARS</p>
            <h2 className="font-h2 text-h2 text-primary">Unified Communication</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Resident App */}
            <div className="md:col-span-8 bg-white p-10 rounded-[16px] ambient-shadow group hover:-translate-y-1 transition-transform">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-4xl text-secondary mb-6">home_app_logo</span>
                  <h3 className="font-h2 text-[32px] text-primary mb-4">Resident App</h3>
                  <p className="text-on-surface-variant mb-6">Total control of your home sanctuary. Approve visitors, book amenities, and pay dues with one-touch efficiency.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Instant Visitor Alerts</li>
                    <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Digital Clubhouse Booking</li>
                    <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Panic Button Emergency Link</li>
                  </ul>
                  <button className="text-secondary font-semibold flex items-center gap-2 hover:gap-3 transition-all">Download App <span className="material-symbols-outlined">arrow_forward</span></button>
                </div>
                <div className="flex-1 bg-surface-container rounded-xl overflow-hidden min-h-[300px]">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAiHPqv4qUvZXZlIWxV2fBxIhhs3LCPNgH0akk8w82pypPBfpVM-kkAPTlXi0SGL1bIkrYZ92MGihGlFlRP40DxYOxHk3Sg9wNI9NVttqOt4j1-yrBHEcmkZe4Oy9zUlVDpPHdD98gcP-5PT4F372ssM2UvJ843b9ovSQEWXIWpYFNGWtNJuO2KxjXIMlTCxesK8N3gIx9JEYpFHyCrGl9dvhp-4Egmie3T4Y5_4goPp6Zi-0yiZjNiPDHnmuPrIHZ6W1MR3MVP8c" alt="Resident App UI" />
                </div>
              </div>
            </div>
            {/* Guard Station */}
            <div className="md:col-span-4 bg-primary-container p-10 rounded-[16px] text-white">
              <span className="material-symbols-outlined text-4xl text-blue-400 mb-6">security</span>
              <h3 className="font-h2 text-[28px] mb-4 leading-tight">Guard Desk Station</h3>
              <p className="text-slate-400 mb-8">Empowering security staff with rapid verification tools and offline capability for zero-latency entry management.</p>
              <div className="rounded-xl overflow-hidden mb-6 aspect-square bg-white/5">
                <img className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD6_7Pg5-zGhsjzLx0CMD7bHU8OaJ1zJUl32NysnDqqwnyyNy8QsF-BGIF0oNXaiUrISqzNiYhtx6cYg7B-9H6J1yuvxh7edfqRrnT0go2qxfozJOkIRUslN96gokQy1LrrbeWAKcucA6dpFqQmm_8CqoLaBl8LSjOwNovcm7Xln6SaY0yRJYujdMwHqFZjIzqhxhEnDkQw6qMvRW8UPi_aFpgjgSPEpKGwAUeOWl0UTMmA301ANyHTkZ_CiRkrSKK7on1FuzJsAM" alt="Guard Station UI" />
              </div>
              <p className="text-label-caps text-blue-400">OPTIMIZED FOR TABLETS</p>
            </div>
            {/* Management Portal */}
            <div className="md:col-span-12 bg-white p-10 rounded-[16px] ambient-shadow flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 rounded-[16px] overflow-hidden border border-slate-100 shadow-2xl">
                <img className="w-full h-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzKXP7VmWctQi2L1W0sCIHGqpQ_1yhnSSbq7UKerkxZnam0hIMfCMRl6r3Hjq3rcAwEbG16UVyzhInVOVPhKOgdchju1vxd_VZqJX44sYDZgFWp6QmLV7KrYnM3AS4qNFoMeUqyd7zLkRFx7EIWhB74NJDN7tGacLc--wor_kt7pL029ylWlfMKNOibjRx7eFLuwfTbgGzN_sE7HkvcwNzYUT2fqbsCAb0Kwtv5X6S4HFqpPfzSrzy7KXsFxgq8R4B4x7VrOn2TeQ" alt="Admin Dashboard" />
              </div>
              <div className="md:w-1/2">
                <span className="material-symbols-outlined text-4xl text-secondary mb-6">dashboard</span>
                <h3 className="font-h2 text-[32px] text-primary mb-4">Admin Command Center</h3>
                <p className="text-on-surface-variant text-body-lg mb-8">The central nervous system for community management. Generate financial reports, manage staff shifts, and send community-wide broadcasts with unprecedented clarity.</p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <p className="text-label-caps text-secondary mb-1">DATA INSIGHTS</p>
                    <p className="font-semibold">Live Traffic Flows</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <p className="text-label-caps text-secondary mb-1">FINANCIALS</p>
                    <p className="font-semibold">Auto-Dues Collection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Divider / Quote */}
      <section className="py-32 bg-surface-container-lowest text-center">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="font-h1 text-[40px] md:text-[56px] text-primary-container leading-tight italic">
            "We didn't just build a gate management app; we engineered peace of mind for the modern era."
          </h2>
          <div className="mt-8 flex items-center justify-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-slate-200"></div>
            <div>
              <p className="font-bold text-primary">Marcus Thorne</p>
              <p className="text-sm text-on-surface-variant">Chief Design Officer, MyGateBell</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Tech / Security Section */}
      <section className="py-section_padding bg-primary-container text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="font-h2 text-h2 mb-8">Uncompromising Security Architecture</h2>
              <p className="text-body-lg text-slate-400 mb-12">Built on military-grade encryption protocols and hosted on decentralized servers, MyGateBell ensures that community data remains private, persistent, and protected.</p>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-blue-400">fingerprint</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Biometric Authentication</h4>
                    <p className="text-slate-400">Zero-trust access for all management levels with local biometric verification.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-blue-400">encrypted</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">256-bit AES Encryption</h4>
                    <p className="text-slate-400">All communication between residents and gates is encrypted end-to-end.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-blue-400">cloud_done</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Immutable Logs</h4>
                    <p className="text-slate-400">Entry logs are tamper-proof and archived for compliance and audits.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img className="rounded-[24px] shadow-2xl border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO9d0_tvWBzmNADxWJlhCsGrwe81QavWL3VpSrX2typ4-BEh-Rk1qBD5kz9ZSmHFivR_ZFHm_AP15Hnc2b8FXm6m0jUN_Oxl-8J82jDj2DKptvB1cj4sHv3s-wo3dd3hsUyI4AVjt4KYOII8GDe4KLCIRA2T8n9bK81drpJHvdfUHGsv45zCh9qXtGWp359rpjy0_aNVTHWS4sPE86bVRYCE5aSFdCH9QCuE04q4A9h8rX9LiD8DWwI7jR9n21BAGb5osb1Tog1nY" alt="Security Viz" />
              <div className="absolute -bottom-10 -left-10 bg-secondary p-8 rounded-2xl shadow-xl">
                <p className="text-h2 font-bold leading-none">99.9%</p>
                <p className="text-label-caps text-blue-100">Uptime Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section_padding">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-[32px] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <h2 className="font-h2 text-h2 mb-8 relative z-10">Ready to Upgrade Your Entry Standard?</h2>
            <p className="font-body-lg text-body-lg text-blue-100 mb-12 max-w-2xl mx-auto relative z-10">Join over 500+ premium residential complexes that have revolutionized their living experience with MyGateBell.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button className="bg-white text-blue-600 px-10 py-5 rounded-[12px] font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">Request a Demo</button>
              <button className="bg-blue-900/30 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-[12px] font-bold text-lg hover:bg-blue-900/50 transition-colors">Pricing Plans</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Product;
