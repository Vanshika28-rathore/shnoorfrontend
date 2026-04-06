import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Menu, X, Terminal, BarChart3, CheckCircle2,
  Mail, Phone, MapPin, Play, MessageCircle,
  Twitter, Facebook, Linkedin, Instagram,
  Globe, Zap, GraduationCap, Layout, BookOpen, Video, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import markLogo from '../../assets/image.png';
import nasscomLogo from '../../assets/nascom.jpg';

import instructorIcon from '../../assets/instructor.png';
import privateIcon from '../../assets/private.png';
import selfPacedIcon from '../../assets/self_paced.png';
import labsIcon from '../../assets/labs.png';
import examIcon from '../../assets/exam.png';
import WhatsAppContactButton from "../../components/WhatsAppButton";
const LandingView = ({ onLogin, onRegister, onContact }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const NavLink = ({ target, label, onClick }) => (
    <button
      onClick={onClick ? onClick : () => scrollToSection(target)}
      className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors tracking-wide"
    >
      {label}
    </button>
  );

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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full border border-white/50 backdrop-blur-sm">
            <NavLink target="home" label="Home" />
            <NavLink target="training" label="Training" />
            <NavLink target="certification" label="Certifications" />
            <NavLink target="stories" label="Success Stories" />
            <NavLink target="contact" label="Contact" onClick={onContact} />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors px-4">
              Log In
            </button>
            <button onClick={onRegister} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/25">
              Get Started
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
            <NavLink target="home" label="Home" />
            <NavLink target="training" label="Training" />
            <NavLink target="certification" label="Certifications" />
            <NavLink target="stories" label="Success Stories" />
            <NavLink target="contact" label="Contact" onClick={onContact} />
            <hr className="border-slate-100" />
            <button onClick={onLogin} className="w-full h-12 border border-slate-200 rounded-xl font-bold text-slate-900">Log In</button>
            <button onClick={onRegister} className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold">Get Started</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative pt-36 pb-20 px-6 lg:pt-48 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Text */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Platform AV</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Mastery Is Not <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
                An Accident.
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              The all-in-one learning operating system. Train your workforce, validate skills with code-native exams, and certify compliance in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={onRegister} className="h-14 px-8 bg-slate-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl hover:shadow-slate-900/30 hover:-translate-y-1">
                Start Learning Now <ArrowRight size={18} />
              </button>
              <button onClick={() => scrollToSection('training')} className="h-14 px-8 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-sm uppercase tracking-widest hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
                Explore Platform
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-slate-400 grayscale opacity-70">
              <span className="font-bold text-xl">ACME Corp</span>
              <span className="font-bold text-xl">GlobalTech</span>
              <span className="font-bold text-xl">Nebula</span>
              <span className="font-bold text-xl">Vertex</span>
            </div>
          </div>

          {/* Right Column: Visual Mockup (LMS DASHBOARD) */}
          <div className="hidden lg:block relative h-full min-h-[500px] perspective-[2000px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-100/50 to-slate-100/50 rounded-full blur-3xl -z-10 animate-pulse"></div>

            {/* 3D Container */}
            <div className="absolute top-12 left-10 right-10 bg-[#1e293b] backdrop-blur-xl border border-slate-700 shadow-2xl rounded-3xl overflow-hidden transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out z-10 font-sans">

              {/* LMS Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a] border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ongoing Course</div>
                    <div className="text-sm font-bold text-white tracking-wide">Enterprise Solution Architect</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-1.5 font-medium flex items-center justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 65% Completed
                  </div>
                  <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[65%] h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                  </div>
                </div>
              </div>

              {/* LMS Body: Course Player UI */}
              <div className="flex h-[320px] bg-[#1e293b]">
                {/* Sidebar (Modules) */}
                <div className="w-[35%] border-r border-slate-700/50 p-4 space-y-2 hidden sm:block overflow-y-auto custom-scrollbar">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Course Content</div>

                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-xs cursor-pointer transition-all duration-200 group ${i === 3 ? 'bg-indigo-600/10 border border-indigo-500/30 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-700/30'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${i < 3 ? 'border-green-500/50 bg-green-500/10 text-green-500' : (i === 3 ? 'border-indigo-500 text-indigo-400' : 'border-slate-600')}`}>
                        {i < 3 ? <CheckCircle2 size={10} /> : (i === 3 ? <Play size={8} fill="currentColor" /> : <span className="text-[8px]">{i}</span>)}
                      </div>
                      <div className="flex-1 truncate font-medium">
                        {['System Design Basics', 'Microservices 101', 'Scalability Patterns', 'Security Protocols'][i - 1]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Content (Video Player Mockup) */}
                <div className="flex-1 p-6 flex flex-col relative">
                  {/* Video Screen */}
                  <div className="flex-1 bg-slate-900 rounded-xl relative overflow-hidden group cursor-pointer border border-slate-700/50 shadow-2xl">
                    {/* Abstract Video Content */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                      {/* Play Button */}
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20 shadow-xl z-10">
                        <Play size={28} className="text-white fill-current ml-1 drop-shadow-md" />
                      </div>
                    </div>

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex justify-between text-[10px] text-slate-300 font-mono mb-2">
                        <span>14:20</span>
                        <span>45:00</span>
                      </div>
                      <div className="w-full h-1 bg-white/20 rounded-full cursor-pointer">
                        <div className="w-[32%] h-full bg-indigo-500 rounded-full relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">03. Scalability Patterns</h4>
                      <p className="text-slate-400 text-xs mt-1">Understanding horizontal vs vertical scaling strategies.</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-900/20">
                      Next Lesson
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 1: Certificate (Bottom Left) */}
            <div className="absolute top-[75%] -left-8 bg-white p-4 pr-8 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex items-center gap-4 animate-[bounce_4s_infinite] z-20 border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner ring-4 ring-indigo-50">
                <Award size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Certificate Earned</div>
                <div className="text-xs text-slate-500 font-medium">Cloud Architecture</div>
              </div>
            </div>

            {/* Floating Card 2: Skill Unlocked (Top Right - REPLACED LIVE SESSION) */}
            <div className="absolute top-12 -right-12 bg-white p-3 pr-5 rounded-2xl shadow-2xl flex items-center gap-3 z-30 animate-[bounce_6s_infinite] border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Skill Unlocked</div>
                <div className="text-xs text-slate-500 font-medium">System Design</div>
              </div>
            </div>

            {/* Floating Card 3: Mentor (Bottom Right) */}
            <div className="absolute bottom-12 -right-4 bg-white p-3 pr-6 rounded-2xl shadow-xl flex items-center gap-3 z-30 animate-[bounce_5s_infinite] border border-slate-100">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Annie&mouth=smile" alt="Mentor" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Feedback Received</div>
                <div className="text-[10px] text-slate-500 font-medium">Great project work!</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- TRAINING OPTIONS GRID (FIXED RATIO) --- */}
      <section id="training" className="py-20 px-6 relative z-10 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Flexible Training Options
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Choose the learning style that fits your schedule and goals.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {/* Card 1: Instructor-Led */}
            <div className="w-full md:w-[45%] lg:w-[30%] group p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 text-center flex flex-col items-center">
              {/* ADJUSTED: Smaller circle (w-32), Larger relative image (w-24) to fill space */}
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <img src={instructorIcon} alt="Instructor-Led" className="w-24 h-24 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instructor-Led Training</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Join live, interactive sessions with expert instructors. Real-time Q&A, hands-on guidance, and structured learning paths.
              </p>
            </div>

            {/* Card 2: Private Training */}
            <div className="w-full md:w-[45%] lg:w-[30%] group p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <img src={privateIcon} alt="Private Training" className="w-24 h-24 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Private Training</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Dedicated sessions tailored for your corporate team. Customized curriculum to meet your specific business goals.
              </p>
            </div>

            {/* Card 3: Practice Arena */}
            <div className="w-full md:w-[45%] lg:w-[30%] group p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <img src={selfPacedIcon} alt="Practice Arena" className="w-24 h-24 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Practice Arena</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Sharpen your skills with interactive video modules. Watch expert solution breakdowns and tackle algorithmic challenges.
              </p>
            </div>

            {/* Card 4: Facilitated Labs */}
            <div className="w-full md:w-[45%] lg:w-[30%] group p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <img src={labsIcon} alt="Facilitated Labs" className="w-24 h-24 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Facilitated Labs</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Experience code-native learning. Our browser-based IDE (powered by Monaco) lets you run, debug, and test code instantly.
              </p>
            </div>

            {/* Card 5: Exam Prep */}
            <div className="w-full md:w-[45%] lg:w-[30%] group p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <img src={examIcon} alt="Exam Prep" className="w-24 h-24 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Exam Prep</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Comprehensive study guides, practice tests, and review sessions to ensure you ace your certification exams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CERTIFICATION SECTION --- */}
      <section id="certification" className="py-20 px-6 bg-slate-100/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">
            Set Yourself Apart with <br /> Industry-Recognized Certifications
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
            Validate your expertise and advance your career. Our certifications are recognized globally and demonstrate your mastery of the Shnoor ecosystem.
          </p>
          <button onClick={onRegister} className="h-14 px-10 bg-indigo-600 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-600/30">
            Explore Certifications
          </button>
        </div>
      </section>

      {/* --- DARK AWARD BANNER (NASSCOM) --- */}
      <section className="bg-slate-900 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 relative z-10">
          <div className="w-36 h-36 rounded-full border-4 border-white/20 flex items-center justify-center bg-white backdrop-blur-sm shadow-2xl relative p-4">
            <img
              src={nasscomLogo}
              alt="NASSCOM Certified"
              className="w-full h-auto object-contain"
            />
            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Milestone</div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Proudly Recognized by NASSCOM</h3>
            <p className="text-slate-400 max-w-lg">
              Our proposal has been officially approved by NASSCOM, marking a significant step toward becoming a Certified Company—validating our vision, ethics, and process excellence.
            </p>
            <button className="mt-6 text-sm font-bold text-indigo-400 hover:text-white transition-colors flex items-center gap-2 mx-auto md:mx-0">
              Read the Announcement <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* --- SUCCESS STORIES --- */}
      <section id="stories" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              See How Our Students Have Transformed
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all text-center group">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Globe size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Tech Giants Corp</h4>
              <p className="text-slate-500 italic mb-6">"Shnoor's platform helped us onboard 500+ engineers in record time. The hands-on labs were a game changer."</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all text-center group">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Zap size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Innovate Inc</h4>
              <p className="text-slate-500 italic mb-6">"The certification paths gave our team a clear roadmap for growth. We've seen a 40% boost in productivity."</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all text-center group">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <GraduationCap size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Future Academy</h4>
              <p className="text-slate-500 italic mb-6">"Our students love the interactive coding challenges. It makes complex concepts easy to digest and apply."</p>
            </div>
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
              <li><button onClick={() => scrollToSection('home')} className="!text-[#94a3b8] hover:!text-white transition-colors">Home</button></li>
              <li><button onClick={() => scrollToSection('training')} className="!text-[#94a3b8] hover:!text-white transition-colors">Training</button></li>
              <li><button onClick={onContact} className="!text-[#94a3b8] hover:!text-white transition-colors">Contact Us</button></li>
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

export default LandingView;