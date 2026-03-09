
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * VideoStreamWidget
 * ─────────────────
 * A draggable, minimizable floating webcam preview.
 *
 * Props:
 *  - stream        : MediaStream | null
 *  - label         : string (default "LIVE")
 *  - initialCorner : 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
 *  - videoRef      : React.RefObject — external ref so AI detectors can read frames
 */

const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const cornerPosition = (corner, width, height) => {
  const MARGIN = 16;
  const map = {
    'top-left':     { top: MARGIN,                              left: MARGIN },
    'top-right':    { top: MARGIN,                              left: window.innerWidth  - width  - MARGIN },
    'bottom-left':  { top: window.innerHeight - height - MARGIN, left: MARGIN },
    'bottom-right': { top: window.innerHeight - height - MARGIN, left: window.innerWidth  - width  - MARGIN },
  };
  return map[corner] || map['bottom-right'];
};

const snapToCorner = (x, y, width, height) => {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const hw = window.innerWidth / 2;
  const hh = window.innerHeight / 2;
  if (cx < hw && cy < hh) return 'top-left';
  if (cx >= hw && cy < hh) return 'top-right';
  if (cx < hw && cy >= hh) return 'bottom-left';
  return 'bottom-right';
};

const WIDGET_W = 200;
const WIDGET_H = 140;
const MINI_W   = 52;
const MINI_H   = 52;

export default function VideoStreamWidget({
  stream = null,
  label = 'LIVE',
  initialCorner = 'bottom-right',
  videoRef: externalVideoRef = null,   // ← external ref from MockExam for AI detection
  aiDebugInfo = null,
}) {
  const [minimized, setMinimized]     = useState(false);
  const [corner, setCorner]           = useState(initialCorner);
  const [pos, setPos]                 = useState(() => cornerPosition(initialCorner, WIDGET_W, WIDGET_H));
  const [dragging, setDragging]       = useState(false);
  const [showCorners, setShowCorners] = useState(false);

  const dragStart = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });
  const internalVideoRef = useRef(null);
  // Use the external ref if provided, otherwise fall back to the internal one.
  // This allows useMockSecurity to read frames from this <video> element.
  const videoRef  = externalVideoRef ?? internalVideoRef;
  const widgetRef = useRef(null);
  const movedRef  = useRef(false);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // Re-snap whenever window resizes
  useEffect(() => {
    const onResize = () => {
      const w = minimized ? MINI_W : WIDGET_W;
      const h = minimized ? MINI_H : WIDGET_H;
      setPos(cornerPosition(corner, w, h));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [corner, minimized]);

  // ── Drag logic ────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    movedRef.current = false;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: pos.left,
      elY: pos.top,
    };
    setDragging(true);
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
      const w = minimized ? MINI_W : WIDGET_W;
      const h = minimized ? MINI_H : WIDGET_H;
      const newLeft = Math.max(0, Math.min(window.innerWidth  - w, dragStart.current.elX + dx));
      const newTop  = Math.max(0, Math.min(window.innerHeight - h, dragStart.current.elY + dy));
      setPos({ left: newLeft, top: newTop });
    };

    const onMouseUp = () => {
      setDragging(false);
      if (movedRef.current) {
        const w = minimized ? MINI_W : WIDGET_W;
        const h = minimized ? MINI_H : WIDGET_H;
        const snapped = snapToCorner(pos.left, pos.top, w, h);
        setCorner(snapped);
        setPos(cornerPosition(snapped, w, h));
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [dragging, minimized, pos]);

  // Touch support
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    movedRef.current = false;
    dragStart.current = { mouseX: t.clientX, mouseY: t.clientY, elX: pos.left, elY: pos.top };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onTouchMove = (e) => {
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.mouseX;
      const dy = t.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
      const w = minimized ? MINI_W : WIDGET_W;
      const h = minimized ? MINI_H : WIDGET_H;
      setPos({
        left: Math.max(0, Math.min(window.innerWidth  - w, dragStart.current.elX + dx)),
        top:  Math.max(0, Math.min(window.innerHeight - h, dragStart.current.elY + dy)),
      });
      e.preventDefault();
    };
    const onTouchEnd = () => {
      setDragging(false);
      if (movedRef.current) {
        const w = minimized ? MINI_W : WIDGET_W;
        const h = minimized ? MINI_H : WIDGET_H;
        const snapped = snapToCorner(pos.left, pos.top, w, h);
        setCorner(snapped);
        setPos(cornerPosition(snapped, w, h));
      }
    };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend',  onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  onTouchEnd);
    };
  }, [dragging, minimized, pos]);

  // ── Toggle minimize ───────────────────────────────────────────────────────
  const toggleMinimize = useCallback((e) => {
    e.stopPropagation();
    if (movedRef.current) return;
    const next = !minimized;
    setMinimized(next);
    const w = next ? MINI_W : WIDGET_W;
    const h = next ? MINI_H : WIDGET_H;
    setPos(cornerPosition(corner, w, h));
  }, [minimized, corner]);

  // ── Move to corner ────────────────────────────────────────────────────────
  const moveToCorner = useCallback((c, e) => {
    e.stopPropagation();
    const w = minimized ? MINI_W : WIDGET_W;
    const h = minimized ? MINI_H : WIDGET_H;
    setCorner(c);
    setPos(cornerPosition(c, w, h));
    setShowCorners(false);
  }, [minimized]);

  // ── Corner icon positions (relative to widget) ────────────────────────────
  const cornerDotStyle = (c) => {
    const base = {
      position: 'absolute',
      width: 20, height: 20,
      borderRadius: '50%',
      background: corner === c ? '#4f46e5' : 'rgba(255,255,255,0.85)',
      border: `2px solid ${corner === c ? '#4f46e5' : '#94a3b8'}`,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 7, color: corner === c ? '#fff' : '#64748b',
      transition: 'all 0.15s',
      zIndex: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    };
    const offset = 4;
    if (c === 'top-left')     return { ...base, top: offset,    left: offset };
    if (c === 'top-right')    return { ...base, top: offset,    right: offset };
    if (c === 'bottom-left')  return { ...base, bottom: offset, left: offset };
    return                           { ...base, bottom: offset, right: offset };
  };

  const w = minimized ? MINI_W : WIDGET_W;
  const h = minimized ? MINI_H : WIDGET_H;

  return (
    <div
      ref={widgetRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position:   'fixed',
        left:       pos.left,
        top:        pos.top,
        width:      w,
        height:     h,
        zIndex:     9999,
        cursor:     dragging ? 'grabbing' : 'grab',
        transition: dragging ? 'none' : 'width 0.25s ease, height 0.25s ease, left 0.25s ease, top 0.25s ease',
        userSelect: 'none',
        borderRadius: minimized ? '50%' : 10,
        overflow:   'hidden',
        boxShadow:  '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      {/* ── Video feed ── */}
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0f172a' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: 'scaleX(-1)', // mirror
          }}
        />

        {/* LIVE badge */}
        {!minimized && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: '#ef4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '2px 6px',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#fff',
              animation: 'livePulse 1.2s ease-in-out infinite',
            }} />
            {label}
          </div>
        )}

        {/* ── Control bar ── */}
        {!minimized && (
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
              padding: '10px 8px 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {aiDebugInfo && (
               <div style={{ flex: 1, fontSize: '10px', color: 'lime', textShadow: '1px 1px 2px black', fontFamily: 'monospace', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                 Obj: {aiDebugInfo.objects.length ? aiDebugInfo.objects.join(', ') : 'None'}
               </div>
            )}
            <button
              title="Move to corner"
              onClick={(e) => { e.stopPropagation(); setShowCorners(v => !v); }}
              style={controlBtn(showCorners)}
            >
              <GridIcon />
            </button>
            <button
              title="Minimise"
              onClick={toggleMinimize}
              style={controlBtn(false)}
            >
              <MinimizeIcon />
            </button>
          </div>
        )}

        {/* Minimized state: tap to restore */}
        {minimized && (
          <div
            onClick={toggleMinimize}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)',
              cursor: 'pointer',
            }}
            title="Restore"
          >
            <ExpandIcon />
          </div>
        )}

        {/* ── Corner selector overlay ── */}
        {showCorners && !minimized && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15,23,42,0.75)',
              backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>
              Snap to corner
            </div>
            {CORNERS.map(c => (
              <button
                key={c}
                title={c}
                onClick={(e) => moveToCorner(c, e)}
                style={cornerDotStyle(c)}
              >
                ●
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ── Tiny helpers ─────────────────────────────────────────────────────────────

const controlBtn = (active) => ({
  background: active ? 'rgba(79,70,229,0.85)' : 'rgba(255,255,255,0.18)',
  border: 'none',
  borderRadius: 5,
  width: 26, height: 22,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  color: '#fff',
  backdropFilter: 'blur(4px)',
  transition: 'background 0.15s',
  padding: 0,
});

const MinimizeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="5.5" width="10" height="1.5" rx="0.75" fill="currentColor"/>
  </svg>
);

const ExpandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 9h12M9 3v12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const GridIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.9"/>
    <rect x="7" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.9"/>
    <rect x="1" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.9"/>
    <rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.9"/>
  </svg>
);