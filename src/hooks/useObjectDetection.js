import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export const useObjectDetection = (stream) => {
    const [model, setModel] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [detections, setDetections] = useState([]);
    const [isSuspicious, setIsSuspicious] = useState(false);
    const [error, setError] = useState(null);

    // Using a ref for the video element to process frames
    const videoRef = useRef(null);
    const requestRef = useRef();

    useEffect(() => {
        const video = document.createElement('video');
        video.width = 300;
        video.height = 300;
        video.muted = true;
        video.playsInline = true;
        video.style.position = 'absolute';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
        document.body.appendChild(video);
        videoRef.current = video;
        console.log("[AI-DEBUG] Hidden video element created and appended to body.");

        return () => {
            if (video && video.parentNode) {
                video.parentNode.removeChild(video);
            }
        }
    }, []);

    // Load the model on mount
    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log("[AI] Loading COCO-SSD model...");
                // Setting backend to webgl for performance
                await tf.ready();
                const loadedModel = await cocoSsd.load({
                    base: 'lite_mobilenet_v2' // Using lite version for better performance on average hardware
                });
                setModel(loadedModel);
                console.log("[AI] Model loaded successfully.");
            } catch (err) {
                console.error("[AI] Error loading model:", err);
                setError("Failed to load AI model. Object detection might be unavailable.");
            }
        };
        loadModel();

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    // Effect to start/stop detection based on stream availability
    useEffect(() => {
        if (!model || !stream || !videoRef.current) return;

        const video = videoRef.current;
        console.log("[AI-DEBUG] Attaching stream to hidden video...");
        video.srcObject = stream;

        const startVideo = async () => {
            try {
                await video.play();
                console.log("[AI-DEBUG] Hidden video is now PLAYING.");
            } catch (err) {
                console.warn("[AI-DEBUG] Hidden video play failed (autoplay block?):", err);
            }
        };
        startVideo();

        const detect = async () => {
            if (!model || !video || video.paused || video.ended || video.readyState < 2) {
                // readyState < 2 means HAVE_CURRENT_DATA, needed for prediction
                if (video?.paused) console.log("[AI-DEBUG] Detection loop waiting: Video Paused");
                requestRef.current = requestAnimationFrame(detect);
                return;
            }

            try {
                // Run detection
                const predictions = await model.detect(video);
                if (predictions.length > 0) {
                    console.log("[AI-DEBUG] Predictions:", predictions.map(p => `${p.class} (${Math.round(p.score * 100)}%)`));
                }
                setDetections(predictions);

                // Check for cell phones or electronics
                const suspicious = predictions.some(pred =>
                    (pred.class === 'cell phone' || pred.class === 'remote' || pred.class === 'book') &&
                    pred.score > 0.4 // Lowering threshold for debugging
                );

                if (suspicious) {
                    console.warn("[AI-DEBUG] SUSPICIOUS OBJECT DETECTED!");
                }

                setIsSuspicious(suspicious);
            } catch (err) {
                console.error("[AI] Detection loop error:", err);
            }

            // Schedule next check after a delay to avoid high CPU usage
            setTimeout(() => {
                requestRef.current = requestAnimationFrame(detect);
            }, 1500);
        };

        setIsDetecting(true);
        detect();

        return () => {
            setIsDetecting(false);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [model, stream]);

    return { isSuspicious, detections, isDetecting, error };
};