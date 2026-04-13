import { useState, useEffect, useRef } from "react";
import { PROCTORING_POLICY } from "../config/proctoringPolicy";

// 🔊 VOICE DETECTION TOGGLE — set to false to disable, true to enable
const VOICE_DETECTION_ENABLED = true;

/**
 * useVoiceDetection Hook
 * Monitors audio stream for loud noises or speech that exceed a threshold.
 * Toggle VOICE_DETECTION_ENABLED above to enable/disable.
 */
export const useVoiceDetection = (
    stream,
    threshold = PROCTORING_POLICY.audio.voiceThreshold,
    duration = PROCTORING_POLICY.audio.voiceDurationMs,
) => {
    // ✅ Hooks must always be called — never put early return before these
    const [isVoiceSuspicious, setIsVoiceSuspicious] = useState(false);
    const [isLoudNoise, setIsLoudNoise] = useState(false);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const rafIdRef = useRef(null);
    const suspiciousStartTimeRef = useRef(null);
    const loudStartTimeRef = useRef(null);
    const loudEventCountRef = useRef(0);
    const loudEventRaisedRef = useRef(false);
    const loudCooldownUntilRef = useRef(0);

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
                    const now = Date.now();
                    const loudThreshold = threshold * PROCTORING_POLICY.audio.loudMultiplier;

                    // 1. Check for sustained voice/noise
                    if (average > threshold) {
                        if (!suspiciousStartTimeRef.current) {
                            suspiciousStartTimeRef.current = now;
                        } else if (now - suspiciousStartTimeRef.current > duration) {
                            setIsVoiceSuspicious(true);
                        }
                    } else {
                        suspiciousStartTimeRef.current = null;
                        setIsVoiceSuspicious(false);
                    }

                    // 2. Check for sustained loud noise only (ignore short spikes).
                    // First two sustained events are warning-only and do not raise violation flags.
                    const isLoudSample = average > loudThreshold;
                    if (!isLoudSample) {
                        loudStartTimeRef.current = null;
                        loudEventRaisedRef.current = false;
                    } else {
                        if (!loudStartTimeRef.current) loudStartTimeRef.current = now;
                        const isSustained = now - loudStartTimeRef.current >= PROCTORING_POLICY.audio.loudSustainMs;

                        if (
                            isSustained &&
                            !loudEventRaisedRef.current &&
                            now >= loudCooldownUntilRef.current
                        ) {
                            loudEventRaisedRef.current = true;
                            loudCooldownUntilRef.current = now + PROCTORING_POLICY.audio.loudCooldownMs;
                            loudEventCountRef.current += 1;

                            // Warning ladder: only 3rd sustained event becomes formal loud-noise signal.
                            if (loudEventCountRef.current > PROCTORING_POLICY.audio.loudWarningEventsBeforeFlag) {
                                setIsLoudNoise(true);
                                setTimeout(() => setIsLoudNoise(false), 3000);
                            }
                        }
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
            suspiciousStartTimeRef.current = null;
            loudStartTimeRef.current = null;
            loudEventRaisedRef.current = false;
            loudCooldownUntilRef.current = 0;
            loudEventCountRef.current = 0;
            console.log("[VOICE] Audio analysis stopped.");
        };
    }, [stream, threshold, duration]);

    return { isVoiceSuspicious, isLoudNoise };
};