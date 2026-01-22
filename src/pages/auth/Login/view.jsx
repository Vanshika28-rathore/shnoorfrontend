import React from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Lock, Mail } from "lucide-react";
import brandLogo from "../../../assets/SHnoor_logo_1.jpg";
import markLogo from "../../../assets/just_logo.jpeg";

const LoginView = ({
  formData,
  setFormData,
  showPassword,
  onTogglePassword,
  error,
  loading,
  handleLogin,
  handleGoogleSignIn,
}) => {
  const { email, password, rememberMe } = formData;
  const { setEmail, setPassword, setRememberMe } = setFormData;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* LEFT BRAND SECTION */}
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-(--color-primary-900) p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-[160px] h-[160px] mb-6 flex items-center justify-center bg-white rounded-xl leading-tight">
            <img
              src={brandLogo}
              alt="Shnoor Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Empower your institution with system-level control.
          </h2>
          <p className="text-slate-400 text-lg max-w-sm">
            Streamline administration, enhance learning, and drive results with
            a world-class Learning Management System.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex gap-2 text-emerald-400 mb-2">
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Enterprise Security
              </span>
            </div>
            <p className="text-slate-300 text-sm italic">
              "SHNOOR has completely transformed how we manage our curriculum. A
              true game changer!"
            </p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-900)] via-transparent to-indigo-900/20 pointer-events-none" />
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <div className="flex items-center mb-5">
              <div className="w-[48px] h-[48px] mr-3 flex items-center justify-center leading-tight">
                <img
                  src={markLogo}
                  alt="Shnoor International"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-semibold">
                  SHNOOR International
                </h1>
                <p className="text-xs text-slate-500 tracking-[0.18em] uppercase">
                  Learning Platform
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">System Login</h2>
            <p className="text-slate-500">
              Authorize access to your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <ShieldCheck size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-12"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-indigo-600"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-12 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="ml-2 text-sm text-slate-600">
                Keep me logged in
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Authorizing..." : "Authorize Access"}
            </button>

            {/* GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border py-3 rounded-xl font-semibold"
            >
              Continue with Google
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Don’t have an ID?{" "}
            <Link to="/register" className="font-bold text-indigo-600">
              Request Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
