export const PROCTORING_POLICY = {
  security: {
    maxViolationsNormal: 5,
    maxViolationsMock: 3,
    visibilityGraceMs: 1200,
    blurGraceMs: 1500,
    fullscreenExitGraceMs: 1200,
    violationCooldownMs: 8000,
    accidentalTouchGraceMs: 800,
    actionWarningBeforeStrike: 1,
    minSelectionChars: 10,
  },
  securityMobileOverrides: {
    visibilityGraceMs: 1800,
    blurGraceMs: 2200,
    fullscreenExitGraceMs: 1800,
    violationCooldownMs: 10000,
    accidentalTouchGraceMs: 1400,
    minSelectionChars: 18,
  },
  visual: {
    consecutiveChecksRequired: 2,
    faceDetectionIntervalMs: 2000,
    faceLoopDelayMs: 500,
    phoneDetectionIntervalMs: 1500,
    phoneMinScore: 0.6,
    phoneLabels: ['cell phone', 'book'],
  },
  audio: {
    voiceThreshold: 0.22,
    voiceDurationMs: 3000,
    loudMultiplier: 2.5,
    loudSustainMs: 3000,
    loudCooldownMs: 10000,
    loudWarningEventsBeforeFlag: 2,
  },
  mockAudio: {
    sampleIntervalMs: 200,
    calibrationMs: 5000,
    spikeMultiplier: 2.0,
    minRms: 25,
    requiredSustainMs: 3000,
    warningEventsBeforeStrike: 2,
  },
  aiCooldownMs: {
    'multiple-faces': 15000,
    'no-face': 15000,
    'phone-detected': 20000,
    'loud-audio': 10000,
  },
};

export const getSecurityPolicy = ({ isMobile = false, isMock = false } = {}) => {
  const merged = {
    ...PROCTORING_POLICY.security,
    ...(isMobile ? PROCTORING_POLICY.securityMobileOverrides : {}),
  };

  return {
    ...merged,
    maxViolations: isMock ? merged.maxViolationsMock : merged.maxViolationsNormal,
  };
};
