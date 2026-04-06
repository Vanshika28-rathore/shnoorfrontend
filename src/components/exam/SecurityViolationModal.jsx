import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaLock, FaBan } from 'react-icons/fa';


const SecurityViolationModal = ({
    isOpen,
    violationType,
    count,
    maxViolations = 5,
    isTerminated = false,
    onResume
}) => {
    const [timeLeft, setTimeLeft] = useState(5);
    const [animateShow, setAnimateShow] = useState(false);

    // Handle Entry Animation
    useEffect(() => {
        if (isOpen) {
            setAnimateShow(true);
        } else {
            setAnimateShow(false);
        }
    }, [isOpen]);

    // Countdown Timer
    useEffect(() => {
        let timer;
        if (isOpen && !isTerminated) {
            setTimeLeft(5);
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, isTerminated]);

    if (!isOpen) return null;

    // Content & Theme Configuration
    const getTheme = () => {
        if (isTerminated) {
            return {
                title: 'Assessment Terminated',
                desc: 'Maximum security violations exceeded. This session has been flagged and is now closing.',
                icon: <FaBan className="w-8 h-8 text-red-600" />,
                bgIcon: 'bg-red-100',
                border: 'border-red-200',
                progressColor: 'text-red-600',
                btnClass: 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
            };
        }

        switch (violationType) {
            case 'tab-switch':
                return {
                    title: 'Focus Lost Detected',
                    desc: 'Switching tabs or minimizing the browser is strictly prohibited. Please stay on this screen.',
                    icon: <FaExclamationTriangle className="w-8 h-8 text-orange-600" />,
                    bgIcon: 'bg-orange-100',
                    border: 'border-orange-200',
                    progressColor: 'text-orange-600',
                    btnClass: 'bg-slate-900 hover:bg-slate-800 shadow-slate-500/20'
                };
            case 'copy-paste':
                return {
                    title: 'Clipboard Action Blocked',
                    desc: 'Copying, pasting, or context menu usage is disabled to maintain exam integrity.',
                    icon: <FaLock className="w-8 h-8 text-amber-600" />,
                    bgIcon: 'bg-amber-100',
                    border: 'border-amber-200',
                    progressColor: 'text-amber-600',
                    btnClass: 'bg-slate-900 hover:bg-slate-800 shadow-slate-500/20'
                };
            default:
                return {
                    title: 'Security Alert',
                    desc: 'Suspicious activity detected. Please return to the exam immediately.',
                    icon: <FaShieldAlt className="w-8 h-8 text-blue-600" />,
                    bgIcon: 'bg-blue-100',
                    border: 'border-blue-200',
                    progressColor: 'text-blue-600',
                    btnClass: 'bg-slate-900 hover:bg-slate-800 shadow-slate-500/20'
                };
        }
    };

    const theme = getTheme();
    const attemptsLeft = maxViolations - count;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className={`absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300 ease-out ${animateShow ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden="true"
            />

            {/* Modal Card */}
            <div
                className={`
                    relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 
                    transform transition-all duration-300 ease-out 
                    ${animateShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
                `}
            >
                {/* Decorative Top Border */}
                <div className={`h-2 w-full rounded-t-2xl ${isTerminated ? 'bg-red-500' : 'bg-gradient-to-r from-slate-700 to-slate-900'}`} />

                <div className="p-8">
                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme.bgIcon} ring-4 ring-white shadow-sm`}>
                            {theme.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {theme.title}
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            {theme.desc}
                        </p>
                    </div>

                    {/* Progress / Status Indicators */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center justify-center">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Violation Count</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className={`text-2xl font-bold ${theme.progressColor}`}>{count}</span>
                                <span className="text-sm text-gray-400 font-medium">/ {maxViolations}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center justify-center">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Attempts Left</span>
                            <div className="mt-1">
                                {isTerminated ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Zero
                                    </span>
                                ) : (
                                    <span className={`text-2xl font-bold ${attemptsLeft <= 1 ? 'text-red-500' : 'text-gray-700'}`}>
                                        {attemptsLeft}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="space-y-3">
                        {isTerminated ? (
                            <div className="w-full py-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2">
                                <svg className="animate-spin h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm font-semibold text-gray-600">Submitting Assessment...</span>
                            </div>
                        ) : (
                            <button
                                onClick={onResume}
                                disabled={timeLeft > 0}
                                className={`
                                    w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200
                                    flex items-center justify-center gap-2
                                    ${timeLeft > 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                        : `${theme.btnClass} text-white hover:scale-[1.02] shadow-lg`
                                    }
                                `}
                            >
                                {timeLeft > 0 ? (
                                    <>
                                        <span>Resume available in</span>
                                        <span className="font-mono tabular-nums bg-gray-200/50 px-1.5 rounded py-0.5 text-gray-500">
                                            00:0{timeLeft}
                                        </span>
                                    </>
                                ) : (
                                    "I Understand & Resume"
                                )}
                            </button>
                        )}

                        {!isTerminated && (
                            <p className="text-xs text-center text-gray-400 mt-4">
                                Repeated violations will result in automatic disqualification.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityViolationModal;