import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (cookieConsent) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowBanner(true);
      window.requestAnimationFrame(() => setIsVisible(true));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const closeBanner = (value) => {
    localStorage.setItem("cookieConsent", value);
    setIsVisible(false);
    window.setTimeout(() => setShowBanner(false), 250);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-out md:p-6 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 shadow-2xl md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-50 blur-md" />
                  <svg
                    className="relative h-7 w-7 text-indigo-400"
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

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
                  Cookie Policy
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                    Privacy First
                  </span>
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  We use cookies to enhance your learning experience, analyze
                  site traffic, and personalize content. By clicking "Accept",
                  you consent to our use of cookies. Learn more in our{" "}
                  <Link
                    to="/cookie-policy"
                    className="font-semibold text-indigo-400 underline underline-offset-2 transition-colors hover:text-indigo-300"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <button
              onClick={() => closeBanner("declined")}
              className="rounded-lg border border-slate-600/50 bg-slate-700/50 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:border-slate-500 hover:bg-slate-600/70 hover:shadow-lg"
              aria-label="Decline cookies"
            >
              Decline
            </button>
            <button
              onClick={() => closeBanner("accepted")}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all duration-200 hover:scale-105 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-800/60"
              aria-label="Accept cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
