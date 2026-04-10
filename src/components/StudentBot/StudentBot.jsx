import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import botAvatarSvg from "../../assets/bot-avatar.avif";
import { useAuth } from "@auth/useAuth";

const avatarModules = import.meta.glob("/src/assets/bot-avatar.*", {
  eager: true,
});
let botAvatarUrl = botAvatarSvg;

// Theme constants — change these to tweak colors & thickness quickly
const THEME = {
  RING_START: "#8b5cf6", // purple-500
  RING_MID: "#ec4899", // fuchsia-500
  RING_END: "#4f46e5", // indigo-600
  CORE_BG: "#0f172a", // inner core color (dark)
  SEND_START: "#2817a2", // send button start gradient (gray-700)
  SEND_END: "#193e8e", // send button end gradient (gray-900)
  // Blue message theme (bot = soft blue card, user = blue gradient)
  BOT_BG: "#eff6ff", // blue-50
  BOT_BORDER: "#bfdbfe", // blue-200
  USER_MSG_START: "#2563eb", // blue-600
  USER_MSG_END: "#1e40af", // blue-800
  ANIM_DURATION: ".32s",
};

if (avatarModules) {
  // Prefer modern formats first (avif), then fall back to png/jpg/jpeg, then svg
  const preferOrder = [".avif", ".png", ".jpg", ".jpeg", ".svg"];
  const keys = Object.keys(avatarModules);
  for (const ext of preferOrder) {
    const key = keys.find((k) => k.endsWith(ext));
    if (key) {
      const mod = avatarModules[key];
      botAvatarUrl = mod && mod.default ? mod.default : mod;
      break;
    }
  }
}

const StudentBot = () => {
  const API_URL = import.meta.env.VITE_API_URL || "";
  const USE_PROXY = import.meta.env.VITE_STUDENT_BOT_USE_PROXY === "true"; // set to true in frontend .env to use server proxy at /api/bot/chat
  const EFFECTIVE_API_URL = USE_PROXY
    ? "/api/bot/chat"
    : `${API_URL}/api/bot/chat`;
  const { currentUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your Study Assistant. Ask me anything about your courses — I can help with schedules, assignments, and quick tips.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  // When a new message is appended we'll briefly animate it in — helper for delays
  const ANIM_BASE_DELAY = 30; // ms

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const appendMessage = (msg) => setMessages((m) => [...m, msg]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    appendMessage({ from: "user", text });
    setInput("");
    setLoading(true);

    try {
      if (!EFFECTIVE_API_URL) {
        // No API configured — show helpful hint
        appendMessage({
          from: "bot",
          text: "Bot is not configured. Please set VITE_API_URL (or enable VITE_STUDENT_BOT_USE_PROXY=true).",
        });
      } else {
        const resp = await fetch(EFFECTIVE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            username: currentUser?.email || "guest",
          }),
        });

        if (!resp.ok) {
          const errText = await resp.text();
          appendMessage({
            from: "bot",
            text: `Error from bot API: ${errText || resp.status}`,
          });
        } else {
          const rawText = await resp.text();
          if (!rawText.trim()) {
            appendMessage({
              from: "bot",
              text: "Bot returned an empty response.",
            });
          } else {
            let data;
            try {
              data = JSON.parse(rawText);
            } catch (parseErr) {
              appendMessage({ from: "bot", text: rawText });
              return;
            }
            // Expecting { reply: '...' } or { message: '...' } — try both
            const reply = data.reply ?? data.message ?? JSON.stringify(data);
            appendMessage({ from: "bot", text: reply });
          }
        }
      }
    } catch (err) {
      appendMessage({
        from: "bot",
        text: `Failed to contact bot: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Image error handler: if an image fails to load (e.g., invalid AVIF), fall back to SVG
  const handleImgError = (e) => {
    const img = e.currentTarget;
    if (img && img.src && !img.src.includes("/bot-avatar.svg")) {
      img.src = botAvatarSvg;
    }
  };

  return (
    <div className="fixed right-3 sm:right-6 bottom-3 sm:bottom-6 z-[130] max-w-[calc(100vw-1.5rem)] sm:max-w-none">
      <style>{`
        @keyframes fadeInUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(24, 27, 155, 0.35); } 70% { box-shadow: 0 0 0 8px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
        .message-enter { animation: fadeInUp ${THEME.ANIM_DURATION} ease both; }
        .avatar-pulse { animation: pulseRing 2s infinite; }
        .preview-fade { transition: opacity 160ms ease, transform 160ms ease; opacity: 0; transform: translateY(-6px); }
        .preview-fade.show { opacity: 1; transform: translateY(0); }
      `}</style>
      {/* Collapsed avatar/button with thick gradient ring + white spacer + dark core (supports hover preview) */}
      {!open && (
        <div
          className="relative"
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          <button
            aria-label="Open Study Assistant"
            onClick={() => setOpen(true)}
            className="group w-12 h-12 rounded-full p-[4px] bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600 shadow-2xl flex items-center justify-center hover:scale-[1.03] transition-transform"
            style={{ boxShadow: "0 8px 22px rgba(15,23,42,0.12)" }}
          >
            {/* white spacer ring */}
            <div className="rounded-full bg-white p-[3px] flex items-center justify-center">
              {/* dark core */}
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                <img
                  src={botAvatarUrl}
                  alt="Study Assistant"
                  onError={handleImgError}
                  className="w-8 h-8 rounded-full object-cover"
                />
                {/* subtle outer pulse */}
                <span
                  className="absolute inset-0 rounded-full avatar-pulse"
                  style={{ opacity: 0.6 }}
                />
              </div>
            </div>
          </button>

          {/* small online indicator */}
          <span className="absolute -left-0 -top-0 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />

          {/* Hover preview */}
          <div
            className={`hidden md:block absolute right-0 -top-20 w-40 bg-white rounded-lg shadow-xl p-2 z-50 transform origin-bottom-right ${showPreview ? "preview-fade show" : "preview-fade"}`}
          >
            <div className="w-full flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                <img
                  src={botAvatarUrl}
                  alt="Preview"
                  onError={handleImgError}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Study Assistant</div>
                {/* <div className="text-xs text-slate-400">
                  Click to open the assistant
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded chat box */}
      {open && (
        <div
          className={`w-[min(24rem,calc(100vw-1.5rem))] sm:w-96 h-[min(70vh,32rem)] sm:h-96 transition-all duration-300 shadow-2xl rounded-2xl bg-white overflow-hidden border border-slate-200 flex flex-col`}
        >
          <div className="flex items-center gap-3 p-4 rounded-t-2xl bg-gradient-to-r from-[#1f2937]/80 via-[#111827]/70 to-[#0f172a]/80 text-white backdrop-blur-sm shadow-2xl">
            <div className="relative">
              <div className="p-[3px] rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={botAvatarUrl}
                    alt="Assistant"
                    onError={handleImgError}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md object-cover"
                  />
                </div>
              </div>
              <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Study Assistant</div>
              <div className="text-[12px] text-white/80">
                Here to help — try "show my assignments"
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-white/10"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            className="flex-1 p-3 sm:p-4 overflow-auto space-y-4 bg-gradient-to-b from-white to-slate-50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`relative flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  style={
                    m.from === "user"
                      ? {
                          animationDelay: `${i * ANIM_BASE_DELAY}ms`,
                          background: `linear-gradient(90deg, ${THEME.USER_MSG_START}, ${THEME.USER_MSG_END})`,
                        }
                      : {
                          animationDelay: `${i * ANIM_BASE_DELAY}ms`,
                          background: THEME.BOT_BG,
                          borderColor: THEME.BOT_BORDER,
                        }
                  }
                  className={`message-enter max-w-[88%] sm:max-w-[80%] relative px-3 sm:px-4 py-3 rounded-[18px] ${m.from === "user" ? "text-white shadow-md" : "text-blue-900 border shadow-sm"}`}
                >
                  {m.text}
                  <div
                    className={`text-[11px] mt-1 ${m.from === "user" ? "text-white/70" : "text-slate-400"}`}
                  >
                    {/* reserved for timestamp or meta */}
                  </div>

                  {/* bubble tail */}
                  {m.from === "bot" ? (
                    <div
                      style={{ background: THEME.BOT_BG }}
                      className="absolute -left-2 top-4 w-3 h-3 rotate-45 shadow-sm"
                    />
                  ) : (
                    <div
                      style={{ background: THEME.USER_MSG_END }}
                      className="absolute -right-2 top-4 w-3 h-3 rotate-45"
                    />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg
                    width="18"
                    height="4"
                    viewBox="0 0 44 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="5" cy="5" r="4" fill="#cbd5e1">
                      <animate
                        attributeName="opacity"
                        values="0.2;1;0.2"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="0s"
                      />
                    </circle>
                    <circle cx="22" cy="5" r="4" fill="#cbd5e1">
                      <animate
                        attributeName="opacity"
                        values="0.2;1;0.2"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="0.15s"
                      />
                    </circle>
                    <circle cx="39" cy="5" r="4" fill="#cbd5e1">
                      <animate
                        attributeName="opacity"
                        values="0.2;1;0.2"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="0.3s"
                      />
                    </circle>
                  </svg>
                </div>
                <div className="bg-white text-slate-700 border border-slate-100 px-3 py-2 rounded-2xl shadow-sm">
                  Typing…
                </div>
              </div>
            )}
          </div>

          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-3 relative"
            >
              <div className="flex-1 bg-slate-100 rounded-full px-3 py-2 flex items-center gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask a question — press Enter to send"
                  className="flex-1 resize-none h-10 rounded-full bg-transparent border-0 px-1 py-1 text-sm outline-none focus:ring-0"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: `linear-gradient(135deg, ${THEME.SEND_START}, ${THEME.SEND_END})`,
                }}
                className={`-ml-10 z-10 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg disabled:opacity-60`}
                title="Send"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="text-xs text-slate-400 mt-2">
              Ask doubts related to your course content
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBot;
