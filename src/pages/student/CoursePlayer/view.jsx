import React from "react";
import {
  CheckCircle,
  ArrowLeft,
  FileText,
  Play,
  ExternalLink,
  BookOpen,
  Info,
} from "lucide-react";
import TextStreamPlayer from "./TextStreamPlayer";
import ReactPlayer from "react-player";
import { getEmbedUrl } from "../../../utils/urlHelper";

const isGoogleDriveUrl = (url) => typeof url === "string" && url.includes("drive.google.com");
const getGoogleDriveFileId = (url) => {
  if (!url || typeof url !== "string") return "";

  const matchers = [
    /\/file\/d\/([^/]+)/i,
    /[?&]id=([^&]+)/i,
    /\/document\/d\/([^/]+)/i,
  ];

  for (const pattern of matchers) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
};

function normalizeExternalPublicUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^(www\.|youtube\.com|youtu\.be|m\.youtube\.com)/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

const getGoogleDrivePreviewUrl = (url) => {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) {
    console.warn("Invalid Google Drive URL:", url);
    return normalizeExternalPublicUrl(url);
  }
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

const isLocalOrMp4Url = (url) => {
  if (!url || typeof url !== "string") return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes("localhost") ||
    lowerUrl.includes("127.0.0.1") ||
    lowerUrl.match(/\.(mp4|webm|ogg|mov|mkv|avi|flv|m4v)($|\?)/i) ||
    lowerUrl.includes("/uploads/videos/") ||
    lowerUrl.startsWith("/uploads/")
  );
};
const isYouTubeUrl = (url) => Boolean(url && /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(url));
const isGammaUrl = (url) => Boolean(url && typeof url === "string" && url.includes("gamma.app"));

const normalizeGammaUrl = (url) => {
  if (!url) return "";
  let finalUrl = url.trim();
  if (finalUrl.startsWith("//")) finalUrl = `https:${finalUrl}`;
  if (!finalUrl.startsWith("http")) finalUrl = `https://${finalUrl}`;
  finalUrl = finalUrl.replace(/\/+$/, "");
  if (!finalUrl.includes("/embed/")) {
    finalUrl = finalUrl.replace(/gamma\.app\/(?:docs|public|view|present|p|d)\//i, "gamma.app/embed/");
    if (!finalUrl.includes("/embed/")) {
      finalUrl = finalUrl.replace(/gamma\.app\/([a-zA-Z0-9_-]+)$/i, "gamma.app/embed/$1");
    }
  }
  const urlObj = new URL(finalUrl);
  if (!urlObj.searchParams.has("embed")) urlObj.searchParams.set("embed", "true");
  if (!urlObj.searchParams.has("embedHost")) urlObj.searchParams.set("embedHost", window.location.hostname || "localhost");
  return urlObj.toString();
};
const normalizeExternalUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (isGoogleDriveUrl(trimmed)) return getGoogleDrivePreviewUrl(trimmed);
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^(www\.|youtube\.com|youtu\.be|m\.youtube\.com)/i.test(trimmed)) return `https://${trimmed}`;

  if (trimmed.startsWith("/") || trimmed.startsWith("./")) {
    const backendUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(":5173", ":5000");
    const cleanPath = trimmed.startsWith("./") ? trimmed.slice(1) : trimmed;
    return `${backendUrl}${cleanPath}`;
  }

  return trimmed;
};

const buildPdfViewerUrl = (url, authToken) => {
  if (!url || typeof url !== "string") return "";
  if (isGoogleDriveUrl(url)) return getGoogleDrivePreviewUrl(url);
  return normalizeExternalUrl(url);
};

const getRenderableVideoUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  const normalizedUrl = normalizeExternalPublicUrl(url);

  if (isGoogleDriveUrl(normalizedUrl)) {
    return getGoogleDrivePreviewUrl(normalizedUrl);
  }

  if (isYouTubeUrl(normalizedUrl)) {
    return getEmbedUrl(normalizedUrl);
  }

  if (isGammaUrl(normalizedUrl)) {
    return normalizeGammaUrl(normalizedUrl);
  }

  return normalizeExternalUrl(normalizedUrl);
};

const getApiOrigin = () =>
  (import.meta.env.VITE_API_URL || window.location.origin.replace(":5173", ":5000")).replace(/\/$/, "");

const isExternalUrl = (url) => {
  if (!url || !/^https?:\/\//i.test(url)) return false;

  try {
    return new URL(url).hostname !== window.location.hostname;
  } catch (_) {
    return false;
  }
};

const isBackendDocumentUrl = (url) => {
  if (!url) return false;
  if (isGoogleDriveUrl(url)) return false;
  if (/^https?:\/\//i.test(url) || url.startsWith("//") || /^www\./i.test(url)) {
    try {
      return new URL(normalizeExternalPublicUrl(url)).origin === new URL(getApiOrigin()).origin;
    } catch (_) {
      return false;
    }
  }

  try {
    const resolvedUrl = new URL(buildPdfViewerUrl(url), window.location.origin);
    return resolvedUrl.origin === new URL(getApiOrigin()).origin;
  } catch (_) {
    return typeof url === "string" && (url.startsWith("/api/") || url.startsWith("/uploads/"));
  }
};

const useSecureAssetUrl = ({ src, authToken, enabled }) => {
  const [blobUrl, setBlobUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");
  const resolvedUrl = React.useMemo(() => buildPdfViewerUrl(src, authToken), [src, authToken]);

  React.useEffect(() => {
    if (!resolvedUrl || !enabled) {
      setBlobUrl("");
      setLoadError("");
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let objectUrl = "";

    const loadSecureAsset = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const isExternal = isExternalUrl(resolvedUrl);
        const response = await fetch(resolvedUrl, {
          headers: isExternal ? {} : { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load asset (${response.status})`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to load secure asset:", error);
        setLoadError("We couldn't load this file right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSecureAsset();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resolvedUrl, authToken, enabled]);

  return { resolvedUrl, blobUrl, isLoading, loadError };
};

const SecureDocumentFrame = ({ src, authToken, title, className = "w-full h-full border-0" }) => {
  const shouldFetchWithAuth =
    Boolean(authToken && isBackendDocumentUrl(src)) &&
    !isGoogleDriveUrl(src);
  const { resolvedUrl, blobUrl, isLoading, loadError } = useSecureAssetUrl({
    src,
    authToken,
    enabled: shouldFetchWithAuth,
  });

  if (!resolvedUrl) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-slate-500">
        Document URL is missing.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-slate-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-500" />
        <p className="text-sm font-medium">Loading document...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-500">
        <FileText size={28} className="text-slate-400" />
        <p className="max-w-md text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl || resolvedUrl}
      className={className}
      title={title}
      allow="fullscreen"
    />
  );
};

const SEEK_TOLERANCE_SECONDS = 1;
const COMPLETE_EPSILON_SECONDS = 0.25;


const CoursePlayerView = ({
  course,
  currentModule,
  setCurrentModule,
  loading,
  progressPercentage,
  isModuleCompleted,
  handleMarkComplete,
  navigate,
  courseId,
  recommendedCourses,
  authToken,
  moduleTimes = {},
  onSyncVideoProgress,
  markingComplete = false,
}) => {
  const [isVideoFinished, setIsVideoFinished] = React.useState(false);
  const playerRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const wasPlayingRef = React.useRef(false);
  const isPlayingRef = React.useRef(false);

  const [maxPlayedSeconds, setMaxPlayedSeconds] = React.useState(currentModule?.last_position_seconds || 0);
  const maxPlayedRef = React.useRef(currentModule?.last_position_seconds || 0);
  const [videoDuration, setVideoDuration] = React.useState(0);
  const [videoProgressPercent, setVideoProgressPercent] = React.useState(0);
  const lastSyncRef = React.useRef(currentModule?.last_position_seconds || 0);
  const normalizedModuleUrl = normalizeExternalUrl(currentModule?.url || "");
  const renderableVideoUrl = getRenderableVideoUrl(currentModule?.url || "");

  const seekToPosition = React.useCallback((seconds) => {
    if (!playerRef.current) return;
    if (typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(seconds, "seconds");
      return;
    }
    if (playerRef.current.currentTime !== undefined) {
      playerRef.current.currentTime = seconds;
    }
  }, []);

  const syncProgress = React.useCallback(
    (seconds) => {
      if (!onSyncVideoProgress || !currentModule?.id) return;
      const safeSeconds = Math.max(0, Math.floor(seconds));
      onSyncVideoProgress(currentModule.id, safeSeconds);
      lastSyncRef.current = safeSeconds;
    },
    [onSyncVideoProgress, currentModule?.id]
  );

  const updateCompletionState = React.useCallback((watchedSeconds, duration = videoDuration) => {
    if (!duration || duration <= 0) {
      setVideoProgressPercent(0);
      return;
    }
    const boundedSeconds = Math.min(Math.max(watchedSeconds, 0), duration);
    const percent = (boundedSeconds / duration) * 100;
    setVideoProgressPercent(Math.min(100, Math.round(percent)));
    if (boundedSeconds >= duration - COMPLETE_EPSILON_SECONDS) {
      setIsVideoFinished(true);
    }
  }, [videoDuration]);

  // Sync isPlayingRef with isPlaying state
  React.useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Handle visibility change (tab switching/minimizing)
  React.useEffect(() => {
    const handleInvisibility = () => {
      if (isPlayingRef.current) {
        wasPlayingRef.current = true;
        setIsPlaying(false);
      }

      // Force pause all native video/audio elements (backup for non-state-tracked elements)
      try {
        document.querySelectorAll("video, audio").forEach((el) => {
          if (!el.paused) el.pause();
        });
      } catch (e) { }

      // Attempt to pause generic iframes (YouTube, Vimeo, etc.) via postMessage
      try {
        document.querySelectorAll("iframe").forEach((frame) => {
          frame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
          frame.contentWindow.postMessage('{"method":"pause"}', "*");
        });
      } catch (e) { }
    };

    const handleVisibility = () => {
      if (wasPlayingRef.current) {
        setIsPlaying(true);
        wasPlayingRef.current = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleInvisibility();
      else handleVisibility();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleInvisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleInvisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, []);

  // Sync playing state for native video element
  React.useEffect(() => {
    // Only apply pause/play sync if we're not just switching to a new module
    // which starts at 0 and is already paused. This prevents issues with
    // calling pause() too early on some players.
    if (playerRef.current && isLocalOrMp4Url(renderableVideoUrl) && playerRef.current.tagName === "VIDEO") {
      if (isPlaying) {
        playerRef.current.play().catch((err) => {
          if (err.name !== "NotAllowedError") {
            console.warn("Playback error:", err);
          }
        });
      } else {
        // If it was already playing, we pause it. If it was already paused, this is a no-op.
        if (!playerRef.current.paused) {
          playerRef.current.pause();
        }
      }
    }
  }, [isPlaying, renderableVideoUrl]);

  React.useEffect(() => {
    maxPlayedRef.current = maxPlayedSeconds;
  }, [maxPlayedSeconds]);

  // Reset playback guards when module changes
  React.useEffect(() => {
    const initialPosition = currentModule?.last_position_seconds || 0;
    setIsVideoFinished(false);
    setMaxPlayedSeconds(initialPosition);
    maxPlayedRef.current = initialPosition;
    setIsPlaying(false);
    wasPlayingRef.current = false;
    setVideoDuration(0);
    setVideoProgressPercent(0);
    lastSyncRef.current = initialPosition;
  }, [currentModule?.id]);

  // Flush last watched position when leaving module/unmounting
  React.useEffect(() => {
    return () => {
      if (
        onSyncVideoProgress &&
        currentModule?.id &&
        currentModule?.type === "video" &&
        !isGoogleDriveUrl(renderableVideoUrl) &&
        !isYouTubeUrl(renderableVideoUrl) &&
        !isGammaUrl(renderableVideoUrl)
      ) {
        const lastKnown = Math.floor(maxPlayedRef.current);
        if (lastKnown > Math.floor(lastSyncRef.current)) {
          syncProgress(lastKnown);
        }
      }
    };
  }, [currentModule?.id, currentModule?.type, renderableVideoUrl, onSyncVideoProgress, syncProgress]);

  const handleVideoReady = (duration) => {
    if (!duration || duration <= 0) return;
    setVideoDuration(duration);

    const resumeAt = Math.min(currentModule?.last_position_seconds || 0, duration);
    if (resumeAt > 0) {
      seekToPosition(resumeAt);
      setMaxPlayedSeconds(resumeAt);
      maxPlayedRef.current = resumeAt;
      updateCompletionState(resumeAt, duration);
    } else {
      updateCompletionState(0, duration);
    }
  };

  const preventForwardSeek = (attemptedSeconds) => {
    if (isVideoFinished) return false;
    if (attemptedSeconds <= maxPlayedRef.current + SEEK_TOLERANCE_SECONDS) return false;

    seekToPosition(maxPlayedRef.current);
    return true;
  };

  const handleProgress = (state) => {
    const playedSeconds = Number(state.playedSeconds || 0);
    if (preventForwardSeek(playedSeconds)) {
      return;
    }

    const nextMax = Math.max(maxPlayedRef.current, playedSeconds);
    if (nextMax !== maxPlayedRef.current) {
      maxPlayedRef.current = nextMax;
      setMaxPlayedSeconds(nextMax);
      updateCompletionState(nextMax);
      if (nextMax >= lastSyncRef.current + 2) {
        syncProgress(nextMax);
      }
    } else {
      updateCompletionState(nextMax);
    }
  };

  const handleSeekAttempt = (seconds) => {
    preventForwardSeek(Number(seconds || 0));
  };

  const handleVideoEnded = () => {
    if (!videoDuration) return;

    if (maxPlayedRef.current >= videoDuration - COMPLETE_EPSILON_SECONDS) {
      setIsVideoFinished(true);
      setVideoProgressPercent(100);
      syncProgress(videoDuration);
      return;
    }

    seekToPosition(maxPlayedRef.current);
  };

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return "00:00:00";
    const totalSecs = Math.floor(totalSeconds);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");
  };

  const getModuleTypeLabel = (type) => {
    if (type === "video") return "Video";
    if (type === "pdf" || type === "text_stream" || type === "html" || type === "text" || type === "notes" || type === "md" || type === "txt") {
      return "Notes";
    }
    return type || "Module";
  };

  const totalCourseTimeSeconds = (course?.modules || []).reduce((acc, module) => {
    const moduleSeconds = moduleTimes[module.id] ?? module.time_spent_seconds ?? 0;
    return acc + (Number(moduleSeconds) || 0);
  }, 0);
  const mainViewerHeightClass = currentModule?.notes
    ? "min-h-[70vh] lg:min-h-[72vh]"
    : "min-h-[78vh] lg:min-h-[calc(100vh-9rem)]";

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-wide">
            Loading classroom...
          </p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <button
            onClick={() => navigate("/student/courses")}
            className="text-indigo-400 hover:text-blue-300 underline"
          >
            Return to courses
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-primary-900 text-slate-100 font-sans">
      { }
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/student/courses")}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Back to Courses"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <h1 className="font-bold text-sm sm:text-lg text-white truncate max-w-[150px] sm:max-w-md">
            {course.title}
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Your Progress
          </div>
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-sm font-bold text-indigo-400 w-10 text-right">
            {progressPercentage}%
          </div>
        </div>
        {/* Mobile-only compact progress */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span className="text-xs font-bold text-indigo-400">{progressPercentage}%</span>
        </div>
      </div>

      {(course.prereq_description ||
        (course.prereq_video_urls && course.prereq_video_urls.length > 0) ||
        course.prereq_pdf_url) && (
          <div className="bg-slate-800 border-b border-slate-700 px-3 sm:px-6 py-3 text-xs flex flex-wrap gap-2 sm:gap-4 items-center">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Info size={14} className="text-indigo-400" />
              Pre‑course requirements
            </div>
            {course.prereq_description && (
              <p className="text-slate-300 max-w-3xl">
                {course.prereq_description}
              </p>
            )}
            <div className="ml-auto flex gap-3">
              {course.prereq_video_urls &&
                course.prereq_video_urls.map((videoUrl, index) => (
                  <a
                    key={index}
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-semibold transition text-[11px]"
                  >
                    <Play size={12} />
                    Video {index + 1}
                  </a>
                ))}
              {course.prereq_pdf_url && (
                <a
                  href={buildPdfViewerUrl(course.prereq_pdf_url, authToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold transition text-[11px]"
                >
                  <FileText size={12} />
                  Download PDF
                </a>
              )}
            </div>
          </div>
        )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] overflow-hidden">
        { }
        {/* UPDATED: added overflow-y-auto custom-scrollbar */}
        <div className="flex-1 flex flex-col bg-black overflow-y-auto custom-scrollbar min-h-0">
          { }
          <div className={`flex-1 bg-black ${mainViewerHeightClass}`}>

            {/* TEXT STREAM, HTML, TXT, MD */}
            {currentModule?.type === "text_stream" ||
              currentModule?.type === "html" ||
              (currentModule?.url && currentModule.url.trim().toLowerCase().startsWith("<iframe")) ||
              currentModule?.url?.toLowerCase()?.endsWith(".html") ||
              currentModule?.url?.toLowerCase()?.endsWith(".txt") ||
              currentModule?.url?.toLowerCase()?.endsWith(".md") ? (
              <div className={`w-full ${mainViewerHeightClass} overflow-y-auto bg-white`}>
                <TextStreamPlayer
                  moduleId={currentModule.id}
                  url={currentModule.url}
                  onComplete={handleMarkComplete}
                />
              </div>

            ) : currentModule?.type === "video" ? (
              /* VIDEO PLAYER */
              <div className={`w-full ${mainViewerHeightClass} bg-black`}>
                {!currentModule?.url ? (
                  <div className={`flex flex-col items-center justify-center ${mainViewerHeightClass} text-white p-8`}>
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold mb-2">Video Not Available</h3>
                    <p className="text-slate-400 text-center max-w-md">The video URL for this module is missing or invalid.</p>
                  </div>
                ) : isGoogleDriveUrl(renderableVideoUrl) || isYouTubeUrl(renderableVideoUrl) || isGammaUrl(renderableVideoUrl) ? (
                  <iframe
                    src={renderableVideoUrl}
                    className={`w-full ${mainViewerHeightClass} border-0`}
                    title={currentModule?.title || "Video lesson"}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : !isLocalOrMp4Url(renderableVideoUrl) ? (
                  <div className={`w-full ${mainViewerHeightClass} flex items-center justify-center bg-black p-2 sm:p-4`}>
                    <div className="w-full h-full max-w-6xl">
                    <ReactPlayer
                      ref={playerRef}
                      url={renderableVideoUrl}
                      width="100%"
                      height="100%"
                      controls
                      playing={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onDuration={handleVideoReady}
                      onProgress={handleProgress}
                      onSeek={handleSeekAttempt}
                      onEnded={handleVideoEnded}
                    />
                    </div>
                  </div>
                ) : (
                  <video
                    ref={playerRef}
                    src={renderableVideoUrl}
                    className={`w-full ${mainViewerHeightClass} object-contain bg-black`}
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={(e) => handleVideoReady(e.target.duration)}
                    onTimeUpdate={(e) => handleProgress({ playedSeconds: e.target.currentTime })}
                    onSeeking={(e) => handleSeekAttempt(e.target.currentTime)}
                    onEnded={handleVideoEnded}
                  />
                )}
              </div>

            ) : currentModule?.type === "pdf" ||
              currentModule?.url?.toLowerCase().includes(".pdf") ||
              isGammaUrl(currentModule?.url) ? (
              /* PDF or GAMMA */
              <div className={`w-full ${mainViewerHeightClass} bg-slate-100`}>
                <SecureDocumentFrame
                  src={isGammaUrl(currentModule.url) ? normalizeGammaUrl(currentModule.url) : currentModule.url}
                  authToken={authToken}
                  className={`w-full ${mainViewerHeightClass} border-0`}
                  title={currentModule.title || "Document"}
                />
              </div>

            ) : (
              /* FALLBACK View */
              <div className={`w-full ${mainViewerHeightClass} flex flex-col items-center justify-center bg-slate-800 text-slate-300 p-8`}>
                <FileText size={64} className="text-slate-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Document Viewer</h3>
                <p className="text-lg mb-8">{currentModule?.title}</p>
                {currentModule?.url && (
                  <a
                    href={currentModule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 hover:scale-105"
                  >
                    Open Document <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ADDED: Embedded PDF Notes section below content */}
          {currentModule?.notes && (
            <div className="w-full bg-slate-900 border-t border-slate-800 p-4 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <FileText size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Module Notes</h3>
                      <p className="text-slate-400 text-xs">Supplementary reading material for this lesson.</p>
                      <div className="mt-2 text-indigo-400 text-xs font-mono font-bold flex items-center gap-1">
                        ⏱ Time Spent: {formatTime(moduleTimes[currentModule?.id] || 0)}
                      </div>
                    </div>
                  </div>
                  <a
                    href={buildPdfViewerUrl(currentModule.notes, authToken)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                  >
                    Open in New Tab <ExternalLink size={14} />
                  </a>
                </div>

                <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-2xl h-[420px] sm:h-[640px] lg:h-[800px] bg-slate-800">
                  <SecureDocumentFrame
                    src={currentModule.notes}
                    authToken={authToken}
                    className="w-full h-full"
                    title="Module Notes PDF"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-8 py-4 flex-shrink-0">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">
                {currentModule?.title}
              </h2>
              <p className="text-sm text-slate-400">
                {currentModule?.type === "video"
                  ? "Video Lesson"
                  : "Reading Material"}
                {currentModule?.type === "video" && !isGoogleDriveUrl(renderableVideoUrl) && !isYouTubeUrl(renderableVideoUrl) && !isGammaUrl(renderableVideoUrl) && (
                  <>
                    {" • "}
                    <span className="text-cyan-400 font-mono mr-2">
                      Watched: {videoProgressPercent}%
                    </span>
                  </>
                )}
              </p>
              {/* ADDED: PDF Notes link in bottom bar */}
              {currentModule?.notes && (
                <a
                  href={buildPdfViewerUrl(currentModule.notes, authToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <FileText size={12} />
                  View PDF Notes
                </a>
              )}
            </div>
            <button
              onClick={handleMarkComplete}
              disabled={
                markingComplete ||
                isModuleCompleted(currentModule?.id) ||
                (currentModule?.type === "video" && !isGoogleDriveUrl(renderableVideoUrl) && !isYouTubeUrl(renderableVideoUrl) && !isGammaUrl(renderableVideoUrl) && !isVideoFinished)
              }
              className={`w-full sm:w-auto justify-center px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isModuleCompleted(currentModule?.id)
                ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                : markingComplete || (currentModule?.type === "video" && !isGoogleDriveUrl(renderableVideoUrl) && !isYouTubeUrl(renderableVideoUrl) && !isGammaUrl(renderableVideoUrl) && !isVideoFinished)
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed" // Disabled state
                  : "bg-primary-900 hover:bg-slate-800 text-white shadow-lg shadow-primary-900/20"
                }`}
            >
              {isModuleCompleted(currentModule?.id) ? (
                <>
                  <CheckCircle size={16} /> Completed
                </>
              ) : markingComplete ? (
                "Completing..."
              ) : (
                "Mark as Complete"
              )}
            </button>
          </div>
        </div>

        <div className="w-full lg:w-80 bg-primary-900 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col shadow-2xl z-10 max-h-[50vh] lg:max-h-none">
          <div className="p-4 bg-slate-800 border-b border-slate-700">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-xs">
              Course Content
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {course.modules?.map((module, index) => {
              const isActive = currentModule?.id === module.id;
              const isCompleted = isModuleCompleted(module.id);

              return (
                <div
                  key={module.id}
                  onClick={() => setCurrentModule(module)}
                  className={`p-4 border-b border-slate-800 cursor-pointer transition-all hover:bg-slate-800/50 group relative ${isActive ? "bg-slate-800" : ""
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                  )}

                  <div className="flex gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive
                            ? "border-indigo-600"
                            : "border-slate-600 group-hover:border-slate-500"
                            }`}
                        >
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h5
                        className={`text-sm font-medium mb-1 leading-snug ${isActive
                          ? "text-white"
                          : "text-slate-300 group-hover:text-white"
                          }`}
                      >
                        {module.title}
                      </h5>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          {module.type === "video" ? (
                            <Play size={8} fill="currentColor" />
                          ) : (
                            <FileText size={8} />
                          )}
                          <span className="capitalize">{module.type}</span>
                        </span>
                        {module.duration && <span>• {module.duration}</span>}
                        {/* ADDED: Notes badge in sidebar */}
                        {module.notes && (
                          <span className="flex items-center gap-1 text-emerald-500 font-bold ml-1">
                            <FileText size={10} /> Notes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/70">
            <div className="rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-3 py-2 bg-slate-800 border-b border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Course Progress Tracking
                </div>
                <div className="text-xs text-indigo-300 font-mono mt-1">
                  Total: {formatTime(totalCourseTimeSeconds)}
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-800">
                {(course.modules || []).map((module, idx) => {
                  const spent = Number(moduleTimes[module.id] ?? module.time_spent_seconds ?? 0);
                  return (
                    <div key={`time-${module.id}`} className="px-3 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-200 truncate" title={module.title}>
                          {idx + 1}. {module.title}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                          {getModuleTypeLabel(module.type)}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 whitespace-nowrap">
                        {formatTime(spent)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800 border-t border-slate-700">
            <button
              className="w-full py-3 bg-primary-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 transition-all transform hover:-translate-y-0.5"
              onClick={() => navigate(`/student/exam/final_${courseId}`)}
            >
              Take Final Exam
            </button>
          </div>
        </div>
      </div>

      {/* =========================
    RECOMMENDED COURSES
   ========================= */}
      {recommendedCourses?.length > 0 && (
        <div className="bg-slate-900 border-t border-slate-700 px-8 py-12 mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
            Recommended for You
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.slice(0, 4).map((rec) => (
              <div
                key={rec.courses_id}
                onClick={() => navigate(`/student/course/${rec.courses_id}`)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all group"
              >
                <div className="h-28 bg-slate-700 rounded-md flex items-center justify-center mb-4">
                  <BookOpen
                    className="text-slate-500 group-hover:text-indigo-400 transition-colors"
                    size={32}
                  />
                </div>

                <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-400 mb-2">{rec.category}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{rec.difficulty}</span>

                  <span
                    className={`font-bold ${rec.price_type === "paid"
                      ? "text-emerald-400"
                      : "text-indigo-400"
                      }`}
                  >
                    {rec.price_type === "paid"
                      ? `₹${rec.price_amount}`
                      : "FREE"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlayerView;
