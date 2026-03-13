import { useState, useEffect, useRef } from "react";

// 🔊 VOICE DETECTION TOGGLE — set to false to disable, true to enable
const VOICE_DETECTION_ENABLED = true;

/**
 * useVoiceDetection Hook
 * Monitors audio stream for loud noises or speech that exceed a threshold.
 * Toggle VOICE_DETECTION_ENABLED above to enable/disable.
 */
export const useVoiceDetection = (stream, threshold = 0.15, duration = 2000) => {
    // ✅ Hooks must always be called — never put early return before these
    const [isVoiceSuspicious, setIsVoiceSuspicious] = useState(false);
    const [isLoudNoise, setIsLoudNoise] = useState(false);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const rafIdRef = useRef(null);
    const suspiciousStartTimeRef = useRef(null);

    useEffect(() => {
        // If disabled, do nothing
        if (!VOICE_DETECTION_ENABLED) return;

        if (!stream || stream.getAudioTracks().length === 0) {
            console.warn("[VOICE] No audio tracks found in stream.");
            return;
        }

        const initAudio = async () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;

                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                analyserRef.current = analyser;

                source.connect(analyser);

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                dataArrayRef.current = dataArray;

                console.log("[VOICE] Audio analysis started.");

                const monitor = () => {
                    analyser.getByteFrequencyData(dataArray);

                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength / 255;

                    // 1. Check for sustained voice/noise
                    if (average > threshold) {
                        if (!suspiciousStartTimeRef.current) {
                            suspiciousStartTimeRef.current = Date.now();
                        } else if (Date.now() - suspiciousStartTimeRef.current > duration) {
                            setIsVoiceSuspicious(true);
                        }
                    } else {
                        suspiciousStartTimeRef.current = null;
                        setIsVoiceSuspicious(false);
                    }

                    // 2. Check for sudden loud noise (Threshold x 2.5)
                    if (average > threshold * 2.5) {
                        setIsLoudNoise(true);
                        setTimeout(() => setIsLoudNoise(false), 3000); // Reset after 3s
                    }

                    rafIdRef.current = requestAnimationFrame(monitor);
                };

                monitor();
            } catch (err) {
                console.error("[VOICE] Init error:", err);
            }
        };

        initAudio();

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            console.log("[VOICE] Audio analysis stopped.");
        };
    }, [stream, threshold, duration]);

    return { isVoiceSuspicious, isLoudNoise };
};
