import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Twitter,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import markLogo from "../../assets/shnoor_logo.png";
import WhatsAppContactButton from "../../components/WhatsAppButton";

const contactHighlights = [
  {
    title: "Sales and partnerships",
    description:
      "Speak with us about enterprise training, private programs, and rollout plans.",
    icon: Building2,
  },
  {
    title: "Program guidance",
    description:
      "Get support choosing the right learning journey for your workforce or audience.",
    icon: ShieldCheck,
  },
  {
    title: "Fast response",
    description:
      "Reach out through email, phone, or WhatsApp and our team will follow up promptly.",
    icon: CheckCircle2,
  },
];

const ContactView = ({ onBack }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const BrandLogo = () => (
    <div className="flex items-center">
      <img
        src={markLogo}
        alt="Shnoor International"
        width="220"
        loading="eager"
      />
    </div>
  );

  const footerLinkClass = "text-slate-400 transition-colors hover:text-white";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  const handleBackToHome = () => {
    setMobileMenuOpen(false);
    onBack();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 selection:bg-indigo-600 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_56%)]" />
        <div className="absolute right-0 top-80 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled || mobileMenuOpen ? "border-b border-slate-200/80 bg-white/92 shadow-sm backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          <BrandLogo />
          <button
            onClick={handleBackToHome}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:inline-flex"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute w-full border-b border-slate-200 bg-white p-6 shadow-xl md:hidden">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
          </div>
        )}
      </nav>

      <section className="relative z-10 px-6 pb-14 pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700">
            Contact Shnoor
          </div>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
                Let's plan the right learning experience for your team.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Reach out for enterprise training, private programs,
                certification pathways, or platform guidance. The page now
                matches the same professional UI language as the new landing
                page for a more consistent brand experience.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {contactHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <item.icon size={18} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-10 px-6 pb-20 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_58%,#312E81_100%)] p-8 text-white shadow-2xl shadow-slate-950/10 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Contact Info
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to upgrade your workforce learning experience?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
              Speak with our team about platform access, training models, or a
              rollout approach that fits your organization.
            </p>

            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 shrink-0">
                    <Mail size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-100">
                      info@shnoor.com{" "}
                      <span className="text-slate-400 text-sm">(General)</span>
                    </span>
                    <span className="font-medium text-slate-100">
                      proc@shnoor.com{" "}
                      <span className="text-slate-400 text-sm">(Sales)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 shrink-0">
                    <Phone size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-100">
                      +91-9429694298
                    </span>
                    <span className="font-medium text-slate-100">
                      +91-9041914601
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 shrink-0">
                    <MessageCircle size={18} className="text-indigo-400" />
                  </div>
                  <WhatsAppContactButton variant="light" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 shrink-0">
                    <MapPin size={18} className="text-indigo-400" />
                  </div>
                  <span className="font-medium leading-relaxed text-slate-100">
                    10009 Mount Tabor Road, City,
                    <br /> Odessa Missouri, United States
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4 border-t border-white/10 pt-6">
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Send a message
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Tell us what you need and we'll help you move forward.
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Work Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={inputClass}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Message
                </label>
                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className={`${inputClass} resize-none`}
                  placeholder="Tell us about your requirements..."
                />
              </div>
              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submitted}
              >
                {submitted ? (
                  "Message Sent!"
                ) : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800 bg-[#0F172A] px-6 pb-8 pt-16 text-left font-medium">
        <div className="mx-auto mb-16 grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="mb-6">
              <BrandLogo />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Transform your learning process with a platform that supports
              training paths, progress visibility, and skill validation in one
              consistent experience.
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#" className={footerLinkClass}>
                <Twitter size={20} />
              </a>
              <a href="#" className={footerLinkClass}>
                <Facebook size={20} />
              </a>
              <a href="#" className={footerLinkClass}>
                <Linkedin size={20} />
              </a>
              <a href="#" className={footerLinkClass}>
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-6 text-lg font-semibold text-white">
              Quick Links
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <button onClick={handleBackToHome} className={footerLinkClass}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={handleBackToHome} className={footerLinkClass}>
                  Training
                </button>
              </li>
              <li>
                <button className={footerLinkClass}>Contact Us</button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="mb-6 text-lg font-semibold text-white">
              Contact & Support
            </h4>
            <ul className="space-y-6 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-1 shrink-0 text-indigo-400" />
                <div className="flex flex-col">
                  <span>info@shnoor.com (General)</span>
                  <span>proc@shnoor.com (Sales)</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-1 shrink-0 text-indigo-400" />
                <div className="flex flex-col">
                  <span>+91-9429694298</span>
                  <span>+91-9041914601</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle
                  size={18}
                  className="mt-1 shrink-0 text-indigo-400"
                />
                <WhatsAppContactButton variant="dark" />
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-indigo-400" />
                <span>
                  10009 Mount Tabor Road
                  <br />
                  City, Odessa Missouri, United States
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-slate-800 pt-8 text-center text-sm text-slate-500 md:flex-row md:text-left">
          <div>� 2026 Shnoor International. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              to="/privacy-policy"
              className="whitespace-nowrap py-2 text-slate-500 transition-colors hover:text-slate-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-and-conditions"
              className="whitespace-nowrap py-2 text-slate-500 transition-colors hover:text-slate-300"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/cookie-policy"
              className="whitespace-nowrap py-2 text-slate-500 transition-colors hover:text-slate-300"
            >
              Cookie Policy
            </Link>
            <a
              href="/Company profile..pdf"
              download
              className="whitespace-nowrap py-2 text-slate-500 transition-colors hover:text-slate-300"
            >
              Company Profile
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactView;
