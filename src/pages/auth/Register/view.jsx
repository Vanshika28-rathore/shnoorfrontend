import React from 'react';
import { Link } from 'react-router-dom';
import {
    Eye,
    EyeOff,
    UserPlus,
    GraduationCap,
    Briefcase,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    ShieldCheck
} from 'lucide-react';
import brandLogo from '../../../assets/SHnoor_logo_1.jpg';
import markLogo from '../../../assets/just_logo.jpeg';

const RegisterView = ({
    step,
    formData,
    error,
    loading,
    successMessage,
    showPassword,
    showConfirmPassword,
    handleChange,
    handleRoleSelect,
    handleBack,
    handleRegister,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility
}) => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            { }
            <div className="hidden md:flex flex-col justify-between w-5/12 bg-[var(--color-primary-900)] p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center mb-2 mr-100">
                        <img src={brandLogo} alt="Shnoor Logo" style={{ maxWidth: '150px', marginBottom: '20px', borderRadius: '10px', display: 'block' }} />
                    </div>

                    <h2 className="text-4xl font-bold mb-6 tracking-tight leading-tight">
                        Join the future of education management.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                        Create your account to access world-class learning tools and comprehensive analytics.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="flex gap-1 text-emerald-400 mb-2">
                            <ShieldCheck size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Secure Enrollment</span>
                        </div>
                        <p className="text-slate-300 text-sm italic">"The onboarding process was seamless. I was up and running in minutes!"</p>
                    </div>
                </div>

                { }
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-900)] via-transparent to-indigo-900/20 pointer-events-none"></div>
            </div>

            { }
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-white">
                <div className="w-full max-w-[480px]">

                    <div className="mb-10 text-center md:text-left">
                        <div className="flex items-center mb-5">
                            <img
                                src={markLogo}
                                alt="Shnoor International"
                                style={{ width: '70px', height: '60px', marginLeft: '0px' }}
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

                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                            {step === 1 ? 'Select Account Type' : 'Complete Enrollment'}
                        </h1>
                        <p className="text-slate-500">
                            {step === 1 ? 'Choose your role to continue.' : `Registering as ${formData.role === 'student' ? 'Student' : 'Instructor'}`}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
                            <CheckCircle2 size={18} className="shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <button
                                onClick={() => handleRoleSelect('student')}
                                className="w-full group p-6 rounded-2xl border border-slate-200 hover:border-[var(--color-indigo-600)] bg-white hover:bg-slate-50 transition-all text-left flex items-center gap-5"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[var(--color-indigo-600)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Student Account</h3>
                                    <p className="text-xs text-slate-500 mt-1">Access courses, exams, and track your progress.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleRoleSelect('instructor')}
                                className="w-full group p-6 rounded-2xl border border-slate-200 hover:border-[var(--color-indigo-600)] bg-white hover:bg-slate-50 transition-all text-left flex items-center gap-5"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[var(--color-indigo-600)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Instructor Account</h3>
                                    <p className="text-xs text-slate-500 mt-1">Create courses, manage students, and view analytics.</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter User name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your gmail"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Create password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="input-field pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="input-field pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-[var(--color-primary)] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            Creating...
                                        </span>
                                    ) : (
                                        <>
                                            Create Account
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-[var(--color-indigo-600)] hover:text-indigo-800 hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default RegisterView;