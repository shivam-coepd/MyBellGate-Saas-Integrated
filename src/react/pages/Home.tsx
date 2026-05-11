import React from "react";
import { ArrowRight, CheckCircle2, Package, Users, User, Fingerprint, Landmark, Truck, Headphones, CalendarDays, MessageSquare, Lock, Eye, ShieldCheck, Star, Verified, QrCode, Building2 } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="bg-surface font-body-md text-on-background scroll-smooth">
      {/* Hero Section */}
      <section className="hero-gradient pt-24 pb-40 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-container">🏆 India's #1 Gate Management App</span>
            </div> */}
            <h1 className="font-h1 text-h1 text-white mb-6">
              Smart Security Starts at Your Gate.
            </h1>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim max-w-xl mb-10">
              Empower your community with the world's most trusted gate
              management system. Seamless visitor tracking, automated
              deliveries, and real-time security alerts.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button className="px-8 py-4 bg-secondary text-white font-medium rounded-[10px] flex items-center gap-2 hover:brightness-110 transition-all">
                Book a Demo{" "}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 border-1.5 border-white/20 bg-white/5 text-white font-medium rounded-[10px] hover:bg-white/10 transition-all">
                Download App
              </button>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-avatars">
                <div className="hero-trust-avatar" style={{background:'linear-gradient(135deg,#6366f1,#818cf8)'}}>
                  RS
                </div>
                <div className="hero-trust-avatar" style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>
                  PM
                </div>
                <div className="hero-trust-avatar" style={{background:'linear-gradient(135deg,#f97316,#ea580c)'}}>
                  AK
                </div>
                <div className="hero-trust-avatar" style={{background:'linear-gradient(135deg,#ec4899,#be185d)'}}>
                  SR
                </div>
                <div className="hero-trust-avatar" style={{background:'linear-gradient(135deg,#14b8a6,#0d9488)'}}>
                  VN
                </div>
              </div>
              <div className="hero-trust-text">
                <strong>12,000+ residents</strong> managed daily
              </div>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative animate-float">
              <img
                alt="Phone Mockup"
                className="w-[320px] rounded-[40px] border-[8px] border-primary shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEaXF-7wrZJFKPu3gzBHIes9OKl-G-EnaJgu1Ds1v8nxgEzGkIhfcBiE3iCrDEO0P-fvT6NHcyebEBmyZ9Q8SwkweApMOC7j0Mhh12EVCC6peYoba3ceH7v-k7nfelE1iPWuBAumvD3V5eDCI6f5FQO7wWkoh7khZmFsetistgmIATL1oT2_MsHY58c1ObvX639yCoA94T-BLkTW6KlRZatpU5kdQQAE4kF4ZZ92-_NUNshcBZKKGvf_fzFQuX-BhqAa3DIPDYc_c"
              />
              {/* Floating Cards */}
              <div className="absolute -left-12 top-20 glass-card p-4 rounded-xl shadow-2xl max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Entry Approved
                    </p>
                    <p className="text-[10px] text-white/60">
                      Ramesh Kumar (Guest)
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-12 bottom-32 glass-card p-4 rounded-xl shadow-2xl max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Delivery Arrived
                    </p>
                    <p className="text-[10px] text-white/60">
                      Parcel at Main Gate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full leading-[0] translate-y-[1px]">
          <svg
            className="text-surface fill-current"
            fill="none"
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 120L60 110C120 100 240 80 360 73.3C480 66.7 600 73.3 720 83.3C840 93.3 960 106.7 1080 103.3C1200 100 1320 80 1380 70L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface py-section_padding">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              5M+
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              Homes Empowered
            </p>
          </div>
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              27K+
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              Communities
            </p>
          </div>
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              1B+
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              Entries Managed
            </p>
          </div>
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              4.8★
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              App Store Rating
            </p>
          </div>
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <section>
        <div className="logos-section">
          <div className="logos-label">
            Trusted by societies in cities across India
          </div>
          <div className="logos-track" id="logos-track">
            {[
              { name: 'Greenwood Heights', city: 'Navi Mumbai' },
              { name: 'Sunrise Valley', city: 'Pune' },
              { name: 'Park View Residency', city: 'Bengaluru' },
              { name: 'Blue Bell Towers', city: 'Kolkata' },
              { name: 'Silver Oak Enclave', city: 'Gurgaon' },
              { name: 'Lotus Garden', city: 'Ahmedabad' },
              { name: 'Royal Palms', city: 'Mumbai' },
              { name: 'Palm Heights', city: 'Chennai' },
            ].map((society, index) => (
              <span key={index} className="logo-item">
                <Building2 className="w-4 h-4 inline-block" style={{color:'#666'}} /> {society.name} · {society.city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="bg-white py-section_padding overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <p className="text-secondary font-label-caps uppercase tracking-widest mb-4">
              Every Community Needs
            </p>
            <h2 className="font-h2 text-h2 text-primary">
              Tailored Solutions for Everyone
            </h2>
          </div>
          <div className="grid lg:grid-cols-12 gap-gutter items-stretch">
            <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-10 flex flex-col justify-between group hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="max-w-md">
                <Users className="w-10 h-10 text-secondary mb-6" />
                <h3 className="font-h2 text-3xl mb-4">For RWA Committees</h3>
                <p className="text-on-surface-variant mb-8 font-body-md">
                  Streamline accounting, resolve helpdesk tickets faster, and
                  make data-driven decisions for your complex.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    Automated Dues Collection
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    Facility Management & Booking
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    Verified Vendor Management
                  </li>
                </ul>
              </div>
              <div className="relative mt-8 h-64 overflow-hidden rounded-lg">
                <img
                  alt="Dashboard Mockup"
                  className="w-full object-cover transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSLN90afIe8owJl7gUj377eBEXllzt9VbDemtcGouIcmS8SUdgCZSYxxsTSejFwm_FR7hD4Tb5cEPS08VBml8Bn9lRuQ1L4ZCyiHwpk-0he1YdZREK0_y3dOjuf-6ZJ-lzXlEiySc7FHUy5Hx2pjqP7rhvhpvVGQmemO6vJH0blclYJAHI6DTW_Dr0DzE5jNZyRu-VWEyIADPi7e4VDWz1NDqIzAbA430Bz-0Kj_DE4IUsacnIfguyFnuj5eIWxvd2SiIxpX0V3fw"
                />
              </div>
            </div>
            <div className="lg:col-span-5 bg-primary-container text-white rounded-xl p-10 flex flex-col justify-between group hover:shadow-2xl transition-all">
              <div>
                <User className="w-10 h-10 text-secondary mb-6" />
                <h3 className="font-h2 text-3xl mb-4">For Residents</h3>
                <p className="text-primary-fixed-dim mb-8 font-body-md">
                  Your one-stop app for security, convenience, and community
                  engagement.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    One-click Guest Approval
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    Delivery Pre-approvals
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    Daily Help Attendance
                  </li>
                </ul>
              </div>
              <div className="relative mt-8 h-64 flex justify-center">
                <img
                  alt="Mobile Mockup"
                  className="h-full object-contain transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzBeAQxpOwNj4MVELgGAcIEMSTv1GRx21QLh8f40knMZ6HIGYRUnbQ2l10zv_YhxZImBSs5px52a5BolEwGakhOrbmnfNwjfufeLUnSOpn5UIihIWuy5PjfSq87yoNZoi3GEH8yNyjUoiA2B2W7GVBNTlacgleW6qMpf5_vQkV6XAmUdkL4jup9EL0dTCpiaT-f835V77lija6VdWf9R1CDGrCgt3e8pyAoUn1dUkE3q_tEGO8F7h8omvOjB263bhW8Qw2etLLrko"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="bg-surface py-section_padding">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="font-h2 text-h2 text-primary mb-4">
              Built for Every Moment
            </h2>
            <p className="text-on-surface-variant max-w-2xl font-body-lg">
              A comprehensive suite of features designed to handle the
              complexities of modern community living.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-4 md:row-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group overflow-hidden">
              <Fingerprint className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Visitor Management</h4>
              <p className="text-on-surface-variant mb-6">
                Real-time alerts, digital logs, and AI-powered visitor
                verification.
              </p>
              <div className="mt-4 bg-surface-container-low rounded-lg p-4 h-64">
                <img
                  alt="Security Guard"
                  className="w-full h-full object-cover rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSW4IP8EWGX2pWfaAOcDYoCq5UoayM7QRaohUNSEKBl3a-D7ugYp2zpNlQTd_hYRY7wUkFwTt5yAHnfVsw7YeI4xnnWjdBVtYkxddiIeFxlJ6OdgjIEbKcjpNsm9YUav7Wunc2nZXhw4F22WyaqusVx5gKPZ2p0fmPG3sIAeE78x06N8dPhv3kjkMGKtz_qWZFGXk-STriM4aayp9CMTIiw_vusiI3tNJ7xnaxy57gvs49eOMtMRBtB0Km9r8PcaUIW__mhG_8ZT4"
                />
              </div>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <Landmark className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Smart Accounting</h4>
              <p className="text-on-surface-variant">
                Automated billing, invoicing and GST-ready reports.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <Truck className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Delivery</h4>
              <p className="text-on-surface-variant">
                Package management and e-commerce verification.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <Headphones className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Helpdesk</h4>
              <p className="text-on-surface-variant">
                Instant complaint tracking and service reminders.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <CalendarDays className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Facility Booking</h4>
              <p className="text-on-surface-variant">
                Clubhouse, tennis court, and party hall scheduling.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <MessageSquare className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Community Feed</h4>
              <p className="text-on-surface-variant">
                Notice boards, discussions, and neighborhood polls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-primary py-section_padding overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-secondary font-label-caps uppercase tracking-widest mb-4">
              Enterprise Grade Security
            </p>
            <h2 className="font-h2 text-h2 text-white mb-8">
              Uncompromising Trust for Your Home
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-h2 text-xl text-white mb-2">
                    End-to-End Encryption
                  </h4>
                  <p className="text-primary-fixed-dim">
                    All resident and visitor data is encrypted with 256-bit
                    protocols, ensuring maximum privacy.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-h2 text-xl text-white mb-2">
                    Intruder Prevention
                  </h4>
                  <p className="text-primary-fixed-dim">
                    Sophisticated block-lists and real-time facial matching at
                    the gate entrance.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-h2 text-xl text-white mb-2">
                    GDPR Compliant
                  </h4>
                  <p className="text-primary-fixed-dim">
                    We strictly follow data protection laws to give you full
                    control over your community data.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-secondary/20 rounded-2xl blur-2xl group-hover:bg-secondary/30 transition-all duration-500"></div>
            <img
              alt="Community Entrance"
              className="relative rounded-2xl shadow-2xl z-10 w-full object-cover aspect-[4/3]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZGTlEM2vszZgdU-IvlmkoVVGiQLYzxhCvnkJDlPm6Tqt9SuijxL7ZiMmAjEaVYG0AEIVM27bDg1PFKDqc3qty6j-YzUCXN82wMX18w4EWYVLXOrRhDhXwgAL_7EaZaVjlRc7axfq7TjzpNvdM-90naR2aQmm9hUgGnGfOxEQc0YXyZc1NBCH06vGhytivQPZgHC53K1EGNzZ7j8kv3Fyqzo-KKuXYXtjCqi5C3FEUtsmjOlU9bdKGFcZOxQ2hdn6SazUwFyuxfm0"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface-bright py-section_padding">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="font-h2 text-h2 text-primary mb-4">
              The Implementation Path
            </h2>
            <p className="text-on-surface-variant font-body-lg">
              Go live with MyGateBell in under 7 days.
            </p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-12">
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient border border-secondary/10 text-secondary font-bold text-xl">
                1
              </div>
              <h4 className="font-h2 text-xl mb-3">Register</h4>
              <p className="text-on-surface-variant font-body-md">
                Sign up your community and upload basic details of flats and
                owners.
              </p>
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient border border-secondary/10 text-secondary font-bold text-xl">
                2
              </div>
              <h4 className="font-h2 text-xl mb-3">Onboard</h4>
              <p className="text-on-surface-variant font-body-md">
                Our team provides on-site training for guards and digital setup
                for residents.
              </p>
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient text-white font-bold text-xl">
                3
              </div>
              <h4 className="font-h2 text-xl mb-3">Go Live</h4>
              <p className="text-on-surface-variant font-body-md">
                Switch on the smart gate and enjoy a safer, more connected
                lifestyle.
              </p>
            </div>
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-secondary/20 z-0"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-section_padding">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-surface rounded-xl p-8 shadow-sm hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="flex gap-1 text-secondary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 fill-current"
                  />
                ))}
              </div>
              <p className="font-body-md text-primary mb-8 italic">
                "MyGateBell has completely changed how our RWA operates. The
                accounting feature alone saved us 40 hours of manual work every
                month."
              </p>
              <div className="flex items-center gap-4">
                <img
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3B2NSg2eeBt-SSFM0tb5f1sEuMY0UvPXE7TtGWZ0kolR2Gq88TgfYwuQPKS5u9bMGUbCIyP5j2TkvpixXQnwG5i4fTpkuLaPiRiATrkByelrLTinHRT_stFRs53zItUhJY-ygLCBE5b8tLADTKltxzwMiivDUtIpjdh5Ax8WrMZekABAibNcDonO_CXxNi0iegnc7tOzvQCIBW-4YEwbZjain9PZx9GWCqEL4qjTOQ72Uqxg4Fqpli36PhiybeiBcW3UoWjphJQQ"
                />
                <div>
                  <p className="font-bold text-sm">Anand Ranganathan</p>
                  <p className="text-xs text-on-surface-variant">
                    Secretary, Prestige Ferns
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-8 shadow-sm hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="flex gap-1 text-secondary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 fill-current"
                  />
                ))}
              </div>
              <p className="font-body-md text-primary mb-8 italic">
                "As a resident, I feel much safer knowing exactly who is
                entering the building. The delivery pre-approval is a
                lifesaver!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuANmU_k_r5DCwT2KKh1-RKWiIqkxwut9eeRBQX6cyD5nP85zn3ugZR_Km8FrGN9O9P97Idz79n8DBh1w4sEWaADUzhg2T5HV0YTolUerv3EEu4zAAAKcCu1cwJmeCVHolvJEPredTNCatUR9FlrWOaCtDOVrOs3htUHTSWnDEyghg1fc_Y9QiJ2yt92ZH_XAzKeyQcMrVCklge6f9bnbrzbYRmxjeyKSLkayJKT1JzHLkmdJ464xmESWQ-UuYQtLgOFLCfg0t6yMAs"
                />
                <div>
                  <p className="font-bold text-sm">Priya Sharma</p>
                  <p className="text-xs text-on-surface-variant">
                    Resident, Godrej Properties
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-8 shadow-sm hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="flex gap-1 text-secondary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 fill-current"
                  />
                ))}
              </div>
              <p className="font-body-md text-primary mb-8 italic">
                "The transition was seamless. Their support team was there at
                every step. Truly the new standard for Indian gated
                communities."
              </p>
              <div className="flex items-center gap-4">
                <img
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnGPUyJY9AuY1IioJtZJQtJ2_ezGxlUrk7YEFcOpU78ZJY7Y1l8zwqghy7FVg-6hP5NsY1MGTjpzF2sKzyQvyZ5iRsd4VpzjpG_7hwVkzS_ACTHhIqkcHLr9uIQJm0IuDZKl14sYOCaSF-ZGA0h5MJrMvUaSkw6DmfHFzec3t9gXHBb8q318EL1RQEUVaxfIRzQKjfDh5gW7FwJbJybm1UfYZQIuhuRvimfHRy4maCHlGprtGBrgehHcjI72zmdoMWJsgvXxOqG0c"
                />
                <div>
                  <p className="font-bold text-sm">Vikram Seth</p>
                  <p className="text-xs text-on-surface-variant">
                    Director, Asset Management
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 filter grayscale">
            <div className="text-xl font-bold font-h2">SOBHA</div>
            <div className="text-xl font-bold font-h2">GODREJ</div>
            <div className="text-xl font-bold font-h2">LODHA</div>
            <div className="text-xl font-bold font-h2">DLF</div>
            <div className="text-xl font-bold font-h2">BRIGADE</div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="hero-gradient py-section_padding">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-h2 text-h2 text-white mb-8">
              See MyGateBell in Action
            </h2>
            <p className="font-body-lg text-primary-fixed-dim mb-10">
              Request a personalized demo to see how MyGateBell can solve your
              community's unique challenges. Our experts will walk you through
              our ecosystem.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Verified className="w-6 h-6 text-secondary" />
                <span className="text-white text-sm">ISO Certified</span>
              </div>
              <div className="flex items-center gap-3">
                <Verified className="w-6 h-6 text-secondary" />
                <span className="text-white text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-10 rounded-xl shadow-2xl">
            <form className="space-y-6">
              <div>
                <label className="font-label-caps block mb-2 text-primary">
                  Full Name
                </label>
                <input
                  className="w-full bg-[#F1F3F9] border-none rounded-[10px] focus:ring-secondary p-4"
                  placeholder="Enter your name"
                  type="text"
                />
              </div>
              <div>
                <label className="font-label-caps block mb-2 text-primary">
                  Work Email
                </label>
                <input
                  className="w-full bg-[#F1F3F9] border-none rounded-[10px] focus:ring-secondary p-4"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
              <div>
                <label className="font-label-caps block mb-2 text-primary">
                  Community Name
                </label>
                <input
                  className="w-full bg-[#F1F3F9] border-none rounded-[10px] focus:ring-secondary p-4"
                  placeholder="e.g. Ferns City"
                  type="text"
                />
              </div>
              <button className="w-full py-5 bg-secondary text-white font-bold rounded-[10px] shadow-lg hover:brightness-110 active:scale-95 transition-all">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Download Banner */}
      <section className="bg-secondary-container py-section_padding">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <h2 className="font-h2 text-h2 mb-6">Security in Your Pocket</h2>
            <p className="font-body-lg mb-10 opacity-90">
              Download the MyGateBell app today and start enjoying a smarter,
              more secure lifestyle for you and your family.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <a href="#">
                <img
                  alt="App Store"
                  className="h-12"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8sUk-jIMHiaqovURWGQ-zCETOvvgIw771nGxTcPzkWcMrODZ7HH57TSsCG_b5WfOtf14SRDmvpipKbE9PbhxxVOBssGXGnBV7BAqfWTm8K8D0cRYBneciigs2EEHOoTC2OWgjC73GUnvprhM1QGVbLAVLoB4BziX3oDFVXRXHZVSukhcalerX5ICaLH1XPUhhXLrnTZ7wZxb5d71wF8sJR_rzArpLSgooP93sHSeBKsXD6VzUDAUb1dv1jXXB3vAYs2VpS40gWKM"
                />
              </a>
              <a href="#">
                <img
                  alt="Play Store"
                  className="h-12"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApFxMkJen5RhcwPDFQ1iJOwiGkQFF9jK77WjrDKsHb8G6epWX61je3-UYvD6aueU1ZgypYlnT-mMjRYyOsdy6AI7gOxVRqTQfahe0ml9GlZicqgi7L0iSp7dObMdat0ZA5p3HwoEgmGeRE4lCQQMh3maK9veG3xC7rDh_tQ-0RHs_YwL9Rb85Ju60odGJOwoUzCMK3y5ftNl1nD5QDxmj6N9xB3tVY7OlSpuqB6YoG8HVj7DSZK_-IgIlZZgobnUg3AaKSLCgiFRY"
                />
              </a>
            </div>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white rounded-xl">
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-primary" />
                </div>
              </div>
              <p className="text-sm">
                Scan the QR code
                <br />
                <span className="font-bold">to download instantly</span>
              </p>
            </div>
          </div>
          <div className="relative flex justify-center items-end">
            <div className="relative w-full max-w-sm">
              <img
                alt="Phone App"
                className="rounded-[40px] border-[8px] border-white shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAVl3umnXyU8w621M_2cx2766CUP07yAcgQKVNudjWsHxwn_6v_RN79Cjb1YQO6Vp7VrAr54ihhVed_KZqNAiQLC57oMeKHFgSnsj1qgNN33-Oe31JbETASJUUMxvXTO5oWiFjxTKQ0NNzXdXFT-S7MI7UqFwleqvEOdN2LdcQwabKydDiKA122K0c8o3ea3hv8No2DtYet92hnJW5wcLyPwXdZpacVmpjKiPh9pRfqm-wq8AxLKzTlNR9D9qwShzLntR-tDmP5cI"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
