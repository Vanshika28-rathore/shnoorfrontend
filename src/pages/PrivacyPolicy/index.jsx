import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail, Phone, MapPin, MessageCircle,
    Twitter, Facebook, Linkedin, Instagram,
} from 'lucide-react';
import markLogo from '../../assets/image.png';
import WhatsAppContactButton from "../../components/WhatsAppButton";

const PrivacyPolicy = () => {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Effective Date: February 12, 2026
                        </p>
                    </div>

                    {/* Introduction */}
                    <section className="mb-10">
                        <p className="text-slate-700 leading-relaxed mb-4">
                            The SHNOOR Learning Management System ("LMS") is owned and operated by SHNOOR INTERNATIONAL LLC, which acts as the data controller of your personal data.
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            This Privacy Policy explains how we collect, use, process, store, and protect your information when you access or use our LMS platform (the "Platform"). By using the LMS, you agree to the collection and use of information in accordance with this Policy. We encourage you to read this document carefully before using the Platform.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            1. Our Commitment to Privacy
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                            We respect your privacy and are committed to protecting your personal data. We adopt appropriate technical and organizational measures to ensure the confidentiality, integrity, and security of the information we collect and process.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            2. Personal Information We Collect
                        </h2>

                        <div className="space-y-6">
                            {/* Automatically Collected */}
                            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                    a) Information Collected Automatically
                                </h3>
                                <p className="text-slate-700 leading-relaxed mb-3">
                                    When you access the LMS, we may automatically collect certain information about your device and usage, including but not limited to:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Browser type and version</li>
                                    <li>IP address</li>
                                    <li>Time zone and location data (approximate)</li>
                                    <li>Device information</li>
                                    <li>Cookies and similar tracking technologies</li>
                                    <li>Pages visited, features used, and interaction data</li>
                                </ul>
                                <p className="text-slate-700 mt-3">
                                    This data is collectively referred to as "Device Information."
                                </p>
                            </div>

                            {/* Information You Provide */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                                    b) Information You Provide to Us
                                </h3>
                                <p className="text-slate-700 leading-relaxed mb-3">
                                    When you register for or use the LMS, we may collect personal information that you voluntarily provide, including:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Full name</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Organization / Institution name</li>
                                    <li>Login credentials</li>
                                    <li>Course enrollment details</li>
                                    <li>Assessment results and progress data</li>
                                    <li>Payment or billing information (if applicable)</li>
                                </ul>
                                <p className="text-slate-700 mt-3">
                                    This information is collected to provide access to LMS features and to fulfill contractual and operational requirements.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            3. Why We Process Your Data
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We process your personal data only when necessary and for legitimate purposes, including:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li className="pl-2">Creating and managing user accounts</li>
                            <li className="pl-2">Providing access to courses, assessments, and certifications</li>
                            <li className="pl-2">Tracking learning progress and performance</li>
                            <li className="pl-2">Communicating important updates and notifications</li>
                            <li className="pl-2">Improving platform performance and user experience</li>
                            <li className="pl-2">Detecting and preventing fraud, abuse, or security issues</li>
                            <li className="pl-2">Complying with legal and regulatory obligations</li>
                        </ul>
                        <p className="text-slate-700 mt-4">
                            Automatically collected information is primarily used for analytics, security monitoring, and system optimization and does not directly identify individual users.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            4. Optional Information
                        </h2>
                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                            <p className="text-slate-700 leading-relaxed mb-3">
                                You may choose not to provide certain personal information. However, doing so may limit your ability to access specific LMS features such as course enrollment, assessments, certificates, or support services.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                If you are unsure which information is mandatory, you may contact us at <a href="mailto:info@shnoor.com" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">info@shnoor.com</a>.
                            </p>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            5. Your Rights
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If you are a resident of the European Economic Area (EEA), you have the following rights regarding your personal data:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li className="pl-2">The right to be informed</li>
                            <li className="pl-2">The right of access</li>
                            <li className="pl-2">The right to rectification</li>
                            <li className="pl-2">The right to erasure (right to be forgotten)</li>
                            <li className="pl-2">The right to restrict processing</li>
                            <li className="pl-2">The right to data portability</li>
                            <li className="pl-2">The right to object to processing</li>
                            <li className="pl-2">Rights related to automated decision-making and profiling</li>
                        </ul>
                        <p className="text-slate-700 mt-4">
                            To exercise any of these rights, please contact us using the details provided below.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            6. International Data Transfers
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                            Your information may be transferred to and processed in countries outside of your country of residence, including the United States and other jurisdictions where our infrastructure or service providers are located. We ensure that such transfers comply with applicable data protection laws.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            7. Links to Third-Party Websites
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                            The LMS may contain links to third-party websites or tools. We are not responsible for the privacy practices or content of such external sites. We recommend reviewing the privacy policies of any third-party services you access.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            8. Information Security
                        </h2>
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <p className="text-slate-700 leading-relaxed mb-3">
                                We store personal data on secure servers and implement reasonable administrative, technical, and physical safeguards to protect against unauthorized access, alteration, disclosure, or destruction of data.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                However, please note that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            9. Legal Disclosure
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We may disclose your personal information if required to do so by law or in good faith belief that such action is necessary to:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li className="pl-2">Comply with legal obligations</li>
                            <li className="pl-2">Protect and defend our rights or property</li>
                            <li className="pl-2">Protect the safety of users or the public</li>
                            <li className="pl-2">Investigate fraud or security issues</li>
                            <li className="pl-2">Respond to lawful government requests</li>
                        </ul>
                    </section>

                    {/* Section 10 */}
                    <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            10. Contact Information
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy, your personal data, or your rights, please contact us:
                        </p>
                        <div className="space-y-2 text-slate-700">
                            <p className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="font-semibold">Email:</span>
                                <a href="mailto:info@shnoor.com" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                                    info@shnoor.com
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-semibold">Company:</span>
                                SHNOOR INTERNATIONAL LLC
                            </p>
                        </div>
                        <p className="text-slate-700 leading-relaxed mt-4 italic text-sm">
                            This Privacy Policy may be updated from time to time. Any changes will be reflected on this page with an updated effective date.
                        </p>
                    </section>

                    {/* Footer Note */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-sm text-slate-500 text-center">
                            By continuing to use our platform, you acknowledge that you have read and understood this Privacy Policy.
                        </p>
                    </div>
                </div>
            </motion.div>

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
                            <li><Link to="/" className="!text-[#94a3b8] hover:!text-white transition-colors">Home</Link></li>
                            <li><Link to="/" className="!text-[#94a3b8] hover:!text-white transition-colors">Training</Link></li>
                            <li><Link to="/contact" className="!text-[#94a3b8] hover:!text-white transition-colors">Contact Us</Link></li>
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

export default PrivacyPolicy;