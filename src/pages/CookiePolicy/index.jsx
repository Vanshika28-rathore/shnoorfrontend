import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CookiePolicy = () => {
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
                            Cookie Policy
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Last Updated: February 10, 2026
                        </p>
                    </div>

                    {/* Introduction */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            What Are Cookies?
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Cookies are small text files that are placed on your device when you visit our Learning Management System (LMS).
                            They help us provide you with a better experience by remembering your preferences, keeping you logged in,
                            and analyzing how you use our platform to make improvements.
                        </p>
                    </section>

                    {/* Types of Cookies */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Types of Cookies We Use
                        </h2>

                        <div className="space-y-6">
                            {/* Essential Cookies */}
                            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                    Essential Cookies
                                </h3>
                                <p className="text-slate-700 leading-relaxed mb-3">
                                    These cookies are necessary for the platform to function properly. They enable core functionality such as:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Authentication and login sessions</li>
                                    <li>Security and fraud prevention</li>
                                    <li>Maintaining your preferences during your session</li>
                                    <li>Remembering items in your course cart</li>
                                </ul>
                                <p className="text-sm text-slate-600 mt-3 italic">
                                    Note: These cookies cannot be disabled as they are essential for the platform to work.
                                </p>
                            </div>

                            {/* Functional Cookies */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                                    Functional Cookies
                                </h3>
                                <p className="text-slate-700 leading-relaxed mb-3">
                                    These cookies allow us to remember your choices and provide enhanced, personalized features:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Remembering your language and region preferences</li>
                                    <li>Saving your display settings (dark mode, text size, etc.)</li>
                                    <li>Remembering your course progress and bookmarks</li>
                                    <li>Storing your cookie consent preferences</li>
                                </ul>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                    Analytics Cookies
                                </h3>
                                <p className="text-slate-700 leading-relaxed mb-3">
                                    These cookies help us understand how you interact with our platform:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Tracking page views and navigation patterns</li>
                                    <li>Measuring course completion rates</li>
                                    <li>Identifying popular courses and content</li>
                                    <li>Analyzing user engagement and performance</li>
                                </ul>
                                <p className="text-slate-600 mt-3">
                                    We use this information to improve our platform and provide a better learning experience.
                                </p>
                            </div>

                            {/* Performance Cookies */}
                            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    Performance Cookies
                                </h3>
                                <p className="text-slate-700 leading-relaxed mb-3">
                                    These cookies help us optimize the performance of our platform:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Monitoring page load times</li>
                                    <li>Detecting and resolving technical issues</li>
                                    <li>Optimizing video streaming quality</li>
                                    <li>Improving application responsiveness</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Cookies */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            How We Use Cookies
                        </h2>
                        <div className="text-slate-700 leading-relaxed space-y-4">
                            <p>
                                We use cookies to enhance your learning experience on our platform. Specifically, cookies help us to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li className="pl-2">Keep you signed in to your account</li>
                                <li className="pl-2">Remember your course progress and quiz results</li>
                                <li className="pl-2">Personalize content and course recommendations</li>
                                <li className="pl-2">Provide customer support and troubleshoot technical issues</li>
                                <li className="pl-2">Analyze platform usage to improve our services</li>
                                <li className="pl-2">Ensure the security and integrity of our platform</li>
                                <li className="pl-2">Deliver relevant notifications and updates</li>
                            </ul>
                        </div>
                    </section>

                    {/* Managing Cookies */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Managing Your Cookie Preferences
                        </h2>
                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                            <p className="text-slate-700 leading-relaxed mb-4">
                                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by:
                            </p>
                            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
                                <li className="pl-2">Using the cookie consent banner when you first visit our site</li>
                                <li className="pl-2">Adjusting your browser settings to block or delete cookies</li>
                                <li className="pl-2">Managing your account preferences in your profile settings</li>
                            </ul>
                            <p className="text-slate-700 leading-relaxed">
                                <strong>Please note:</strong> If you choose to reject or disable cookies, some features of our platform
                                may not function properly, and your experience may be limited.
                            </p>
                        </div>
                    </section>

                    {/* Browser Settings */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Browser Cookie Settings
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Most web browsers allow you to control cookies through their settings. Here are links to cookie
                            management guides for popular browsers:
                        </p>
                        <ul className="space-y-2 text-slate-700">
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-600">→</span>
                                <a
                                    href="https://support.google.com/chrome/answer/95647"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                                >
                                    Google Chrome
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-600">→</span>
                                <a
                                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                                >
                                    Mozilla Firefox
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-600">→</span>
                                <a
                                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                                >
                                    Safari
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-600">→</span>
                                <a
                                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                                >
                                    Microsoft Edge
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* Third-Party Cookies */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Third-Party Cookies
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            In some cases, we use trusted third-party services that may also set cookies on your device.
                            These services include:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li className="pl-2">Analytics providers (to understand user behavior)</li>
                            <li className="pl-2">Content delivery networks (to improve loading speeds)</li>
                            <li className="pl-2">Customer support tools (to provide assistance)</li>
                            <li className="pl-2">Payment processors (for secure transactions)</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed mt-4">
                            These third parties have their own privacy policies and cookie policies, which we encourage you to review.
                        </p>
                    </section>

                    {/* Updates to Policy */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Updates to This Policy
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                            We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                            operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
                            new policy on this page and updating the "Last Updated" date at the top of this policy.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Questions or Concerns?
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                        </p>
                        <div className="space-y-2 text-slate-700">
                            <p className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="font-semibold">Email:</span>
                                <a href="mailto:support@lms.example.com" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                                    support@lms.example.com
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                                    Contact Us Page
                                </Link>
                            </p>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-sm text-slate-500 text-center">
                            By continuing to use our platform, you acknowledge that you have read and understood this Cookie Policy.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CookiePolicy;