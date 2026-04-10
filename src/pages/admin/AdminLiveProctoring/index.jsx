import React, { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import { Peer } from "peerjs";
import { toast } from "react-hot-toast";
import {
  Video,
  Users,
  ShieldAlert,
  Search,
  RefreshCw,
  Monitor,
  CameraOff,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

/**
 * VideoFeed Component
 * Manages an individual PeerJS call to a student
 */
const VideoFeed = ({ session, adminPeer }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [debugLog, setDebugLog] = useState([]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setDebugLog((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    // Basic guard: don't start call if peer isn't available or ID is missing
    if (!adminPeer || !session.peerId) {
      setLoading(true);
      return;
    }

    let activeCall = null;
    let isMounted = true;

    const makeCall = () => {
      if (!adminPeer || !adminPeer.open) {
        if (adminPeer && !adminPeer.destroyed) {
          adminPeer.once("open", () => setTimeout(makeCall, 1000));
        }
        return;
      }

      // Small delay to ensure student peer is ready
      setTimeout(() => {
        if (!isMounted) return;
        console.log(
          `[PEER] Starting call to: ${session.userName} | PeerID: ${session.peerId}`,
        );
        setLoading(true);
        setError(false);

        try {
          // Start with a very low-quality dummy to negotiate
          // We draw a pixel to ensure some browsers don't treat the stream as "silent/inactive"
          const canvas = document.createElement("canvas");
          canvas.width = 10;
          canvas.height = 10;
          const ctx = canvas.getContext("2d");
          let frame = 0;
          const animInterval = setInterval(() => {
            if (!isMounted) {
              clearInterval(animInterval);
              return;
            }
            ctx.fillStyle = `rgb(${frame % 255}, 0, 0)`;
            ctx.fillRect(0, 0, 10, 10);
            frame++;
          }, 200);

          const dummyStream = canvas.captureStream(5); // 5fps

          const call = adminPeer.call(session.peerId, dummyStream, {
            metadata: { type: "admin-proctoring" },
          });

          if (!call) {
            clearInterval(animInterval);
            setError(true);
            setErrorMsg("Logic Error");
            setLoading(false);
            return;
          }

          activeCall = call;
          // Store interval in call for cleanup
          call._animInterval = animInterval;

          call.on("stream", (remoteStream) => {
            const tracks = remoteStream.getTracks();
            console.log(
              `[PEER] Stream received for ${session.userName}. Tracks:`,
              tracks.length,
            );
            if (isMounted) {
              setStream(remoteStream);
              setLoading(false);
              setError(false);
              // Ensure the video plays once state updates
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current
                    .play()
                    .catch((e) =>
                      console.warn("[VIDEO] Auto-play retry failed:", e),
                    );
                }
              }, 300);
            }
          });

          call.on("error", (err) => {
            console.error(`[PEER] Call error for ${session.userName}:`, err);
            if (isMounted) {
              setError(true);
              setErrorMsg(
                err.type === "peer-unavailable"
                  ? "Student Offline"
                  : "Link Error",
              );
              setLoading(false);
            }
          });

          call.on("close", () => {
            console.log(`[PEER] Call closed for ${session.userName}`);
            if (call._animInterval) clearInterval(call._animInterval);
            if (isMounted) {
              setLoading(false);
              setStream(null);
            }
          });
        } catch (err) {
          console.error("[PEER] Exception during call:", err);
          if (isMounted) {
            setError(true);
            setErrorMsg("Engine Error");
            setLoading(false);
          }
        }
      }, 500);
    };

    // Safety timeout: if no stream in 45s, mark as error
    const timeout = setTimeout(() => {
      if (loading && !error && isMounted && !stream) {
        console.warn(`[PEER] Connection timeout for ${session.userName}`);
        setError(true);
        setErrorMsg("Timed Out");
        setLoading(false);
      }
    }, 45000);

    makeCall();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (activeCall) {
        if (activeCall._animInterval) clearInterval(activeCall._animInterval);
        activeCall.close();
      }
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log(
            `[PEER] Stopped track for ${session.userName}:`,
            track.kind,
          );
        });
      }
    };
  }, [adminPeer, session.peerId, retryCount]);

  // Dedicated effect to bind stream to video element once it's rendered
  useEffect(() => {
    if (!stream) return;

    const attachStream = async (videoEl) => {
      try {
        videoEl.srcObject = stream;
        videoEl.muted = true;
        await videoEl.play();
        addLog("Video playing ✓");
        console.log("[VIDEO] Attached and playing for:", session.userName);
      } catch (err) {
        console.warn("[VIDEO] Autoplay prevented:", err.message);
        addLog("Click to play");
      }
    };

    // If ref is already available, attach immediately
    if (videoRef.current) {
      console.log(
        "[VIDEO] Ref ready, attaching immediately for:",
        session.userName,
      );
      attachStream(videoRef.current);
      return;
    }

    // If not, poll every 100ms for up to 5 seconds (handles delayed renders)
    console.warn("[VIDEO] Ref not ready, will retry for:", session.userName);
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (videoRef.current) {
        clearInterval(interval);
        console.log(
          `[VIDEO] Ref became ready after ${attempts} attempts for:`,
          session.userName,
        );
        attachStream(videoRef.current);
      } else if (attempts >= 50) {
        clearInterval(interval);
        console.error("[VIDEO] Gave up waiting for ref:", session.userName);
        addLog("Video element never mounted");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stream, loading]); // Run when stream is set or loading finishes (rendering the video element)

  const handleRetry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[UI] Manual retry triggered for ${session.userName}`);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden relative group shadow-2xl aspect-video transition-all ${session.isSuspicious || session.multipleFacesDetected ? "border-rose-500 bg-rose-500/10 ring-4 ring-rose-500/20" : "bg-slate-900 border-slate-700/50 hover:border-indigo-500/50"}`}
    >
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400">
          <div className="relative">
            <RefreshCw className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
            <div className="absolute inset-0 w-10 h-10 border-4 border-indigo-500/20 rounded-full"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Establishing Link
          </span>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-rose-500 backdrop-blur-md">
          <div className="p-4 bg-rose-500/10 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 opacity-80" />
          </div>
          <span className="text-sm font-black text-white uppercase tracking-widest mb-1">
            {errorMsg}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 px-6 text-center">
            {errorMsg === "Student Offline"
              ? "The student may have closed their camera"
              : "Check your internet connection"}
          </span>
          <button
            onClick={handleRetry}
            className="group flex items-center gap-3 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <RefreshCw
              size={14}
              className="group-hover:rotate-180 transition-transform duration-500"
            />
            Retry Feed
          </button>
        </div>
      ) : (
        <div
          className="w-full h-full relative cursor-pointer"
          onClick={(e) => videoRef.current && videoRef.current.play()}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-700 ${stream ? "opacity-100" : "opacity-0"}`}
          />
          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500/50" />
            </div>
          )}
        </div>
      )}

      {/* Debug Logs Overlay (Hover) */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/80 backdrop-blur-xl p-3 rounded-xl border border-white/10 text-[8px] font-mono text-indigo-400 space-y-1 min-w-[120px]">
          {debugLog.length > 0 ? (
            debugLog.map((log, i) => (
              <div key={i} className="truncate">
                {log}
              </div>
            ))
          ) : (
            <div>No logs yet...</div>
          )}
        </div>
      </div>

      {/* Top Left Indicator */}
      {!loading && !error && (
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
          <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 uppercase tracking-[0.1em] md:tracking-[0.2em] text-[7px] md:text-[8px] font-black text-white w-fit">
            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="hidden md:inline">Live</span>
            <span className="md:hidden">LIVE</span>
            {stream && stream.getTracks().length > 0 && (
              <span className="ml-1 text-indigo-400 text-[7px] md:text-[8px]">
                ({stream.getTracks().length}T)
              </span>
            )}
          </div>

          {(session.isSuspicious || session.multipleFacesDetected) && (
            <div className="flex flex-col gap-1">
              {session.multipleFacesDetected && (
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 py-1 md:py-1.5 bg-rose-600 rounded-lg shadow-xl shadow-rose-900/50 border border-rose-400/50 uppercase tracking-[0.1em] md:tracking-[0.2em] text-[7px] md:text-[9px] font-black text-white animate-pulse">
                  <Users size={8} md:size={10} className="fill-white" />
                  <span className="hidden md:inline">Multiple Faces</span>
                  <span className="md:hidden">Faces</span>
                </div>
              )}
              {session.isVoiceSuspicious && (
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 py-1 md:py-1.5 bg-amber-600 rounded-lg shadow-xl shadow-amber-900/50 border border-amber-400/50 uppercase tracking-[0.1em] md:tracking-[0.2em] text-[7px] md:text-[9px] font-black text-white animate-pulse">
                  <Wifi size={8} md:size={10} className="fill-white" />
                  <span className="hidden md:inline">Voice Activity</span>
                  <span className="md:hidden">Voice</span>
                </div>
              )}
              {session.isSuspicious && !session.multipleFacesDetected && (
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 py-1 md:py-1.5 bg-rose-600 rounded-lg shadow-xl shadow-rose-900/50 border border-rose-400/50 uppercase tracking-[0.1em] md:tracking-[0.2em] text-[7px] md:text-[9px] font-black text-white animate-bounce">
                  <AlertTriangle size={8} md:size={10} className="fill-white" />
                  {session.isVoiceSuspicious && !session.detections?.length
                    ? "Audio"
                    : "Suspicious"}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Overlay Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
        <div className="flex items-center justify-between items-end gap-2">
          <div className="flex flex-col gap-0.5 md:gap-1 min-w-0">
            <div className="flex items-center gap-1 md:gap-2">
              <Users
                size={10}
                md:size={12}
                className="text-indigo-400 flex-shrink-0"
              />
              <span className="text-white font-bold text-xs md:text-base tracking-tight truncate max-w-[100px] md:max-w-[180px]">
                {session.userName}
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Monitor
                size={8}
                md:size={10}
                className="text-slate-500 flex-shrink-0"
              />
              <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate max-w-[100px] md:max-w-[180px]">
                {session.examTitle}
              </span>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="pointer-events-auto p-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-lg md:rounded-xl text-white/50 hover:text-white border border-white/5 transition-all"
            title="Refresh Stream"
          >
            <RefreshCw size={14} md:size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLiveProctoring = () => {
  const [sessions, setSessions] = useState([]);
  const [peer, setPeer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [peerState, setPeerState] = useState("initializing"); // initializing, open, disconnected, error

  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const fetchSessions = async () => {
      try {
        const res = await api.get("/api/proctoring/active");
        if (isMounted) {
          setSessions(res.data || []);
          setLoading(false);
        }
      } catch (e) {
        console.error("[PROCTORING] Fetch Error:", e);
        if (isMounted) setLoading(false);
      }
    };

    // Initial fetch
    fetchSessions();
    // Poll every 8 seconds
    pollTimer = setInterval(fetchSessions, 8000);

    // 2. Setup Admin Peer Connection
    // We want this to be persistent and only init once
    let currentPeer = null;

    const initPeer = () => {
      const adminPeerId =
        "admin-proctor-" + Math.random().toString(36).substr(2, 6);
      console.log("[PEER] Initializing Global Admin Peer:", adminPeerId);

      const newPeer = new Peer(adminPeerId, {
        debug: 3,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
        },
      });

      newPeer.on("open", (id) => {
        console.log("[PEER] Global Admin Peer Ready. ID:", id);
        setPeerState("open");
      });

      newPeer.on("disconnected", () => {
        console.warn(
          "[PEER] Global Admin Peer Disconnected. Attempting reconnection...",
        );
        setPeerState("disconnected");
        newPeer.reconnect();
      });

      newPeer.on("error", (err) => {
        console.error("[PEER] Global Admin Peer Error:", err);
        setPeerState("error");
        // If the ID is taken or fatal error, we might need to re-init
        if (err.type === "fatal-error" || err.type === "unavailable-id") {
          setTimeout(initPeer, 5000);
        }
      });

      currentPeer = newPeer;
      setPeer(newPeer);
      return newPeer;
    };

    const peerObj = initPeer();

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
      if (peerObj) peerObj.destroy();
    };
  }, []);

  const filteredSessions = sessions.filter(
    (s) =>
      (s.userName || "Student")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (s.examTitle || "Exam").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className="p-4 md:p-8 space-y-6 font-sans text-slate-700 overflow-x-hidden"
      style={{ background: "#D8E2EB" }}
    >
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* GRADIENT HEADER */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
          }}
        >
          {/* Header Section */}
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-indigo-300">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-black text-white tracking-tight">
                    Live{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                      Proctoring
                    </span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${peerState === "open" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                      ></div>
                      <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                        System {peerState}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-5">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] leading-none mb-1.5">
                    Active Exams
                  </p>
                  <p className="text-3xl font-black text-white leading-none">
                    {sessions.length}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-5">
                <div
                  className={`w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20`}
                >
                  {peerState === "open" ? (
                    <Wifi size={24} />
                  ) : (
                    <WifiOff size={24} />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] leading-none mb-1.5">
                    Peer Engine
                  </p>
                  <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                    {peerState}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    try {
                      const testPeerId =
                        "test-peer-" + Math.random().toString(36).substr(2, 4);
                      await api.post("/api/proctoring/register", {
                        peerId: testPeerId,
                        userName: "BACKEND TEST STUDENT",
                        examId: "test-exam",
                        examTitle: "Backend Bridge Test",
                        userId: "debug-user",
                      });
                      toast.success("Test session seeded via backend!");
                    } catch (e) {
                      toast.error(
                        "Backend Write Failed: " +
                          (e.response?.data?.message || e.message),
                      );
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all"
                >
                  Seed Test Feed
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm("Clean all inactive sessions?")) return;
                    try {
                      await api.post("/api/proctoring/cleanup");
                      toast.success("Sessions cleared");
                    } catch (e) {
                      toast.error("Cleanup failed");
                    }
                  }}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 transition-all"
                >
                  Cleanup DB
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 transition-all"
                >
                  Reboot Peer
                </button>
              </div>
            </div>
          </div>
          <div
            className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            }}
          ></div>
        </div>

        {/* Toolbar / Search */}
        <div className="relative z-10 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="group relative max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name or exam ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700 font-medium text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-8">
              <div className="relative">
                <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldAlert
                    size={32}
                    className="text-indigo-400 animate-pulse"
                  />
                </div>
              </div>
              <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">
                Authenticating Feeds
              </p>
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {filteredSessions.map((session) => (
                <VideoFeed
                  key={session.id}
                  session={session}
                  adminPeer={peer}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
              <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-10 border-4 border-slate-200">
                <Video size={64} />
              </div>
              <h3 className="text-3xl font-black text-slate-700 tracking-tight">
                No Active Sessions
              </h3>
              <center>
                <p className="text-slate-500 font-bold mt-3 uppercase tracking-[0.2em] text-sm">
                  Waiting for active proctoring sessions...
                </p>
              </center>
            </div>
          )}
        </div>

        {/* System Status Footer */}
        <div className="relative z-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200 bg-white rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-40 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="w-[70%] h-full bg-indigo-500 rounded-full"></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              System V2.7 Stable
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 bg-emerald-50 rounded text-[9px] font-black text-emerald-600 border border-emerald-200">
                WSS
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                TLS 1.3 Secure
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 bg-indigo-50 rounded text-[9px] font-black text-indigo-600 border border-indigo-200">
                P2P
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                AES-256 Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminLiveProctoring;
