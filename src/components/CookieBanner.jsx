import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            // Show banner after a short delay for better UX
            setTimeout(() => setShowBanner(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl shadow-2xl border border-indigo-500/20 p-6 md:p-8 relative overflow-hidden">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-start gap-3">
                                    {/* Cookie Icon with glow effect */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-50 rounded-full" />
                                            <svg
                                                className="w-7 h-7 text-indigo-400 relative"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                            Cookie Policy
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                                                Privacy First
                                            </span>
                                        </h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            We use cookies to enhance your learning experience, analyze site traffic, and personalize content.
                                            By clicking "Accept", you consent to our use of cookies. Learn more in our{' '}
                                            <Link
                                                to="/cookie-policy"
                                                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors"
                                            >
                                                Cookie Policy
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleDecline}
                                    className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/70 text-white font-semibold rounded-lg transition-all duration-200 border border-slate-600/50 hover:border-slate-500 hover:shadow-lg"
                                    aria-label="Decline cookies"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-800/60 hover:scale-105"
                                    aria-label="Accept cookies"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;