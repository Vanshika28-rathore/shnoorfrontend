import React, { useState } from 'react';
import {
  ShieldCheck, Zap, Globe, BarChart3,
  ArrowRight, CheckCircle2, Layout, Users,
  Mail, Phone, MapPin, Menu, X
} from 'lucide-react';

const LandingView = ({ onLogin, onRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll handler for smooth navigation
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const NavLink = ({ target, label }) => (
    <button
      onClick={() => scrollToSection(target)}
      className="text-sm font-bold text-slate-500 hover:text-primary-900 transition-colors uppercase tracking-widest"
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-accent-500 selection:text-white">

      {/* --- NAV BAR --- */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center text-white font-black text-xs">S</div>
            <span className="font-black text-lg tracking-tighter text-primary-900">SHNOOR LMS</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink target="home" label="Home" />
            <NavLink target="about" label="About Us" />
            <NavLink target="features" label="Platform" />
            <NavLink target="contact" label="Contact" />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-primary-900 hover:text-accent-600 transition-colors uppercase tracking-widest">
              Login
            </button>
            <button onClick={onRegister} className="btn-primary">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-primary-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-6 flex flex-col gap-6 shadow-xl absolute w-full">
            <NavLink target="home" label="Home" />
            <NavLink target="about" label="About Us" />
            <NavLink target="features" label="Platform" />
            <NavLink target="contact" label="Contact" />
            <hr className="border-slate-100" />
            <button onClick={onLogin} className="w-full h-12 border border-slate-200 rounded-lg font-bold text-primary-900 uppercase tracking-widest">Login</button>
            <button onClick={onRegister} className="w-full h-12 bg-primary-900 text-white rounded-lg font-bold uppercase tracking-widest">Get Started</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION (Home) --- */}
      <section id="home" className="pt-32 pb-20 px-6 border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System v2.0 Operational</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-primary-900 tracking-tighter mb-8 leading-[1.1]">
            Enterprise Learning <br /> <span className="text-slate-400">Architecture.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Scalable skill validation and compliance management for high-performance organizations. Zero friction. Total visibility.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button onClick={onRegister} className="h-14 px-8 bg-primary-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
              Deploy Workspace <ArrowRight size={18} />
            </button>
            <button onClick={onLogin} className="h-14 px-8 bg-white border border-slate-200 text-primary-900 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* --- ABOUT US SECTION --- */}
      <section id="about" className="py-24 px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-black text-accent-600 uppercase tracking-widest mb-2">Our Mission</h2>
            <h3 className="text-4xl font-black text-primary-900 tracking-tight mb-6">Building the Operating System for Human Potential.</h3>
            <p className="text-lg text-slate-500 mb-6 leading-relaxed">
              At Shnoor, we believe that enterprise training shouldn't feel like a chore. It should be precise, data-driven, and seamlessly integrated into the daily workflow.
            </p>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              We stripped away the clutter of traditional LMS platforms to focus on what matters: <strong>Velocity, Compliance, and Mastery.</strong>
            </p>
            <ul className="space-y-4">
              {[
                'SOC2 Type II Compliant Infrastructure',
                '99.99% Uptime SLA Guarantee',
                'Dedicated Customer Success Managers'
              ].map((item, i) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-accent-500" />
                  <span className="font-bold text-primary-900 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-subtle border border-slate-100">
                <div className="text-4xl font-black text-primary-900 mb-1">500+</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enterprise Clients</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-subtle border border-slate-100">
                <div className="text-4xl font-black text-primary-900 mb-1">1M+</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lessons Completed</div>
              </div>
              <div className="col-span-2 bg-primary-900 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-4xl font-black mb-1">24/7</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary-300">Global Support Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-sm font-black text-accent-600 uppercase tracking-widest mb-2">System Architecture</h2>
            <h3 className="text-3xl font-black text-primary-900 tracking-tight">Designed for rigid standards and flexible pathways.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Role-Based Security", desc: "Granular access controls for Admins, Instructors, and Students." },
              { icon: BarChart3, title: "Real-time Analytics", desc: "Live telemetry on student performance and engagement metrics." },
              { icon: Zap, title: "High-Velocity Content", desc: "Deploy video courses, coding challenges, and exams in milliseconds." },
              { icon: Globe, title: "Scalable Infrastructure", desc: "Cloud-native build that auto-scales with your workforce." },
              { icon: Layout, title: "Minimalist Interface", desc: "Distraction-free learning environment designed for focus." },
              { icon: Users, title: "Collaborative Cohorts", desc: "Synchronous learning groups with integrated chat." }
            ].map((feature, idx) => (
              <div key={feature.title} className="p-8 bg-white border border-slate-200 rounded-2xl hover:border-accent-500 transition-all hover:shadow-md group">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-primary-900 mb-6 group-hover:bg-primary-900 group-hover:text-white transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-primary-900 mb-3">{feature.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT US SECTION --- */}
      <section id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto bg-primary-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 lg:p-16 text-white">
            <h2 className="text-sm font-black text-accent-500 uppercase tracking-widest mb-2">Get in touch</h2>
            <h3 className="text-3xl font-black mb-6">Ready to upgrade your workforce?</h3>
            <p className="text-primary-200 mb-10 leading-relaxed text-lg">
              Schedule a demo with our enterprise team. We typically respond within 2 hours during business days.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Mail size={20} /></div>
                <span className="font-bold tracking-wide">enterprise@shnoor.com</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Phone size={20} /></div>
                <span className="font-bold tracking-wide">+1 (555) 012-3456</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><MapPin size={20} /></div>
                <span className="font-bold tracking-wide">101 Tech Plaza, Silicon Valley, CA</span>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 bg-white p-12 lg:p-16">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                  <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-primary-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-primary-900" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Work Email</label>
                <input type="email" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-primary-900" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                <textarea className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-primary-900 resize-none"></textarea>
              </div>
              <button type="button" className="w-full h-14 bg-accent-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-accent-700 transition-colors shadow-lg">
                Send Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 py-16 px-6 text-white border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary-900 font-black text-xs">S</div>
              <span className="font-bold text-lg tracking-widest">SHNOOR LMS</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
              The operating system for modern workforce development. Built for speed, compliance, and scale.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Enterprise</a></li>
              <li><a href="#" className="hover:text-white">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Security</a></li>
              <li><a href="#" className="hover:text-white">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-600 font-bold uppercase tracking-wide">
            © 2024 Shnoor Systems Inc.
          </div>
          <div className="flex gap-4">
            {/* Social placeholders could go here */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;