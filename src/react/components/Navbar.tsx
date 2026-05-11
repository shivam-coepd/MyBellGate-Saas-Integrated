import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
// @ts-ignore - Image import
import logo from "../assets/mygatebell_logo.png";
import ScrollProgress from "./ScrollProgress";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Product", path: "/product" },
    { name: "Features", path: "/features" },
    { name: "Security", path: "/security" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-ambient">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tighter text-primary flex items-center gap-2"
        >
          <img
            src={logo}
            alt="MyGateBell Logo"
            className="w-7 h-7 md:w-9 md:h-9 object-contain transition-transform duration-300 hover:scale-110"
          />
          <span>MyGateBell</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-['Plus_Jakarta_Sans'] text-sm tracking-tight antialiased">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`${
                isActive(link.path)
                  ? "text-secondary font-semibold border-b-2 border-secondary pb-1"
                  : "text-on-surface-variant hover:text-secondary hover:font-semibold transition-all"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/app"
            className="hidden md:inline-flex px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:text-secondary hover:font-semibold hover:bg-secondary-container/10 rounded-[10px] transition-all"
          >
            Login
          </a>
          <a
            href="/app"
            className="hidden md:inline-flex px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-[10px] shadow-lg active:scale-95 transition-all"
          >
            Get Started
          </a>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-on-surface-variant"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-surface-variant px-8 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`py-2 text-sm font-medium ${
                isActive(link.path)
                  ? "text-secondary font-semibold"
                  : "text-on-surface-variant hover:text-secondary"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <a
            href="/app"
            className="mt-2 py-2 text-sm font-semibold text-secondary"
          >
            Login / Get Started →
          </a>
        </div>
      )}

      {/* Scroll Progress Indicator */}
      <ScrollProgress />
    </nav>
  );
};

export default Navbar;
