import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import brandLogo from '../../../assets/SHnoor_logo_1.jpg';
import markLogo from '../../../assets/just_logo.jpeg';

const ForgotPasswordView = ({
    email,
    setEmail,
    message,
    error,
    loading,
    handleReset
}) => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            { }
            <div className="hidden md:flex flex-col justify-between w-5/12 bg-[var(--color-primary-900)] p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                       <img src={brandLogo} alt="Shnoor Logo" style={{ maxWidth: '150px', marginBottom: '20px', borderRadius: '10px', display: 'block' }} />
                    </div>

                    <h2 className="text-4xl font-bold mb-6 tracking-tight leading-tight">
                        Security is our priority.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                        Recover your access safely and securely using our encrypted recovery gateway.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="flex gap-1 text-emerald-400 mb-2">
                            <ShieldCheck size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Encrypted Channel</span>
                        </div>
                        <p className="text-slate-300 text-sm italic">"I was able to recover my account instantly. The security protocols are top-notch."</p>
                    </div>
                </div>

                { }
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-900)] via-transparent to-indigo-900/20 pointer-events-none"></div>
            </div>

            { }
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-white">
                <div className="w-full max-w-[400px]">

                    <div className="mb-10 text-center md:text-left">
                        <div className="hidden md:flex w-12 h-12 bg-slate-100 rounded-xl items-center justify-center mb-6">
                            <KeyRound className="text-slate-900" size={24} />
                        </div>
                        { }
                        <div className="md:hidden flex flex-col items-center mb-6">
                            <img src={markLogo} alt="Logo" className="w-12 h-12 rounded-lg mb-4" />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Access Recovery</h1>
                        <p className="text-slate-500 text-sm">Enter your registered email to receive reset instructions.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 text-left">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2 text-left">
                            <CheckCircle2 size={18} className="shrink-0" />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your gmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-12!"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-(--color-primary) hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending Link...' : 'Send Recovery Link'}
                        </button>

                        <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-indigo-600)] hover:text-indigo-800 transition-colors pt-2">
                            <ChevronLeft size={16} />
                            Back to Authority Gateway
                        </Link>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ForgotPasswordView;
