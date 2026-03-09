import { useState, useEffect, useCallback, useRef } from 'react';

// ─── CDN ──────────────────────────────────────────────────────────────────────
// ✅ KEY FIX: Load ONE shared TF.js first, then both ML libraries use it.
//    - face-api.js@0.22.2 was the problem: it tries to re-register TF backends
//      over an already-loaded TF.js, causing "n is not a function" crash.
//    - @vladmandic/face-api is a modern fork designed to share an external TF.js.
//    Load order: TF.js → vladmandic/face-api → COCO-SSD (all share same TF runtime)

const TF_CDN        = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js';
const FACE_API_CDN  = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.js';
const FACE_API_MODELS = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
const COCO_CDN      = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s   = document.createElement('script');
    s.src     = src;
    s.async   = false; // ✅ async:false ensures scripts execute in order
    s.onload  = resolve;
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });

const waitForVideo = (videoRef, maxWaitMs = 30_000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const el = videoRef?.current;
      if (el instanceof HTMLVideoElement && el.readyState >= 2 && el.videoWidth > 0) {
        if (el.paused) el.play().catch(() => {});
        console.log('[AI Proctor] video ready ✓', el.videoWidth, 'x', el.videoHeight);
        return resolve(el);
      }
      if (Date.now() - start > maxWaitMs) {
        return reject(new Error('Timed out waiting for video element'));
      }
      setTimeout(check, 500);
    };
    check();
  });

// ─── Shared ML bootstrap ──────────────────────────────────────────────────────
// All three CDN scripts loaded once, sequentially, into a single TF.js runtime.
let mlBootstrapPromise = null;

const bootstrapML = () => {
  if (mlBootstrapPromise) return mlBootstrapPromise;
  mlBootstrapPromise = (async () => {
    // 1. Load TF.js first — both face-api and COCO-SSD will use this instance
    console.log('[AI Proctor] loading TF.js…');
    await loadScript(TF_CDN);
    await new Promise(r => setTimeout(r, 300)); // let backends register

    // 2. Load vladmandic/face-api (uses window.tf, no internal TF copy)
    console.log('[AI Proctor] loading face-api (@vladmandic)…');
    await loadScript(FACE_API_CDN);
    await new Promise(r => setTimeout(r, 200));

    // 3. Load COCO-SSD (also uses window.tf)
    console.log('[AI Proctor] loading COCO-SSD…');
    await loadScript(COCO_CDN);
    await new Promise(r => setTimeout(r, 200));

    if (typeof window.faceapi === 'undefined') throw new Error('faceapi not found on window');
    if (typeof window.cocoSsd?.load !== 'function') throw new Error('cocoSsd.load not found');

    console.log('[AI Proctor] all ML libraries loaded ✓');
  })();
  return mlBootstrapPromise;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
const useMockSecurity = (
  onAutoSubmit,
  onWarning,
  activeSectionId = '',
  videoRef        = null,
  mediaStream     = null,
) => {
  const violationsRef   = useRef(0);
  const [violationCount, setViolationCount] = useState(0);
  const [isTerminated, setIsTerminated]     = useState(false);
  const isTerminatedRef = useRef(false);
  const processingRef   = useRef(false);
  const isHiddenRef     = useRef(false);
  const MAX_VIOLATIONS  = 3;

  const onAutoSubmitRef    = useRef(onAutoSubmit);
  const onWarningRef       = useRef(onWarning);
  const activeSectionIdRef = useRef(activeSectionId);

  useEffect(() => { onAutoSubmitRef.current    = onAutoSubmit;    }, [onAutoSubmit]);
  useEffect(() => { onWarningRef.current       = onWarning;       }, [onWarning]);
  useEffect(() => { activeSectionIdRef.current = activeSectionId; }, [activeSectionId]);

  const videoRefRef = useRef(videoRef);
  useEffect(() => { videoRefRef.current = videoRef; }, [videoRef]);

  const isDescriptive = () => activeSectionIdRef.current === 'descriptive';

  // ── Core violation counter ─────────────────────────────────────────────────
  const handleViolation = useCallback((type, message) => {
    if (isTerminatedRef.current) return;
    const newCount = violationsRef.current + 1;
    violationsRef.current = newCount;
    setViolationCount(newCount);
    console.log(`[Security] violation: ${type} — total: ${newCount}`);
    onWarningRef.current?.(type, newCount, message);
    if (newCount >= MAX_VIOLATIONS) {
      isTerminatedRef.current = true;
      setIsTerminated(true);
      onAutoSubmitRef.current?.();
    }
  }, []);

  // ── Tab / window visibility ────────────────────────────────────────────────
  const handleVisibilityChange = useCallback(() => {
    if (processingRef.current) return;
    if (document.hidden) {
      if (!isHiddenRef.current) {
        processingRef.current = true;
        isHiddenRef.current   = true;
        handleViolation('visibility-hidden');
        setTimeout(() => { processingRef.current = false; }, 100);
      }
    } else {
      isHiddenRef.current = false;
    }
  }, [handleViolation]);

  // Grace period: DevTools / OS dialogs won't count as blur violations
  const blurTimerRef  = useRef(null);
  const BLUR_GRACE_MS = 1_500;

  const handleWindowBlur = useCallback(() => {
    if (processingRef.current || document.hidden || isHiddenRef.current) return;
    blurTimerRef.current = setTimeout(() => {
      if (!document.hidden && !isHiddenRef.current) {
        processingRef.current = true;
        handleViolation('blur');
        setTimeout(() => { processingRef.current = false; }, 100);
      }
    }, BLUR_GRACE_MS);
  }, [handleViolation]);

  const handleWindowFocus = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur',  handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur',  handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, [handleVisibilityChange, handleWindowBlur, handleWindowFocus]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  const triggerFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement;
        await (el.requestFullscreen?.()       ??
               el.mozRequestFullScreen?.()    ??
               el.webkitRequestFullscreen?.() ??
               el.msRequestFullscreen?.());
      }
      return true;
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      return false;
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && !isTerminatedRef.current) {
      handleViolation('fullscreen-exit');
      triggerFullscreen();
    }
  }, [handleViolation, triggerFullscreen]);

  // ── Text selection ─────────────────────────────────────────────────────────
  const handleSelectionChange = useCallback(() => {
    if (isDescriptive()) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      handleViolation('text-selection');
      sel.removeAllRanges();
    }
  }, [handleViolation]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('selectionchange',  handleSelectionChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('selectionchange',  handleSelectionChange);
    };
  }, [handleFullscreenChange, handleSelectionChange]);

  // ── Copy / paste / right-click ─────────────────────────────────────────────
  const preventCopyAction = useCallback((e) => {
    e.preventDefault();
    onWarningRef.current?.('copy-paste', violationsRef.current);
  }, []);

  const securityHandlers = {
    onCopy:        (e) => preventCopyAction(e),
    onCut:         (e) => preventCopyAction(e),
    onPaste:       (e) => preventCopyAction(e),
    onContextMenu: (e) => preventCopyAction(e),
  };

  // ===========================================================================
  // ── AI PROCTORING ───────────────────────────────────────────────────────────
  // ===========================================================================

  const aiCooldownRef  = useRef({});
  const AI_COOLDOWN_MS = {
    'multiple-faces': 15_000,
    'phone-detected': 20_000,
    'loud-audio':     10_000,
  };

  const handleViolationRef = useRef(handleViolation);
  useEffect(() => { handleViolationRef.current = handleViolation; }, [handleViolation]);

  const fireAiViolation = useCallback((type, message) => {
    if (isTerminatedRef.current) return;
    const now = Date.now();
    if (aiCooldownRef.current[type] && now < aiCooldownRef.current[type]) return;
    aiCooldownRef.current[type] = now + (AI_COOLDOWN_MS[type] ?? 10_000);
    handleViolationRef.current(type, message);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fireAiViolationRef = useRef(fireAiViolation);
  useEffect(() => { fireAiViolationRef.current = fireAiViolation; }, [fireAiViolation]);

  const faceIntervalRef  = useRef(null);
  const cocoIntervalRef  = useRef(null);
  const audioIntervalRef = useRef(null);
  const audioCtxRef      = useRef(null);
  const cocoModelRef     = useRef(null);
  const faceApiReadyRef  = useRef(false);

  const getVideoEl = useCallback((fallback) => {
    const el = videoRefRef.current?.current;
    return (el instanceof HTMLVideoElement) ? el : fallback;
  }, []);

  const [aiDebugInfo, setAiDebugInfo] = useState({ faces: 0, objects: [], audioRms: 0 });

  // ── 1. Face detection ──────────────────────────────────────────────────────
  const startFaceDetection = useCallback(async (videoEl) => {
    try {
      if (!faceApiReadyRef.current) {
        console.log('[AI Proctor] loading face models…');
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODELS);
        faceApiReadyRef.current = true;
        console.log('[AI Proctor] face-api ready ✓');
      }

      const options = new window.faceapi.TinyFaceDetectorOptions({
        inputSize: 224, scoreThreshold: 0.4,
      });

      let noFaceStreak       = 0;
      const NO_FACE_THRESHOLD = 2;

      console.log('[AI Proctor] face detection interval started');
      faceIntervalRef.current = setInterval(async () => {
        const video = getVideoEl(videoEl);
        if (!video || video.readyState < 2) return;
        if (video.paused) { video.play().catch(() => {}); return; }

        try {
          const detections = await window.faceapi.detectAllFaces(video, options);
          setAiDebugInfo(prev => ({ ...prev, faces: detections.length }));

          if (detections.length === 0) {
            noFaceStreak++;
            if (noFaceStreak >= NO_FACE_THRESHOLD) {
              noFaceStreak = 0;
              fireAiViolationRef.current(
                'multiple-faces',
                'No face detected. Please ensure your face is visible to the camera.'
              );
            }
          } else {
            noFaceStreak = 0;
            if (detections.length > 1) {
              fireAiViolationRef.current(
                'multiple-faces',
                `${detections.length} faces detected. Only the candidate should be visible.`
              );
            }
          }
        } catch (err) {
          console.warn('[AI Proctor] face detection tick error:', err.message);
        }
      }, 2_000);
    } catch (err) {
      console.warn('[AI Proctor] face detection setup failed:', err.message);
    }
  }, [getVideoEl]);

  // ── 2. Phone / object detection ───────────────────────────────────────────
  const startPhoneDetection = useCallback(async (videoEl) => {
    try {
      cocoModelRef.current = await window.cocoSsd.load();
      console.log('[AI Proctor] COCO-SSD ready ✓');

      const PHONE_LABELS = new Set([
        'cell phone', 'remote', 'mouse', 'book', 'laptop', 'tablet', 'tv',
        'keyboard', 'microwave', 'suitcase', 'stop sign', 'bottle', 'cup',
        'clock', 'scissors', 'teddy bear', 'hair drier', 'toothbrush',
      ]);

      const MIN_SCORE = 0.35;

      const debugCanvas = document.createElement('canvas');
      debugCanvas.width  = 224;
      debugCanvas.height = 224;
      const debugCtx = debugCanvas.getContext('2d', { willReadFrequently: true });

      console.log('[AI Proctor] phone detection interval started');
      cocoIntervalRef.current = setInterval(async () => {
        const video = getVideoEl(videoEl);
        if (!video || video.readyState < 2) return;
        if (video.paused) { video.play().catch(() => {}); return; }

        try {
          debugCtx.drawImage(video, 0, 0, 224, 224);
          const imgData = debugCtx.getImageData(0, 0, 224, 224).data;
          let sum = 0;
          for (let i = 0; i < imgData.length; i += 400) { sum += imgData[i]; }
          if (sum === 0) {
            console.warn('[AI Proctor] Video frame is completely black!');
            return;
          }

          const preds = await cocoModelRef.current.detect(video);
          const objStrings = preds.map((p) => `${p.class}(${(p.score * 100).toFixed(0)}%)`);
          setAiDebugInfo(prev => ({ ...prev, objects: objStrings }));
          console.log('[AI Proctor] COCO objects:', objStrings.join(', ') || 'none');

          const found = preds
            .filter((p) => PHONE_LABELS.has(p.class) && p.score >= MIN_SCORE)
            .sort((a, b) => b.score - a.score)[0];

          if (found) {
            console.log(`[AI Proctor] prohibited object "${found.class}" detected`);
            fireAiViolationRef.current(
              'phone-detected',
              `Prohibited object detected: "${found.class}" (${Math.round(found.score * 100)}% confidence).`
            );
          }
        } catch (err) {
          console.warn('[AI Proctor] phone detection tick error:', err.message);
        }
      }, 1_500);
    } catch (err) {
      console.warn('[AI Proctor] phone detection setup failed:', err.message);
    }
  }, [getVideoEl]);

  // ── 3. Audio / noise detection ─────────────────────────────────────────────
  const startAudioDetection = useCallback((stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext || !stream) return;

      audioCtxRef.current  = new AudioContext();
      const analyser       = audioCtxRef.current.createAnalyser();
      analyser.fftSize     = 512;
      const source         = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray        = new Uint8Array(analyser.frequencyBinCount);
      const SAMPLE_INTERVAL  = 200;
      const CALIBRATION_MS   = 3_000;
      const SPIKE_MULTIPLIER = 1.3;
      const MIN_RMS          = 10;
      let baseline = null, calibrated = false;
      const samples = [];

      audioIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const rms = Math.sqrt(dataArray.reduce((s, v) => s + v * v, 0) / dataArray.length);

        if (!calibrated) {
          samples.push(rms);
          if (samples.length * SAMPLE_INTERVAL >= CALIBRATION_MS) {
            baseline   = samples.reduce((a, b) => a + b, 0) / samples.length;
            calibrated = true;
            console.log('[AI Proctor] audio baseline RMS:', baseline.toFixed(2));
          }
          return;
        }

        setAiDebugInfo(prev => ({ ...prev, audioRms: rms }));

        if (baseline > 0 && rms > baseline * SPIKE_MULTIPLIER && rms > MIN_RMS) {
          fireAiViolationRef.current(
            'loud-audio',
            'Significant background noise or voice activity detected near you.'
          );
        }
      }, SAMPLE_INTERVAL);

      console.log('[AI Proctor] audio detector running ✓');
    } catch (err) {
      console.warn('[AI Proctor] audio init failed:', err.message);
    }
  }, []);

  // ── Stop all AI detectors ──────────────────────────────────────────────────
  const stopAiDetection = useCallback(() => {
    clearInterval(faceIntervalRef.current);
    clearInterval(cocoIntervalRef.current);
    clearInterval(audioIntervalRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    cocoModelRef.current = null;
    console.log('[AI Proctor] all detectors stopped');
  }, []);

  // ── Bootstrap ML libs once, then start all detectors ──────────────────────
  useEffect(() => {
    if (!mediaStream) return;
    let cancelled = false;

    (async () => {
      try {
        // ✅ Load TF.js → face-api → COCO-SSD sequentially (shared TF runtime)
        await bootstrapML();
        if (cancelled) return;

        const videoEl = await waitForVideo(videoRefRef.current);
        if (cancelled) return;

        // Start all three detectors — ML libs are guaranteed ready
        startFaceDetection(videoEl);
        startPhoneDetection(videoEl);
        startAudioDetection(mediaStream);
      } catch (err) {
        console.warn('[AI Proctor] bootstrap failed:', err.message);
      }
    })();

    return () => {
      cancelled = true;
      stopAiDetection();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!mediaStream]);

  // ===========================================================================

  return {
    violationCount,
    isTerminated,
    securityHandlers,
    triggerFullscreen,
    stopAiDetection,
    aiDebugInfo,
  };
};

export default useMockSecurity;