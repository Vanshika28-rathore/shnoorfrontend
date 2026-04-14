import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Facebook,
  Globe,
  Instagram,
  LayoutPanelTop,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users2,
  Video,
  Workflow,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import markLogo from "../../assets/shnoor_logo.png";
import markLogoLight from "../../assets/shnoor_logo_light.png";
import nasscomLogo from "../../assets/landing/nascom.jpg";
import instructorIcon from "../../assets/landing/instructor.jpg";
import privateIcon from "../../assets/landing/private.jpg";
import selfPacedIcon from "../../assets/landing/self_paced.jpg";
import labsIcon from "../../assets/landing/labs.jpg";
import examIcon from "../../assets/landing/exam.jpg";
import WhatsAppContactButton from "../../components/WhatsAppButton";

const navItems = [
  { id: "home", label: "Home" },
  { id: "how-it-works", label: "How It Works" },
  { id: "platform-features", label: "Features" },
  { id: "about", label: "About" },
  { id: "training", label: "Training" },
];

const trustStats = [
  { value: "500+", label: "Learners onboarded across programs" },
  { value: "8", label: "Core platform capabilities" },
  { value: "99.9%", label: "Reliable learning operations" },
];

const workflowSteps = [
  {
    title: "Launch role-based journeys",
    description:
      "Create onboarding, compliance, and upskilling tracks for teams, departments, or enterprise cohorts.",
    icon: LayoutPanelTop,
  },
  {
    title: "Deliver guided learning",
    description:
      "Combine live sessions, self-paced modules, practice labs, and instructor checkpoints in one place.",
    icon: Video,
  },
  {
    title: "Validate mastery",
    description:
      "Use assessments, assignments, and certification paths to measure skill readiness with confidence.",
    icon: ShieldCheck,
  },
];

const platformCards = [
  {
    title: "Admin control center",
    description:
      "Manage users, programs, reports, approvals, and communication from a single operational dashboard.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Learning delivery engine",
    description:
      "Organize modules, lessons, assignments, and session flows with a clear learner-first experience.",
    icon: Workflow,
  },
  {
    title: "Certifications and outcomes",
    description:
      "Turn learning into proof with completion tracking, exam support, and industry-facing credentials.",
    icon: Award,
  },
];

const featureCards = [
  {
    title: "Structured cohorts",
    description:
      "Run department-wise, company-wise, or role-wise learning journeys at scale.",
    icon: Users2,
  },
  {
    title: "Live instruction",
    description:
      "Deliver interactive sessions with guided training and real-time learner support.",
    icon: Video,
  },
  {
    title: "Practice labs",
    description:
      "Support hands-on implementation so learners can apply concepts immediately.",
    icon: PlayCircle,
  },
  {
    title: "Progress tracking",
    description:
      "Monitor completion, performance, and engagement with admin-friendly reporting.",
    icon: BarChart3,
  },
  {
    title: "Certification paths",
    description:
      "Bundle learning and evaluation into clear outcomes for teams and individuals.",
    icon: Award,
  },
  {
    title: "Compliance readiness",
    description:
      "Maintain records and validate required skills for regulated or audit-sensitive teams.",
    icon: ShieldCheck,
  },
  {
    title: "Fast onboarding",
    description:
      "Get new hires productive faster with guided journeys, milestones, and checkpoints.",
    icon: Clock3,
  },
  {
    title: "Global accessibility",
    description:
      "Deliver training to distributed teams with a modern browser-based experience.",
    icon: Globe,
  },
];

const operationsHighlights = [
  "Built for organizations that need both learning quality and operational visibility.",
  "Designed to keep the learner experience simple while giving administrators strong control.",
  "Consistent workflows for onboarding, enablement, certifications, and long-term capability building.",
];

const trainingCards = [
  {
    title: "Instructor-led training",
    description:
      "Expert-led sessions for structured learning, discussion, and high-touch guidance.",
    image: instructorIcon,
    accent: "from-indigo-50 to-white",
    span: "lg:col-span-4 lg:row-span-2",
  },
  {
    title: "Private corporate programs",
    description:
      "Dedicated sessions and customized tracks aligned to your business goals and team skill gaps.",
    image: privateIcon,
    accent: "from-slate-50 to-white",
    span: "lg:col-span-4",
  },
  {
    title: "Practice arena",
    description:
      "Self-paced exercises, guided reviews, and repeatable practice for long-term retention.",
    image: selfPacedIcon,
    accent: "from-indigo-50 to-slate-50",
    span: "lg:col-span-4",
  },
  {
    title: "Facilitated labs",
    description:
      "Hands-on environments that move learning from theory to execution with confidence.",
    image: labsIcon,
    accent: "from-slate-50 to-indigo-50",
    span: "lg:col-span-4",
  },
  {
    title: "Exam preparation",
    description:
      "Focused review journeys, mock testing, and readiness support for certification outcomes.",
    image: examIcon,
    accent: "from-white to-slate-50",
    span: "lg:col-span-4",
  },
];

const aboutStats = [
  {
    value: "Enterprise-first",
    label: "Professional design language and control",
  },
  { value: "Outcome-driven", label: "Programs mapped to measurable growth" },
  { value: "Flexible delivery", label: "Built for multiple learning models" },
];

const footerLinks = [
  { label: "Home", action: "home" },
  { label: "How It Works", action: "how-it-works" },
  { label: "Training", action: "training" },
];

const LandingView = ({ onLogin, onRegister, onContact }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const NavLink = ({ target, label, onClick, className = "" }) => (
    <button
      onClick={onClick ? onClick : () => scrollToSection(target)}
      className={`text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 ${className}`}
    >
      {label}
    </button>
  );

  const BrandLogo = () => (
    <div className="flex items-center gap-3">
      <img
        src={markLogo}
        alt="Shnoor International Logo"
        width="220"
        loading="eager"
      />
    </div>
  );
  const BrandLogoLight = () => (
    <div className="flex items-center gap-3">
      <img
        src={markLogoLight}
        alt="Shnoor International Logo"
        width="220"
        loading="eager"
      />
    </div>
  );

  const SectionHeader = ({ eyebrow, title, description, align = "center" }) => (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <span className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_56%)]" />
        <div className="absolute right-0 top-80 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute left-0 top-120 h-96 w-96 rounded-full bg-slate-300/25 blur-3xl" />
      </div>

      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "border-b border-slate-200/80 bg-white/92 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-4 py-4 md:min-h-24 md:px-6">
          <BrandLogo />

          <div className="hidden items-center gap-7 rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.id} target={item.id} label={item.label} />
            ))}
            <NavLink target="contact" label="Contact" onClick={onContact} />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={onLogin}
              className="px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950"
            >
              Log In
            </button>
            <button
              onClick={onRegister}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
            >
              Get Started
            </button>
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-50 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full w-full border-b border-slate-200 bg-white shadow-2xl lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  target={item.id}
                  label={item.label}
                  className="w-full rounded-xl px-4 py-3 text-left text-base hover:bg-slate-50"
                />
              ))}
              <NavLink
                target="contact"
                label="Contact"
                onClick={onContact}
                className="w-full rounded-xl px-4 py-3 text-left text-base hover:bg-slate-50"
              />
              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <button
                  onClick={onLogin}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                >
                  Log In
                </button>
                <button
                  onClick={onRegister}
                  className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section
        id="home"
        className="relative z-10 px-6 pb-20 pt-32 md:pt-40 lg:pb-28 lg:pt-44"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
              <Sparkles size={14} className="text-indigo-600" />
              Enterprise Learning Platform
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
              Build smarter workforce training with a landing experience that
              matches your platform quality.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Shnoor International helps organizations deliver structured
              training, practical learning, certification readiness, and
              measurable outcomes through one modern learning ecosystem.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={onRegister}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
              >
                Get Started <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Explore Platform
              </button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm"
                >
                  <div className="text-2xl font-semibold text-slate-950">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-[linear-gradient(135deg,rgba(99,102,241,0.10),rgba(15,23,42,0.05))] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/8">
              <div className="border-b border-slate-200 bg-[linear-gradient(90deg,#0F172A_0%,#1E293B_60%,#312E81_100%)] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
                      Live Learning View
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Career-ready training, operations, and certifications
                    </h3>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-right backdrop-blur-sm">
                    <div className="text-xs text-slate-300">
                      Completion rate
                    </div>
                    <div className="text-lg font-semibold text-white">65%</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 max-w-5xl mx-auto">
                <div className="space-y-4">
                  {/* Current Program */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Current program
                        </p>
                        <p className="text-sm text-slate-600">
                          Enterprise solution architect pathway
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-slate-200">
                      <div className="h-2 w-[65%] rounded-full bg-indigo-600" />
                    </div>
                  </div>

                  {/* Weekly Highlights */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Weekly highlights
                    </p>

                    <div className="mt-4 grid gap-3">
                      {[
                        "Live cohort sessions scheduled",
                        "Assignments reviewed and approved",
                        "Certificates ready for eligible learners",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                        >
                          <CheckCircle2
                            size={18}
                            className="mt-0.5 text-emerald-500"
                          />
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certification Workflow */}
                  <div className="rounded-2xl border border-slate-200 bg-indigo-50/70 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
                        <Award size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Certification workflow
                        </p>
                        <p className="text-sm text-slate-600">
                          Assessment to credential in one seamless flow
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="relative z-10 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="How It Works"
            title="A clear learning workflow for modern organizations"
            description="Every part of the platform is designed to help you launch programs faster, deliver consistent learning experiences, and measure progress without friction."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
                    <step.icon size={24} />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-white px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Platform Flow"
              title="How the Shnoor platform supports every stage of learning"
              description="From admin setup to learner achievement, the platform is built to keep programs organized, consistent, and easy to scale."
              align="left"
            />
            <div className="mt-8 space-y-4">
              {operationsHighlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <CheckCircle2 size={18} className="mt-1 text-indigo-600" />
                  <p className="text-sm leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {platformCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="inline-flex rounded-2xl bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_60%,#312E81_100%)] p-4 text-white shadow-lg shadow-slate-950/10">
                  <card.icon size={22} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="platform-features"
        className="relative z-10 px-6 py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Platform Features"
            title="Eight core capabilities designed for enterprise-ready delivery"
            description="The experience now reflects the same professionalism as your admin panel, with cleaner hierarchy, clearer cards, and stronger consistency throughout the page."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5"
              >
                <div className="inline-flex rounded-2xl bg-indigo-50 p-3.5 text-indigo-600">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_58%,#312E81_100%)] p-8 text-white shadow-2xl shadow-slate-950/10 md:p-10">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Recognition
            </span>
            <h3 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Trusted direction, serious execution, and a platform built for
              professional learning outcomes.
            </h3>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Shnoor combines practical delivery, clear evaluation, and modern
              reporting so organizations can train with confidence and learners
              can move toward meaningful certification milestones.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Professional admin experience",
                "Consistent learner journeys",
                "Certification-ready workflows",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <img
                  src={nasscomLogo}
                  alt="NASSCOM certified"
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Milestone
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                  Proudly recognized by NASSCOM
                </h3>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-600 md:text-base">
              Our proposal has been approved by NASSCOM, reinforcing the
              strength of our vision, process maturity, and long-term commitment
              to quality.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-700">
                This recognition strengthens trust in the Shnoor platform as a
                serious, professional learning environment for organizations and
                learners alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="relative z-10 bg-white px-6 py-20 md:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="About Us"
              title="Shnoor International is built to make professional learning feel reliable, modern, and measurable"
              description="We focus on enterprise learning experiences that feel clear for learners and efficient for administrators. That means thoughtful journeys, better visibility, and a platform that supports real outcomes instead of only content delivery."
              align="left"
            />
          </div>
          <div className="grid gap-5">
            {aboutStats.map((item) => (
              <div
                key={item.value}
                className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-xl font-semibold text-slate-950">
                  {item.value}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.label}
                </p>
              </div>
            ))}
            <div className="rounded-[1.75rem] border border-indigo-100 bg-indigo-50/70 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white p-3 text-indigo-600 shadow-sm">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Designed for long-term growth
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Whether the need is onboarding, internal training,
                    certification, or multi-format workforce development, the
                    platform is ready to scale with your organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="training" className="relative z-10 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Training Options"
            title="Flexible delivery models presented in a cleaner bento-style layout"
            description="This section gives each learning format stronger visual priority while staying light, responsive, and consistent with the rest of the experience."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-8">
            {trainingCards.map((card) => (
              <div
                key={card.title}
                className={`overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm ${card.span}`}
              >
                <div className="grid h-full gap-0 md:grid-cols-[0.95fr_1.05fr] xl:grid-cols-[0.95fr_1.05fr]">
                  <div className={`bg-gradient-to-br ${card.accent} p-6`}>
                    <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white/80">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-56 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-6 md:p-7">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-20 pt-6 md:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_55%,#312E81_100%)] px-8 py-10 text-white shadow-2xl shadow-slate-950/10 md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
                Ready To Start
              </span>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
                Transform the first impression of your platform and guide
                learners into a more professional experience.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                From onboarding to certification, Shnoor now feels more
                consistent, polished, and aligned with the visual language
                already present in your admin panel.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                onClick={onRegister}
                className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create Account
              </button>
              <button
                onClick={onContact}
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800 bg-[#0F172A] px-6 pb-8 pt-16 text-left font-medium">
        <div className="mx-auto mb-16 grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="mb-6">
              <BrandLogoLight />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Transform your learning process with a platform that supports
              training paths, progress visibility, and skill validation in one
              consistent experience.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-6 text-lg font-semibold text-white">
              Quick Links
            </h4>
            <ul className="space-y-4 text-sm">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollToSection(item.action)}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onContact}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Contact Us
                </button>
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

export default LandingView;
