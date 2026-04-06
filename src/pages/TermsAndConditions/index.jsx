import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail, Phone, MapPin, MessageCircle,
    Twitter, Facebook, Linkedin, Instagram,
} from 'lucide-react';
import markLogo from '../../assets/image.png';
import WhatsAppContactButton from "../../components/WhatsAppButton";

const TermsAndConditions = () => {
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
                            Terms and Conditions
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Last Updated: February 12, 2026
                        </p>
                    </div>

                    {/* Introduction */}
                    <section className="mb-10">
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Welcome to the SHNOOR Learning Management System ("LMS").
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            These Terms and Conditions govern your access to and use of the LMS operated by SHNOOR INTERNATIONAL LLC. By accessing or using the LMS, you agree to comply with and be bound by these Terms. If you do not agree with any part of these Terms, you must not continue to use the Platform.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            1. Definitions
                        </h2>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li className="pl-2"><strong>"Company", "We", "Us", or "Our"</strong> refers to SHNOOR INTERNATIONAL LLC.</li>
                            <li className="pl-2"><strong>"LMS", "Platform", or "Website"</strong> refers to the SHNOOR Learning Management System and its associated subdomains.</li>
                            <li className="pl-2"><strong>"User", "You", or "Your"</strong> refers to any individual accessing or using the LMS.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            2. Cookies
                        </h2>
                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                            <p className="text-slate-700 leading-relaxed mb-4">
                                The LMS uses cookies to enhance user experience and ensure proper platform functionality. By accessing the LMS, you agree to the use of required cookies.
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Cookies are small text files placed on your device to store information related to your activity. Required cookies are essential for core LMS features such as authentication, session management, and security. Optional cookies may be used for analytics or performance improvement purposes.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                You may choose to accept or decline optional cookies. However, required cookies cannot be disabled as they are necessary for the operation of the LMS. Acceptance of required cookies may also involve the use of third-party cookies when third-party services are integrated into the Platform.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            3. License and Intellectual Property
                        </h2>
                        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Unless otherwise stated, SHNOOR INTERNATIONAL LLC and/or its licensors own all intellectual property rights for the content, materials, software, and features available on the LMS. All rights are reserved.
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                You are granted a limited, non-exclusive, non-transferable license to access and use the LMS for personal, educational, or organizational purposes, subject to these Terms.
                            </p>
                            <p className="text-slate-700 font-semibold mb-3">You must not:</p>
                            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
                                <li className="pl-2">Copy or republish LMS content</li>
                                <li className="pl-2">Sell, rent, or sub-license LMS materials</li>
                                <li className="pl-2">Reproduce, duplicate, or exploit LMS content for commercial purposes</li>
                                <li className="pl-2">Redistribute LMS content without prior written permission</li>
                            </ul>
                            <p className="text-slate-700 leading-relaxed italic">
                                This Agreement becomes effective on the date you first access the LMS.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            4. User Content and Comments
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Certain areas of the LMS may allow users to post content, comments, or feedback. SHNOOR INTERNATIONAL LLC does not pre-screen or edit user-generated content before it appears on the Platform.
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            User-generated content reflects the views of the individual posting it and does not represent the views of SHNOOR INTERNATIONAL LLC, its affiliates, or employees. To the extent permitted by law, the Company shall not be liable for any damages arising from user-generated content.
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We reserve the right to monitor, review, and remove any content deemed inappropriate, offensive, or in violation of these Terms.
                        </p>
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <p className="text-slate-700 font-semibold mb-3">By submitting content, you represent and warrant that:</p>
                            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
                                <li className="pl-2">You have the legal right to post such content</li>
                                <li className="pl-2">The content does not infringe any intellectual property or privacy rights</li>
                                <li className="pl-2">The content is not unlawful, defamatory, or misleading</li>
                            </ul>
                            <p className="text-slate-700 leading-relaxed">
                                You grant SHNOOR INTERNATIONAL LLC a non-exclusive, royalty-free license to use, reproduce, modify, and display your content for LMS-related purposes.
                            </p>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            5. Hyperlinking to Our Platform
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            The following entities may link to the LMS without prior written approval:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
                            <li className="pl-2">Government agencies</li>
                            <li className="pl-2">Search engines</li>
                            <li className="pl-2">News organizations</li>
                            <li className="pl-2">Online directory distributors</li>
                            <li className="pl-2">Accredited educational or business institutions</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Other organizations may request approval for linking by contacting us via email. Approved links must not be deceptive, must not imply endorsement, and must be contextually appropriate.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            Use of SHNOOR INTERNATIONAL LLC's name, logo, or branding for linking purposes requires prior written authorization.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            6. Content Liability
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                            We are not responsible for any content that appears on third-party websites linking to the LMS. You agree to indemnify and defend us against any claims arising from content on your website that links to our Platform.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            7. Reservation of Rights
                        </h2>
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <p className="text-slate-700 leading-relaxed mb-4">
                                We reserve the right to request the removal of any links to the LMS at any time. You agree to comply immediately with such requests. We also reserve the right to amend these Terms and Conditions at our sole discretion.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                Continued use of the LMS following any updates constitutes acceptance of the revised Terms.
                            </p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            8. Removal of Links
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                            If you find any link on the LMS that you consider offensive or inappropriate, you may contact us. While we will review such requests, we are not obligated to remove content or respond to every request.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            9. Availability and Accuracy
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                            We do not guarantee that the LMS content will always be accurate, complete, or up to date. We do not warrant uninterrupted availability or error-free operation of the Platform.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            10. Disclaimer
                        </h2>
                        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                            <p className="text-slate-700 leading-relaxed mb-4">
                                To the maximum extent permitted by applicable law, SHNOOR INTERNATIONAL LLC disclaims all warranties, representations, and conditions related to the LMS and its use.
                            </p>
                            <p className="text-slate-700 font-semibold mb-3">Nothing in this section shall:</p>
                            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
                                <li className="pl-2">Limit or exclude liability for death or personal injury</li>
                                <li className="pl-2">Limit or exclude liability for fraud or fraudulent misrepresentation</li>
                                <li className="pl-2">Limit liabilities in any manner not permitted by law</li>
                            </ul>
                            <p className="text-slate-700 leading-relaxed">
                                As long as the LMS and its services are provided free of charge, we shall not be liable for any loss or damage of any nature.
                            </p>
                        </div>
                    </section>

                    {/* Section 11 */}
                    <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            11. Contact Information
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If you have any questions regarding these Terms and Conditions, please contact us:
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
                            These Terms and Conditions may be updated periodically. Any changes will be effective upon posting on the LMS.
                        </p>
                    </section>

                    {/* Footer Note */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-sm text-slate-500 text-center">
                            By continuing to use our platform, you acknowledge that you have read and understood these Terms and Conditions.
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

export default TermsAndConditions;