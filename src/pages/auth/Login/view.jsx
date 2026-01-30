import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, Lock, Mail } from 'lucide-react';
import brandLogo from '../../../assets/SHnoor_logo_1.jpg';
import markLogo from '../../../assets/just_logo.jpeg';

const LoginView = ({
    formData,
    setFormData,
    showPassword,
    onTogglePassword,
    error,
    loading,
    handleLogin,
    handleGoogleSignIn
}) => {
    const { email, password, rememberMe } = formData;
    const { setEmail, setPassword, setRememberMe } = setFormData;
        const onFormSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLogin(e);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            { }
            <div className="hidden md:flex flex-col justify-between w-5/12 bg-[var(--color-primary-900)] p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center mb-2 mr-100">
                        <img src={brandLogo} alt="Shnoor Logo" style={{ maxWidth: '150px', marginBottom: '20px', borderRadius: '10px', display: 'block' }} />

                    </div>

                    <h2 className="text-4xl font-bold mb-6 tracking-tight leading-tight">
                        Empower your institution with system-level control.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                        Streamline administration, enhance learning, and drive results with a world-class Learning Management System.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="flex gap-1 text-emerald-400 mb-2">
                            <ShieldCheck size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Enterprise Security</span>
                        </div>
                        <p className="text-slate-300 text-sm italic">"SHNOOR has completely transformed how we manage our curriculum. A true game changer!"</p>
                    </div>
                </div>

                { }
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-900)] via-transparent to-indigo-900/20 pointer-events-none"></div>
            </div>

            { }
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-white">
                <div className="w-full max-w-[400px]">

                    { }
                    <div className="mb-10">
                        <div className="flex items-center mb-5">
                            <img
                                src={markLogo}
                                alt="Shnoor International"
                                style={{ width: '70px', height: '55px', marginLeft: '0px' }}
                            />
                            <div>
                                <h1 className="brand-logo text-primary text-xl md:text-2xl font-semibold mb-1 tracking-tight leading-tight">
                                    SHNOOR International
                                </h1>
                                <p className="text-xs md:text-sm text-slate-500 font-medium tracking-[0.18em] uppercase">
                                    Learning Platform
                                </p>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">System Login</h1>
                        <p className="text-slate-500">Authorize access to your dashboard.</p>
                    </div>

                    { }
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                            <ShieldCheck size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={onFormSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your gmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field !pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                                <Link to="/forgot-password" className="text-xs font-bold text-[var(--color-indigo-600)] hover:text-indigo-800 hover:underline">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field !pl-12 pr-11"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                    onClick={onTogglePassword}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-[var(--color-indigo-600)] border-slate-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-[var(--color-indigo-600)]/20"
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm font-medium text-slate-600 cursor-pointer select-none">Keep me logged in</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-primary)] hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 transform transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 text-sm">
                                    Authorizing...
                                </span>
                            ) : (
                                <span className="text-sm">Authorize Access</span>
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-slate-400 font-bold uppercase tracking-wider">Or</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-600">
                        Don't have an ID?{' '}
                        <Link to="/register" className="font-bold text-[var(--color-indigo-600)] hover:text-indigo-800 hover:underline">
                            Request Account
                        </Link>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default LoginView;