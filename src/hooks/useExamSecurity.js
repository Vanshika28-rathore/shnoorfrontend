import { useState, useEffect, useCallback, useRef } from 'react';
import { getSecurityPolicy } from '../config/proctoringPolicy';

/**
 * Custom hook to implement exam security features.
 * Refactored to use Stable Callbacks (useCallback) and Ref-based Processing Lock.
 * REMOVED: All toast notifications (handled by Modal now).
 *
 * @param {Function} onAutoSubmit - Callback to trigger when violations delay limit is reached.
 * @param {Function} onWarning - Callback to handle warnings (show modal).
 * @param {Object} options - Security options.
 * @param {boolean} options.enabled - Enable/disable violation tracking.
 * @returns {Object} handlers - Event handlers to attach to the exam container.
 */
const useExamSecurity = (onAutoSubmit, onWarning, options = {}) => {
    const { enabled = true } = options;
    const detectMobileDevice = () => {
        if (typeof window === 'undefined') return false;
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
        const coarsePointer = typeof window.matchMedia === 'function'
            ? window.matchMedia('(pointer: coarse)').matches
            : false;
        return coarsePointer || /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    };
    const securityPolicyRef = useRef(getSecurityPolicy({ isMobile: detectMobileDevice(), isMock: false }));
    const securityPolicy = securityPolicyRef.current;
    // Source of Truth for violation count inside Event Listeners
    const violationsRef = useRef(0);
    // UI State for rendering
    const [violationCount, setViolationCount] = useState(0);

    // Termination State
    const [isTerminated, setIsTerminated] = useState(false);

    const isTerminatedRef = useRef(false);
    const isHiddenRef = useRef(false);
    const hiddenTimerRef = useRef(null);
    const blurTimerRef = useRef(null);
    const fullscreenTimerRef = useRef(null);
    const recentTouchTsRef = useRef(0);
    const lastViolationAtRef = useRef({});
    const actionWarningCountRef = useRef({});

    const MAX_VIOLATIONS = securityPolicy.maxViolations;

    // Persist callbacks
    const onAutoSubmitRef = useRef(onAutoSubmit);
    const onWarningRef = useRef(onWarning);

    useEffect(() => {
        onAutoSubmitRef.current = onAutoSubmit;
        onWarningRef.current = onWarning;
    }, [onAutoSubmit, onWarning]);

    useEffect(() => {
        if (!enabled) {
            violationsRef.current = 0;
            setViolationCount(0);
            setIsTerminated(false);
            isTerminatedRef.current = false;
        }
    }, [enabled]);

    useEffect(() => {
        isTerminatedRef.current = isTerminated;
    }, [isTerminated]);

    // CORE LOGIC: Handle Violation
    const handleViolation = useCallback((type, message = null, options = {}) => {
        const { warnOnly = false } = options;
        if (!enabled) return;
        if (isTerminatedRef.current) return;

        const now = Date.now();
        const lastAt = lastViolationAtRef.current[type] || 0;
        if (now - lastAt < securityPolicy.violationCooldownMs) {
            return;
        }
        lastViolationAtRef.current[type] = now;

        if (warnOnly) {
            onWarningRef.current?.(type, violationsRef.current, message);
            return;
        }

        // Increment Ref
        const newCount = violationsRef.current + 1;
        violationsRef.current = newCount;

        // Sync UI
        setViolationCount(newCount);

        console.log(`Exam Violation Detected (${type})! Count: ${newCount}`);

        if (newCount < MAX_VIOLATIONS) {
            if (onWarningRef.current) {
                onWarningRef.current(type, newCount, message);
            }
        } else if (newCount >= MAX_VIOLATIONS) {
            // Termination Logic
            isTerminatedRef.current = true;
            setIsTerminated(true);

            // Trigger Warning first to show Modal "Terminated" state
            if (onWarningRef.current) {
                onWarningRef.current(type, newCount, message);
            }

            // Trigger Auto-Submit
            if (onAutoSubmitRef.current) {
                onAutoSubmitRef.current();
            }
        }
    }, [enabled]);

    const registerActionSignal = useCallback((type, message) => {
        const warnings = actionWarningCountRef.current[type] || 0;
        if (warnings < securityPolicy.actionWarningBeforeStrike) {
            actionWarningCountRef.current[type] = warnings + 1;
            handleViolation(type, message, { warnOnly: true });
            return;
        }
        handleViolation(type, message);
    }, [handleViolation]);

    // 3. FULLSCREEN EXIT HANDLER
    const handleFullscreenChange = useCallback(() => {
        if (!document.fullscreenElement) {
            if (fullscreenTimerRef.current) return;
            fullscreenTimerRef.current = setTimeout(() => {
                fullscreenTimerRef.current = null;
                if (!document.fullscreenElement && !isTerminatedRef.current) {
                    handleViolation('fullscreen-exit');
                }
            }, securityPolicy.fullscreenExitGraceMs);
        } else if (fullscreenTimerRef.current) {
            clearTimeout(fullscreenTimerRef.current);
            fullscreenTimerRef.current = null;
        }
    }, [handleViolation]);



    // 1. VISIBILITY CHANGE HANDLER
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


    // 2. WINDOW BLUR HANDLER
    const handleWindowBlur = useCallback(() => {
        if (document.hidden || isHiddenRef.current) return;
        if (blurTimerRef.current) return;
        blurTimerRef.current = setTimeout(() => {
            blurTimerRef.current = null;
            if (!document.hidden && !document.hasFocus() && !isTerminatedRef.current) {
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


    // ATTACH LISTENERS
    useEffect(() => {
        if (!enabled) return;
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        window.addEventListener('pointerdown', handlePointerActivity, { passive: true });
        window.addEventListener('touchstart', handlePointerActivity, { passive: true });

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            window.removeEventListener('pointerdown', handlePointerActivity);
            window.removeEventListener('touchstart', handlePointerActivity);
            if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            if (fullscreenTimerRef.current) clearTimeout(fullscreenTimerRef.current);
        };
    }, [enabled, handleVisibilityChange, handleWindowBlur, handleWindowFocus, handleFullscreenChange, handlePointerActivity]);


    // 2. Fullscreen Enforcement
    const triggerFullscreen = async () => {
        if (!enabled) return;
        try {
            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    await document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    await document.documentElement.msRequestFullscreen();
                }
            }
        } catch (err) {
            console.warn("Fullscreen request failed:", err);
            // No toast here intentionally
        }
    };

    // Attempt on mount
    useEffect(() => {
        if (!enabled) return;
        triggerFullscreen();
    }, [enabled]);


    // 3. Clipboard & Context Menu Blockers
    const preventAction = useCallback((e, actionType) => {
        if (!enabled) return;
        e.preventDefault();

        const isRecentTouch = Date.now() - recentTouchTsRef.current <= securityPolicy.accidentalTouchGraceMs;
        if (actionType === 'context-menu' && isRecentTouch) {
            handleViolation(
                'copy-paste',
                'Long-press context menu was blocked. This warning does not increase violation count.',
                { warnOnly: true },
            );
            return;
        }

        registerActionSignal('copy-paste', 'Copy/paste-style action blocked. Repeated attempts will count as violations.');
    }, [enabled, handleViolation, registerActionSignal, securityPolicy.accidentalTouchGraceMs]);

    const securityHandlers = {
        onCopy: (e) => preventAction(e, 'copy'),
        onCut: (e) => preventAction(e, 'cut'),
        onPaste: (e) => preventAction(e, 'paste'),
        onContextMenu: (e) => preventAction(e, 'context-menu'),
    };

    return {
        violationCount,
        isTerminated,
        securityHandlers,
        triggerFullscreen
    };
};

export default useExamSecurity;