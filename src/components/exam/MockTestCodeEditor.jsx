
import React, { useRef, useState, useEffect, useCallback } from 'react';

// Tab size constant
const TAB = '  '; // 2 spaces

const MockTestCodeEditor = ({
  question = { testCases: [] },
  code = '',
  language = 'javascript',
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  isRunning = false,
  consoleOutput = [],
}) => {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const consoleEndRef = useRef(null);
  const [lines, setLines] = useState(1);
  const [localCode, setLocalCode] = useState(code);

  // Sync localCode when code prop changes (e.g. question switch)
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  // Sync line count
  useEffect(() => {
    const count = (localCode.match(/\n/g) || []).length + 1;
    setLines(count);
  }, [localCode]);

  // Auto-scroll console to latest output
  useEffect(() => {
    if (consoleOutput.length > 0) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleOutput]);

  // Keep textarea and line numbers scroll in sync
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleChange = (e) => {
    setLocalCode(e.target.value);
    onCodeChange?.(e.target.value);
  };

  // Handle Tab key, auto-close brackets, and Enter for indentation
  const handleKeyDown = useCallback((e) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;

    if (e.key === 'Tab') {
      e.preventDefault();
      const newVal = value.slice(0, selectionStart) + TAB + value.slice(selectionEnd);
      setLocalCode(newVal);
      onCodeChange?.(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + TAB.length;
      });
      return;
    }

    // Auto-close brackets / quotes
    const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
    if (pairs[e.key] && selectionStart === selectionEnd) {
      e.preventDefault();
      const closing = pairs[e.key];
      const newVal = value.slice(0, selectionStart) + e.key + closing + value.slice(selectionEnd);
      setLocalCode(newVal);
      onCodeChange?.(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 1;
      });
      return;
    }

    // Enter: preserve current line indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.slice(lineStart, selectionStart);
      const indent = currentLine.match(/^(\s*)/)[1];
      // If cursor is right after { add extra indent
      const charBefore = value[selectionStart - 1];
      const extraIndent = charBefore === '{' || charBefore === '(' || charBefore === '[' ? TAB : '';
      const insert = '\n' + indent + extraIndent;
      const newVal = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
      setLocalCode(newVal);
      onCodeChange?.(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + insert.length;
      });
    }
  }, [onCodeChange]);

  const languageMap = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 360,
        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
        }}
      >
        <select
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          style={{
            fontSize: 13,
            color: '#374151',
            background: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            padding: '4px 8px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {Object.entries(languageMap).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onRun}
            disabled={isRunning}
            style={{
              background: isRunning ? '#9ca3af' : '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '5px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {isRunning ? 'Running…' : 'Run'}
          </button>
          <button
            onClick={onSubmit}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '5px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 220,
          background: '#fafafa',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          style={{
            width: 44,
            minWidth: 44,
            background: '#f1f5f9',
            borderRight: '1px solid #e2e8f0',
            color: '#94a3b8',
            fontSize: 13,
            lineHeight: '21px',
            padding: '12px 8px',
            textAlign: 'right',
            userSelect: 'none',
            overflowY: 'hidden',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        >
          {Array.from({ length: lines }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={localCode}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={`// Write your ${languageMap[language] || 'code'} here…`}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: '#fafafa',
            color: '#1e293b',
            fontSize: 13,
            lineHeight: '21px',
            padding: '12px 16px',
            fontFamily: 'inherit',
            tabSize: 2,
            whiteSpace: 'pre',
            overflowX: 'auto',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── Bottom Panel ── */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
          fontSize: 12,
          fontFamily: 'inherit',
        }}
      >
        {/* Test Cases — fixed height, no scroll */}
        {question.testCases?.length > 0 && (
          <div
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            <div style={{ fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Test cases:
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#374151' }}>
              {question.testCases.map((tc, idx) => (
                <li key={idx} style={{ marginBottom: 2 }}>
                  <span style={{ color: '#64748b' }}>input:</span> {tc.input}
                  {'  '}
                  <span style={{ color: '#64748b' }}>expected:</span> {tc.output}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Output — scrollable, always fully visible */}
        <div
          style={{
            padding: '8px 14px',
            maxHeight: 130,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 600, color: '#475569', marginBottom: 4 }}>
            Output:
          </div>

          {isRunning ? (
            <div style={{ color: '#6366f1', fontStyle: 'italic' }}>Running…</div>
          ) : consoleOutput.length === 0 ? (
            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No output yet.</div>
          ) : (
            consoleOutput.map((log, i) => (
              <div
                key={i}
                style={{
                  color: log.type === 'error' ? '#ef4444' : '#1e293b',
                  lineHeight: '1.6',
                }}
              >
                {log.msg}
              </div>
            ))
          )}

          {/* Scroll anchor */}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MockTestCodeEditor;