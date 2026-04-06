/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, LockKeyhole, Mail, Sparkles, BookOpen, Users, Award } from 'lucide-react';
import brandLogo from '../../../assets/SHnoor_logo_1.jpg';
const markLogo = '/just_logo.svg';

const FeaturePill = ({ icon: Icon, text }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '30px', padding: '8px 14px', fontSize: '13px',
        color: 'rgba(255,255,255,0.85)', fontWeight: 500,
    }}>
        <Icon size={14} style={{ color: '#a5b4fc', flexShrink: 0 }} />
        {text}
    </div>
);

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
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#D8E2EB' }}>
            <style>
                {`
                @keyframes logoBlink {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                .logo-blink-effect {
                    animation: logoBlink 2s ease-in-out infinite;
                }
                `}
            </style>

            {/* ══ LEFT HERO PANEL ══ */}
            <div className="hidden md:flex" style={{
                width: '42%', flexShrink: 0, flexDirection: 'column',
                justifyContent: 'space-between', padding: '48px',
                background: 'linear-gradient(160deg, #181F4D 0%, #11163dff 60%, #1a2456 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '60px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(99,102,241,0.07)', pointerEvents: 'none' }} />

                {/* Top: Logo + Headline */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '40px' }}>
                        <div className="logo-blink-effect" style={{ background: '#fff', borderRadius: '20px', padding: '10px', display: 'inline-flex', marginBottom: '12px', boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
                            <img src={markLogo} alt="SHNOOR Icon" style={{ width: '64px', height: '64px' }} />
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>SHNOOR</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '3px', marginTop: '4px' }}>International LLC</div>
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
                        Empower your institution with system-level control.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: 1.7, maxWidth: '340px', marginBottom: '32px' }}>
                        Streamline administration, enhance learning, and drive results with a world-class LMS.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <FeaturePill icon={BookOpen} text="100+ expert-led courses" />
                        <FeaturePill icon={Award} text="Earn certificates & credentials" />
                        <FeaturePill icon={Users} text="10,000+ active learners" />
                    </div>
                </div>

                {/* Bottom: Testimonial card */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', padding: '20px', backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', marginBottom: '8px' }}>
                            <ShieldCheck size={16} />
                            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Enterprise Security</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>
                            "SHNOOR has completely transformed how we manage our curriculum. A true game changer!"
                        </p>
                    </div>
                </div>
            </div>

            {/* ══ RIGHT FORM PANEL ══ */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    {/* White Card */}
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 40px rgba(24,31,77,0.10)', border: '1px solid rgba(24,31,77,0.06)' }}>

                        {/* Brand header */}
                        <div className="logo-blink-effect" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
                            <img src={markLogo} alt="SHNOOR" style={{ width: '60px', height: '60px' }} />
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#181F4D', letterSpacing: '-0.5px' }}>SHNOOR International LLC</div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2.5px' }}>Learning Platform</div>
                            </div>
                        </div>


                        {/* Title */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Sparkles size={16} style={{ color: '#6366f1' }} />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Welcome Back</span>
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#181F4D', letterSpacing: '-0.5px', margin: 0 }}>System Login</h1>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>Sign in to your dashboard to continue.</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>
                                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Email */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                        <Mail size={17} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                                    <Link to="/forgot-password" style={{ fontSize: '12px', fontWeight: 600, color: '#181F4D', textDecoration: 'none' }}
                                        onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                        onMouseLeave={e => e.target.style.textDecoration = 'none'}
                                    >Forgot Password?</Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                        <LockKeyhole size={17} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '12px 44px 12px 42px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', letterSpacing: '3px' }}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                    <button type="button" onClick={onTogglePassword} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '4px' }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid #cbd5e1', accentColor: '#181F4D', cursor: 'pointer' }}
                                />
                                <label htmlFor="rememberMe" style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 500, color: '#475569', cursor: 'pointer', userSelect: 'none' }}>Keep me logged in</label>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: loading ? '#94a3b8' : '#181F4D', color: '#fff', fontSize: '14px', fontWeight: 700, marginTop: '8px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(24,31,77,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#252d6e'; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#181F4D'; }}
                            >
                                {loading ? 'Logging in...' : 'Sign In to Dashboard →'}
                            </button>

                            {/* Divider */}
                            <div style={{ position: 'relative', margin: '24px 0 8px' }}>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '100%', borderTop: '1px solid #e2e8f0' }}></div>
                                </div>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ padding: '0 12px', background: '#fff', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Or continue with</span>
                                </div>
                            </div>

                            {/* Google Sign In */}
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
                                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
                            >
                                <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </form>

                        {/* Footer link */}
                        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                            Need an account?{' '}
                            <Link to="/register" style={{ fontWeight: 700, color: '#181F4D', textDecoration: 'none' }}
                                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={e => e.target.style.textDecoration = 'none'}
                            >
                                Request Access
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;