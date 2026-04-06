import React from 'react';
import { FaExclamationTriangle, FaLock } from 'react-icons/fa';

/**
 * SecurityModal Component
 * 
 * Displays a blocking warning when an exam security violation occurs.
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} violationType - 'tab-switch' | 'copy-paste' | 'fullscreen-exit'
 * @param {number} count - Current violation count
 * @param {number} maxViolations - Maximum allowed violations before auto-submit
 * @param {function} onResume - Callback to acknowledge warning and close modal
 */
const SecurityModal = ({ isOpen, violationType, count, maxViolations = 5, onResume }) => {
    if (!isOpen) return null;

    const remainingAttempts = maxViolations - count;

    // Determine message based on type
    const getMessage = () => {
        switch (violationType) {
            case 'tab-switch':
                return "Tab switching or window blurring is strictly prohibited.";
            case 'copy-paste':
                return "Clipboard actions (Copy, Cut, Paste, Right-Click) are disabled.";
            case 'fullscreen-exit':
                return "You must remain in full-screen mode during the assessment.";
            default:
                return "Suspicious activity detected.";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-bounce-in border-t-8 border-red-600">
                {/* Header */}
                <div className="bg-red-50 p-6 flex flex-col items-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <FaExclamationTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-red-700 uppercase tracking-wide">
                        Security Violation
                    </h2>
                </div>

                {/* Body */}
                <div className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-lg font-bold text-slate-800">
                            {getMessage()}
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            Our system monitors your activity. Continued violations will result in automatic submission of your exam.
                        </p>
                    </div>

                    <div className="bg-slate-100 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500 uppercase">Violation Status</span>
                        <span className="text-lg font-bold text-red-600">
                            {count} <span className="text-slate-400 text-sm">/ {maxViolations}</span>
                        </span>
                    </div>

                    <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded border border-yellow-200 text-left flex items-start gap-2">
                        <FaLock className="mt-1 shrink-0" />
                        <span>
                            <strong>Warning:</strong> You have {remainingAttempts} attempts remaining before your exam is automatically terminated.
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <button
                        onClick={onResume}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-500/30 transition-all text-lg uppercase tracking-wider"
                    >
                        I Acknowledge & Return
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecurityModal;