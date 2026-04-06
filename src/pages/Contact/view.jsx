import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Menu, X,
  Mail, Phone, MapPin, Send, MessageCircle,
  Twitter, Facebook, Linkedin, Instagram,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import markLogo from '../../assets/image.png';
import WhatsAppContactButton from "../../components/WhatsAppButton";
const ContactView = ({ onBack }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const BrandLogo = ({ titleColor = 'text-slate-900', subtitleColor = 'text-slate-500' }) => (
    <div className="flex items-center">
      <img
        src={markLogo}
        alt="Shnoor International"
        className="rounded-xl"
        style={{ width: '60px', height: '62px', objectFit: 'cover', borderRadius: '50%', marginRight: '10px' }}
      />
      <div>
        <h1 className={`brand-logo ${titleColor} text-xl md:text-2xl font-semibold mb-1 tracking-tight leading-tight`}>
          SHNOOR International
        </h1>
        <p className={`text-xs md:text-sm ${subtitleColor} font-medium tracking-[0.18em] uppercase`}>
          Learning Platform
        </p>
      </div>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add form submission logic here
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-500 selection:text-white overflow-x-hidden">

      {/* --- BACKGROUND BLOBS --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* --- NAV BAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <BrandLogo />

          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-6 flex flex-col gap-6 shadow-xl absolute w-full animate-fade-in-up">
            <button
              onClick={() => {
                onBack();
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-36 pb-20 px-6 lg:pt-48 lg:pb-32 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Get In Touch
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Have a question or ready to transform your workforce? We'd love to hear from you. Reach out to our team and let's discuss how we can help.
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section className="py-24 px-6 relative z-10 bg-white/50">
        <div className="max-w-6xl mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-100">

          {/* Left Side (Dark Info) */}
          <div className="bg-slate-900 p-12 lg:w-5/12 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="relative z-10">
              <span className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-2 block">Contact Info</span>
              <h2 className="text-3xl font-black tracking-tight mb-8">Ready to upgrade your workforce?</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">info@shnoor.com <span className="text-slate-500 text-sm">(General)</span></span>
                    <span className="font-medium text-slate-200">proc@shnoor.com <span className="text-slate-500 text-sm">(Sales)</span></span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">+91-9429694298</span>
                    <span className="font-medium text-slate-200">+91-9041914601</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MessageCircle size={18} className="text-indigo-400" />
                  </div>
                  <WhatsAppContactButton variant="light" />
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-indigo-400" />
                  </div>
                  <span className="font-medium text-slate-200 leading-relaxed">
                    10009 Mount Tabor Road, City,<br /> Odessa Missouri, United States
                  </span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-700/50">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              </div>
            </div>
          </div>

          {/* Right Side (Light Form) */}
          <div className="p-12 lg:w-7/12 bg-white flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 font-medium"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 font-medium"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Work Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 font-medium"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Message</label>
                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 font-medium resize-none"
                  placeholder="Tell us about your requirements..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitted}
              >
                {submitted ? 'Message Sent!' : <>Send Message <Send size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0F172A] border-t border-slate-800 pt-16 pb-8 px-6 relative z-10 font-medium text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* Column 1: Brand & Socials (Span 5) */}
          <div className="lg:col-span-5">
            <div className="mb-6">
              <BrandLogo titleColor="!text-white" subtitleColor="!text-[#94a3b8]" />
            </div>
            <p className="!text-[#94a3b8] text-sm leading-relaxed mb-8 max-w-sm">
              Transform your learning process with our powerful platform. Create professional training paths, track progress, and certify skills faster with Shnoor International.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-bold !text-white mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={onBack} className="!text-[#94a3b8] hover:!text-white transition-colors">Home</button></li>
              <li><button onClick={onBack} className="!text-[#94a3b8] hover:!text-white transition-colors">Training</button></li>
              <li><button className="!text-[#94a3b8] hover:!text-white transition-colors">Contact Us</button></li>
            </ul>
          </div>

          {/* Column 3: Contact & Support (Span 4) */}
          <div className="lg:col-span-4">
            <h4 className="font-bold !text-white mb-6 text-lg">Contact & Support</h4>
            <ul className="space-y-6 text-sm !text-[#94a3b8]">
              {/* Emails */}
              <li className="flex items-start gap-3">
                <Mail size={18} className="shrink-0 text-indigo-400 mt-1" />
                <div className="flex flex-col">
                  <span>info@shnoor.com (General)</span>
                  <span>proc@shnoor.com (Sales)</span>
                </div>
              </li>

              {/* Phones */}
              <li className="flex items-start gap-3">
                <Phone size={18} className="shrink-0 text-indigo-400 mt-1" />
                <div className="flex flex-col">
                  <span>+91-9429694298</span>
                  <span>+91-9041914601</span>
                </div>
              </li>

              {/* WhatsApp Button */}
              <li className="flex items-start gap-3">
                <MessageCircle size={18} className="shrink-0 text-indigo-400 mt-1" />
                <WhatsAppContactButton variant="dark" />
              </li>

              {/* Address */}
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 text-indigo-400 mt-1" />
                <span>10009 Mount Tabor Road<br />City, Odessa Missouri, United States</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm !text-[#64748b]">
          <div>© 2026 Shnoor International. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:!text-[#cbd5e1] !text-[#64748b]">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:!text-[#cbd5e1] !text-[#64748b]">Terms & Conditions</Link>
            <Link to="/cookie-policy" className="hover:!text-[#cbd5e1] !text-[#64748b]">Cookie Policy</Link>
            <a href="/Company profile..pdf" download className="hover:!text-[#cbd5e1] !text-[#64748b]">Company Profile</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactView;