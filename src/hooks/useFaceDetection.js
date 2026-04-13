import { useState, useEffect, useRef } from 'react';
import { PROCTORING_POLICY } from '../config/proctoringPolicy';

/**
 * useFaceDetection Hook
 * Monitors camera stream for multiple faces using MediaPipe Face Detection model.
 */
export const useFaceDetection = (stream) => {
    console.log("[FACE] useFaceDetection hook called. Stream present:", !!stream);
    const [detector, setDetector] = useState(null);
    const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
    const [noFaceDetected, setNoFaceDetected] = useState(false);
    const [faceCount, setFaceCount] = useState(0);
    const [error, setError] = useState(null);

    const lastCountRef = useRef(0);
    const noFaceStreakRef = useRef(0);
    const multipleFaceStreakRef = useRef(0);

    const videoRef = useRef(null);
    const requestRef = useRef();

    // 1. Setup hidden video element for processing
    useEffect(() => {
        const video = document.createElement('video');
        video.width = 640;
        video.height = 480;
        video.muted = true;
        video.playsInline = true;
        video.style.position = 'absolute';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        document.body.appendChild(video);
        videoRef.current = video;

        return () => {
            if (video && video.parentNode) {
                video.parentNode.removeChild(video);
            }
        };
    }, []);

    // 2. Load the Face Detection model
    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log("[FACE] Loading Face Detection model...");
                const tf = await import('@tensorflow/tfjs');
                const faceDetection = await import('@tensorflow-models/face-detection');

                // Ensure WebGL backend for best performance
                try {
                    await tf.setBackend('webgl');
                } catch (beErr) {
                    console.warn("[FACE] WebGL backend failed to init, using default:", beErr);
                }
                await tf.ready();
                console.log("[FACE] TFJS Backend:", tf.getBackend());

                const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
                const detectorConfig = {
                    runtime: 'tfjs',
                    modelType: 'full',
                    maxFaces: 5 // Explicitly allow more than 1 face
                };

                console.log("[FACE] Creating detector with maxFaces: 5...");
                const loadedDetector = await faceDetection.createDetector(model, detectorConfig);
                setDetector(loadedDetector);
                console.log("[FACE] Model loaded correctly (MediaPipeFaceDetector).");
            } catch (err) {
                console.error("[FACE] CRITICAL Error loading model:", err);
                setError("Failed to load face detection model: " + err.message);
            }
        };
        loadModel();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // 3. Detection Loop
    useEffect(() => {
        if (!detector || !stream || !videoRef.current) {
            console.log("[FACE] Detection loop waiting: progress check:", {
                hasDetector: !!detector,
                hasStream: !!stream,
                hasVideoRef: !!videoRef.current
            });
            return;
        }

        const video = videoRef.current;

        const startVideo = async () => {
            try {
                // Only set srcObject if it's different to avoid interrupting loads
                if (video.srcObject !== stream) {
                    console.log("[FACE] Setting srcObject...");
                    video.srcObject = stream;
                }

                // Only play if paused or not initialized
                if (video.paused) {
                    console.log("[FACE] Attempting video.play()...");
                    await video.play();
                    console.log("[FACE] Hidden video playing successfully.");
                }
            } catch (err) {
                if (err.name === 'AbortError') {
                    // This is expected when the component re-renders quickly
                    console.debug("[FACE] Video play interrupted by new load request (AbortError).");
                } else {
                    console.error("[FACE] Video play failed:", err);
                }
            }
        };
        startVideo();

        const detect = async () => {
            if (!detector || !video || video.paused || video.ended || video.readyState < 2) {
                // Periodically log state if stuck
                if (Math.random() < 0.05) {
                    console.debug("[FACE] Waiting for video... readyState:", video?.readyState, "paused:", video?.paused);
                }
                requestRef.current = requestAnimationFrame(detect);
                return;
            }

            try {
                const faces = await detector.estimateFaces(video, { flipHorizontal: false });
                const count = faces.length;
                const REQUIRED_CONSECUTIVE_CHECKS = PROCTORING_POLICY.visual.consecutiveChecksRequired;

                if (count !== lastCountRef.current) {
                    console.log(`[FACE] Detected faces: ${count}`);
                    if (count > 0) {
                        faces.forEach((f, i) => {
                            const score = f.box?.confidence || f.score || (f.keypoints && "kp exists");
                            console.log(`  Face ${i + 1} score/info:`, score);
                        });
                    }
                    lastCountRef.current = count;
                }

                setFaceCount(count);
                if (count === 0) {
                    noFaceStreakRef.current += 1;
                    multipleFaceStreakRef.current = 0;
                    setNoFaceDetected(noFaceStreakRef.current >= REQUIRED_CONSECUTIVE_CHECKS);
                    setMultipleFacesDetected(false);
                } else if (count > 1) {
                    multipleFaceStreakRef.current += 1;
                    noFaceStreakRef.current = 0;
                    setMultipleFacesDetected(multipleFaceStreakRef.current >= REQUIRED_CONSECUTIVE_CHECKS);
                    setNoFaceDetected(false);
                } else {
                    noFaceStreakRef.current = 0;
                    multipleFaceStreakRef.current = 0;
                    setNoFaceDetected(false);
                    setMultipleFacesDetected(false);
                }

                if (multipleFaceStreakRef.current >= REQUIRED_CONSECUTIVE_CHECKS) {
                    console.warn(`[FACE] 🚨 MULTIPLE FACES DETECTED: ${count}`);
                }
                if (noFaceStreakRef.current >= REQUIRED_CONSECUTIVE_CHECKS) {
                    console.warn(`[FACE] 🚨 NO FACE DETECTED!`);
                }
            } catch (err) {
                console.error("[FACE] Detection error during estimation:", err);
            }

            // Continuous loop
            setTimeout(() => {
                requestRef.current = requestAnimationFrame(detect);
            }, PROCTORING_POLICY.visual.faceLoopDelayMs);
        };

        console.log("[FACE] Starting detection loop...");
        detect();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            noFaceStreakRef.current = 0;
            multipleFaceStreakRef.current = 0;
        };
    }, [detector, stream]);

    return { multipleFacesDetected, noFaceDetected, faceCount, error };
};