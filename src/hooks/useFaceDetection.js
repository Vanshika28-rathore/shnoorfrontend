import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

/**
 * useFaceDetection Hook
 * Monitors camera stream for multiple faces using MediaPipe Face Detection model.
 */
export const useFaceDetection = (stream) => {
    console.log("[FACE] useFaceDetection hook called. Stream present:", !!stream);
    const [detector, setDetector] = useState(null);
    const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
    const [faceCount, setFaceCount] = useState(0);
    const [error, setError] = useState(null);

    const lastCountRef = useRef(0);

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
                const isMulti = count > 1;
                const isNone = count === 0;
                setMultipleFacesDetected(isMulti);

                if (isMulti) {
                    console.warn(`[FACE] 🚨 MULTIPLE FACES DETECTED: ${count}`);
                }
                if (isNone) {
                    console.warn(`[FACE] 🚨 NO FACE DETECTED!`);
                }
            } catch (err) {
                console.error("[FACE] Detection error during estimation:", err);
            }

            // Continuous loop
            setTimeout(() => {
                requestRef.current = requestAnimationFrame(detect);
            }, 500); // Check every 500ms
        };

        console.log("[FACE] Starting detection loop...");
        detect();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [detector, stream]);

    return { multipleFacesDetected, noFaceDetected: faceCount === 0, faceCount, error };
};