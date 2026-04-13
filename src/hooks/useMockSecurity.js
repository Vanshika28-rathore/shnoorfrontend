import { useState, useEffect, useCallback, useRef } from 'react';
import { PROCTORING_POLICY, getSecurityPolicy } from '../config/proctoringPolicy';

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
  const detectMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const coarsePointer = typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
    return coarsePointer || /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  };
  const securityPolicyRef = useRef(getSecurityPolicy({ isMobile: detectMobileDevice(), isMock: true }));
  const securityPolicy = securityPolicyRef.current;

  const violationsRef   = useRef(0);
  const [violationCount, setViolationCount] = useState(0);
  const [isTerminated, setIsTerminated]     = useState(false);
  const isTerminatedRef = useRef(false);
  const isHiddenRef     = useRef(false);
  const hiddenTimerRef  = useRef(null);
  const blurTimerRef    = useRef(null);
  const fullscreenTimerRef = useRef(null);
  const recentTouchTsRef = useRef(0);
  const lastViolationAtRef = useRef({});
  const actionWarningCountRef = useRef({});
  const MAX_VIOLATIONS  = securityPolicy.maxViolations;

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
  const handleViolation = useCallback((type, message, options = {}) => {
    const { warnOnly = false } = options;
    if (isTerminatedRef.current) return;

    const now = Date.now();
    const lastAt = lastViolationAtRef.current[type] || 0;
    if (now - lastAt < securityPolicy.violationCooldownMs) return;
    lastViolationAtRef.current[type] = now;

    if (warnOnly) {
      onWarningRef.current?.(type, violationsRef.current, message);
      return;
    }

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
    if (document.hidden) {
      if (isHiddenRef.current || hiddenTimerRef.current) return;
      hiddenTimerRef.current = setTimeout(() => {
        hiddenTimerRef.current = null;
        if (document.hidden && !isTerminatedRef.current) {
          isHiddenRef.current = true;
          handleViolation('visibility-hidden');
        }
      }, securityPolicy.visibilityGraceMs);
    } else {
      isHiddenRef.current = false;
      if (hiddenTimerRef.current) {
        clearTimeout(hiddenTimerRef.current);
        hiddenTimerRef.current = null;
      }
    }
  }, [handleViolation]);

  const handleWindowBlur = useCallback(() => {
    if (document.hidden || isHiddenRef.current) return;
    if (blurTimerRef.current) return;
    blurTimerRef.current = setTimeout(() => {
      blurTimerRef.current = null;
      if (!document.hidden && !isHiddenRef.current && !document.hasFocus()) {
        handleViolation('blur');
      }
    }, securityPolicy.blurGraceMs);
  }, [handleViolation]);

  const handleWindowFocus = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
  }, []);

  const handlePointerActivity = useCallback(() => {
    recentTouchTsRef.current = Date.now();
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur',  handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pointerdown', handlePointerActivity, { passive: true });
    window.addEventListener('touchstart', handlePointerActivity, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur',  handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pointerdown', handlePointerActivity);
      window.removeEventListener('touchstart', handlePointerActivity);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
      if (fullscreenTimerRef.current) clearTimeout(fullscreenTimerRef.current);
    };
  }, [handleVisibilityChange, handleWindowBlur, handleWindowFocus, handlePointerActivity]);

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
    if (!document.fullscreenElement) {
      if (fullscreenTimerRef.current) return;
      fullscreenTimerRef.current = setTimeout(() => {
        fullscreenTimerRef.current = null;
        if (!document.fullscreenElement && !isTerminatedRef.current) {
          handleViolation('fullscreen-exit');
          triggerFullscreen();
        }
      }, securityPolicy.fullscreenExitGraceMs);
    } else if (fullscreenTimerRef.current) {
      clearTimeout(fullscreenTimerRef.current);
      fullscreenTimerRef.current = null;
    }
  }, [handleViolation, triggerFullscreen]);

  // ── Text selection ─────────────────────────────────────────────────────────
  const handleSelectionChange = useCallback(() => {
    if (isDescriptive()) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const selectedText = sel.toString().trim();
      const isRecentTouch = Date.now() - recentTouchTsRef.current <= securityPolicy.accidentalTouchGraceMs;
      if (isRecentTouch && selectedText.length < securityPolicy.minSelectionChars) {
        sel.removeAllRanges();
        return;
      }

      const warnCount = actionWarningCountRef.current['text-selection'] || 0;
      if (warnCount < securityPolicy.actionWarningBeforeStrike) {
        actionWarningCountRef.current['text-selection'] = warnCount + 1;
        handleViolation(
          'text-selection-warning',
          'Text selection was blocked. Repeated selection attempts will count as violations.',
          { warnOnly: true },
        );
      } else {
        handleViolation('text-selection');
      }
      sel.removeAllRanges();
    }
  }, [handleViolation, securityPolicy.accidentalTouchGraceMs, securityPolicy.minSelectionChars, securityPolicy.actionWarningBeforeStrike]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('selectionchange',  handleSelectionChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('selectionchange',  handleSelectionChange);
    };
  }, [handleFullscreenChange, handleSelectionChange]);

  // ── Copy / paste / right-click ─────────────────────────────────────────────
  const preventCopyAction = useCallback((e, actionType) => {
    e.preventDefault();

    const isRecentTouch = Date.now() - recentTouchTsRef.current <= securityPolicy.accidentalTouchGraceMs;
    if (actionType === 'context-menu' && isRecentTouch) {
      handleViolation(
        'context-menu-warning',
        'Context menu was blocked (likely accidental long-press). This is a warning only.',
        { warnOnly: true },
      );
      return;
    }

    const warnCount = actionWarningCountRef.current['copy-paste'] || 0;
    if (warnCount < securityPolicy.actionWarningBeforeStrike) {
      actionWarningCountRef.current['copy-paste'] = warnCount + 1;
      handleViolation(
        'copy-paste-warning',
        'Copy/paste action blocked. Repeated attempts will count as violations.',
        { warnOnly: true },
      );
      return;
    }

    handleViolation('copy-paste');
  }, [handleViolation, securityPolicy.accidentalTouchGraceMs, securityPolicy.actionWarningBeforeStrike]);

  const securityHandlers = {
    onCopy:        (e) => preventCopyAction(e, 'copy'),
    onCut:         (e) => preventCopyAction(e, 'cut'),
    onPaste:       (e) => preventCopyAction(e, 'paste'),
    onContextMenu: (e) => preventCopyAction(e, 'context-menu'),
  };

  // ===========================================================================
  // ── AI PROCTORING ───────────────────────────────────────────────────────────
  // ===========================================================================

  const aiCooldownRef  = useRef({});
  const AI_COOLDOWN_MS = PROCTORING_POLICY.aiCooldownMs;

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
  const audioSustainedEventCountRef = useRef(0);
  const visualSustainedEventCountRef = useRef({
    'phone-detected': 0,
    'no-face': 0,
    'multiple-faces': 0,
  });

  const getVideoEl = useCallback((fallback) => {
    const el = videoRefRef.current?.current;
    return (el instanceof HTMLVideoElement) ? el : fallback;
  }, []);

  const [aiDebugInfo, setAiDebugInfo] = useState({ faces: 0, objects: [], audioRms: 0 });

  const handleVisualSustainedEvent = useCallback((type, warningMessage, violationMessage) => {
    const current = visualSustainedEventCountRef.current[type] ?? 0;
    const next = current + 1;
    visualSustainedEventCountRef.current[type] = next;

    if (next === 1) {
      onWarningRef.current?.(
        `${type}-warning`,
        violationsRef.current,
        warningMessage,
      );
      return;
    }

    fireAiViolationRef.current(type, violationMessage);
  }, []);

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

      const REQUIRED_VISUAL_CONSECUTIVE_CHECKS = PROCTORING_POLICY.visual.consecutiveChecksRequired;
      let noFaceStreak = 0;
      let multipleFacesStreak = 0;
      let noFaceHandledInCurrentStreak = false;
      let multipleFacesHandledInCurrentStreak = false;

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
            multipleFacesStreak = 0;
            multipleFacesHandledInCurrentStreak = false;

            if (!noFaceHandledInCurrentStreak && noFaceStreak >= REQUIRED_VISUAL_CONSECUTIVE_CHECKS) {
              noFaceHandledInCurrentStreak = true;
              handleVisualSustainedEvent(
                'no-face',
                'No face detected for a sustained period. Please ensure your face is visible to the camera. This is a warning only.',
                'No face detected for a sustained period. Please ensure your face is visible to the camera.'
              );
            }
          } else {
            noFaceStreak = 0;
            noFaceHandledInCurrentStreak = false;

            if (detections.length > 1) {
              multipleFacesStreak++;
              if (!multipleFacesHandledInCurrentStreak && multipleFacesStreak >= REQUIRED_VISUAL_CONSECUTIVE_CHECKS) {
                multipleFacesHandledInCurrentStreak = true;
                handleVisualSustainedEvent(
                  'multiple-faces',
                  `${detections.length} faces detected continuously. Only the candidate should be visible. This is a warning only.`,
                  `${detections.length} faces detected continuously. Only the candidate should be visible.`
                );
              }
            } else {
              multipleFacesStreak = 0;
              multipleFacesHandledInCurrentStreak = false;
            }
          }
        } catch (err) {
          console.warn('[AI Proctor] face detection tick error:', err.message);
        }
      }, PROCTORING_POLICY.visual.faceDetectionIntervalMs);
    } catch (err) {
      console.warn('[AI Proctor] face detection setup failed:', err.message);
    }
  }, [getVideoEl, handleVisualSustainedEvent]);

  // ── 2. Phone / object detection ───────────────────────────────────────────
  const startPhoneDetection = useCallback(async (videoEl) => {
    try {
      cocoModelRef.current = await window.cocoSsd.load();
      console.log('[AI Proctor] COCO-SSD ready ✓');

      const PHONE_LABELS = new Set(PROCTORING_POLICY.visual.phoneLabels);

      const MIN_SCORE = PROCTORING_POLICY.visual.phoneMinScore;
      const REQUIRED_VISUAL_CONSECUTIVE_CHECKS = PROCTORING_POLICY.visual.consecutiveChecksRequired;
      let phoneDetectedStreak = 0;
      let phoneHandledInCurrentStreak = false;

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
            phoneDetectedStreak++;
            if (!phoneHandledInCurrentStreak && phoneDetectedStreak >= REQUIRED_VISUAL_CONSECUTIVE_CHECKS) {
              phoneHandledInCurrentStreak = true;
              console.log(`[AI Proctor] sustained prohibited object "${found.class}" detected`);
              handleVisualSustainedEvent(
                'phone-detected',
                `Prohibited object "${found.class}" was continuously detected. This is a warning only.`,
                `Prohibited object detected continuously: "${found.class}" (${Math.round(found.score * 100)}% confidence).`
              );
            }
          } else {
            phoneDetectedStreak = 0;
            phoneHandledInCurrentStreak = false;
          }
        } catch (err) {
          console.warn('[AI Proctor] phone detection tick error:', err.message);
        }
      }, PROCTORING_POLICY.visual.phoneDetectionIntervalMs);
    } catch (err) {
      console.warn('[AI Proctor] phone detection setup failed:', err.message);
    }
  }, [getVideoEl, handleVisualSustainedEvent]);

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
      const SAMPLE_INTERVAL  = PROCTORING_POLICY.mockAudio.sampleIntervalMs;
      const CALIBRATION_MS   = PROCTORING_POLICY.mockAudio.calibrationMs;
      const SPIKE_MULTIPLIER = PROCTORING_POLICY.mockAudio.spikeMultiplier;
      const MIN_RMS          = PROCTORING_POLICY.mockAudio.minRms;
      const REQUIRED_SUSTAIN_MS = PROCTORING_POLICY.mockAudio.requiredSustainMs;
      const SUSTAINED_SAMPLES_REQUIRED = Math.ceil(REQUIRED_SUSTAIN_MS / SAMPLE_INTERVAL);
      let baseline = null, calibrated = false;
      const samples = [];
      let loudConsecutiveSamples = 0;
      let sustainedEventRaisedInCurrentStreak = false;

      audioSustainedEventCountRef.current = 0;

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

        const isLoudSample = baseline > 0 && rms > baseline * SPIKE_MULTIPLIER && rms > MIN_RMS;

        if (!isLoudSample) {
          loudConsecutiveSamples = 0;
          sustainedEventRaisedInCurrentStreak = false;
          return;
        }

        loudConsecutiveSamples += 1;
        if (sustainedEventRaisedInCurrentStreak) return;

        if (loudConsecutiveSamples >= SUSTAINED_SAMPLES_REQUIRED) {
          sustainedEventRaisedInCurrentStreak = true;
          audioSustainedEventCountRef.current += 1;
          const sustainedCount = audioSustainedEventCountRef.current;

          if (sustainedCount <= PROCTORING_POLICY.mockAudio.warningEventsBeforeStrike) {
            onWarningRef.current?.(
              'loud-audio-warning',
              violationsRef.current,
              'Sustained background noise detected. Please move to a quieter environment. This is a warning only.'
            );
            return;
          }

          fireAiViolationRef.current(
            'loud-audio',
            'Sustained background noise or voice activity detected for over 3 seconds.'
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