/* eslint-disable no-unused-vars */
{/*import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FaCog, FaExpand, FaPlay, FaSave, FaPaperPlane } from 'react-icons/fa';

const CodeEditorPanel = ({ question, startCode, language, onLanguageChange, onCodeChange, onRun, onSubmit, isRunning, consoleOutput }) => {
    const [activeTab, setActiveTab] = useState('testcases');

    const handleEditorChange = (value) => {
        onCodeChange(value);
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#333]">
            { }
            <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-2">
                    <span role="img" aria-label="code" className="text-sm">💻</span>
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                        className="bg-transparent border-none text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
                    >
                        <option value="javascript" className="text-black">JavaScript</option>
                        <option value="python" className="text-black">Python</option>
                        <option value="java" className="text-black">Java</option>
                        <option value="cpp" className="text-black">C++</option>
                        <option value="go" className="text-black">Go</option>
                    </select>
                </div>
                <div className="flex gap-2 text-slate-400">
                    <button className="p-1 hover:text-white transition-colors" title="Settings"><FaCog /></button>
                    <button className="p-1 hover:text-white transition-colors" title="Fullscreen"><FaExpand /></button>
                </div>
            </div>

            { }
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    language={language || 'javascript'}
                    value={startCode}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                        fontFamily: "'Fira Code', 'Consolas', monospace"
                    }}
                />
            </div>

            <div className="h-50 flex flex-col bg-[#1e1e1e] border-t border-[#333]">
                <div className="flex border-b border-[#333] bg-[#252526]">
                    <div
                        className={`px-4 py-2 text-xs font-bold uppercase cursor-pointer transition-colors ${activeTab === 'testcases' ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                        onClick={() => setActiveTab('testcases')}
                    >
                        Test Cases
                    </div>
                    <div
                        className={`px-4 py-2 text-xs font-bold uppercase cursor-pointer transition-colors ${activeTab === 'console' ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                        onClick={() => setActiveTab('console')}
                    >
                        Console
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 text-sm font-mono text-slate-300">
                    {activeTab === 'testcases' && (
                        <div>
                            {(question.testCases || []).filter(tc => tc.isPublic).map((tc, idx) => (
                                <div key={idx} className="mb-4 last:mb-0">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Input</div>
                                    <div className="bg-[#2d2d2d] p-2 rounded mb-2 border border-[#444]">{tc.input}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Output</div>
                                    <div className="bg-[#2d2d2d] p-2 rounded border border-[#444]">{tc.output}</div>
                                </div>
                            ))}
                            {(question.testCases || []).filter(tc => tc.isPublic).length === 0 && (
                                <div className="text-gray-500 italic">No public test cases.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'console' && (
                        <div className="space-y-1">
                            {consoleOutput.length === 0 && <div className="text-gray-500 italic">&gt; Run code to see logging output...</div>}
                            {consoleOutput.map((log, i) => (
                                <div key={i} className="flex gap-2 items-start font-mono text-xs">
                                    <span className={log.type === 'error' ? 'text-red-500' : 'text-emerald-500'}>
                                        {log.type === 'error' ? '⨯' : '✓'}
                                    </span>
                                    <span className={`${log.type === 'error' ? 'text-red-300' : 'text-emerald-300'} whitespace-pre-wrap`}>{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            { }
            <div className="p-3 bg-[#252526] border-t border-[#333] flex justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-1.5 bg-[#333] text-slate-300 rounded hover:bg-[#444] transition-colors text-sm font-bold">
                    <FaSave /> Save
                </button>
                <button
                    className={`flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={onRun}
                    disabled={isRunning}
                >
                    {isRunning ? 'Running...' : <><FaPlay size={12} /> Run</>}
                </button>
                <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-bold" onClick={onSubmit}>
                    <FaPaperPlane size={12} /> Submit
                </button>
            </div>
        </div>
    );
};

export default CodeEditorPanel;*/}


import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
const Editor = lazy(() => import('@monaco-editor/react'));
import { FaExpand, FaPlay, FaPaperPlane, FaCheck, FaTimes } from 'react-icons/fa';

const CodeEditorPanel = ({
  question,
  startCode,
  language,
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  consoleOutput,
  testResults,
  isEmbedded
}) => {
  const [activeTab, setActiveTab] = useState('testcases');
  const [isMaximized, setIsMaximized] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const containerRef = useRef(null);

  /* 🔒 Detect function signature lines */
  const getReadOnlyRanges = (code) => {
    const lines = code.split('\n');
    const ranges = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (
        trimmed.startsWith('function ') ||
        trimmed.startsWith('def ') ||
        trimmed.startsWith('public ') ||
        trimmed.startsWith('#include')
      ) {
        ranges.push({
          startLineNumber: index + 1,
          endLineNumber: index + 1,
          startColumn: 1,
          endColumn: line.length + 1
        });
      }
    });

    return ranges;
  };

  /* 🔒 Lock function signature */
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const model = editor.getModel();
    if (!model || !startCode) return;

    const ranges = getReadOnlyRanges(startCode);

    editor.createDecorationsCollection(
      ranges.map(r => ({
        range: new monaco.Range(
          r.startLineNumber,
          r.startColumn,
          r.endLineNumber,
          r.endColumn
        ),
        options: {
          isWholeLine: true,
          className: 'read-only-line',
          stickiness:
            monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      }))
    );

    editor.onDidChangeModelContent((event) => {
      for (const change of event.changes) {
        const line = change.range.startLineNumber;
        if (ranges.some(r => r.startLineNumber === line)) {
          editor.executeEdits('', [
            {
              range: change.range,
              text: '',
              forceMoveMarkers: true
            }
          ]);
        }
      }
    });
  };

  // Auto-switch to results tab when test results arrive (only when there are actual results)
  useEffect(() => {
    if (testResults?.results && testResults.results.length > 0) {
      setActiveTab('results');
    }
  }, [testResults?.results]);

  // Sync fullscreen state when user exits via ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMaximized(!!document.fullscreenElement);
      if (!document.fullscreenElement && containerRef.current) {
        containerRef.current.removeAttribute('style');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Compute summary from testResults
  const summary = testResults?.summary || null;
  const results = testResults?.results || [];

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#111318] border-l border-slate-800">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#181b22] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span role="img" aria-label="code">💻</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="bg-white border border-indigo-200 rounded-md px-2.5 py-1 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <div className="flex gap-3 text-slate-500">
          <FaExpand 
            className="hover:text-slate-300 transition-colors cursor-pointer" 
            onClick={() => {
              if (containerRef.current) {
                if (!isMaximized) {
                  containerRef.current.requestFullscreen?.() || 
                  containerRef.current.setAttribute('style', 'position:fixed;inset:0;z-index:9999;width:100vw;height:100vh;');
                } else {
                  if (document.fullscreenElement) {
                    document.exitFullscreen?.();
                  }
                  containerRef.current.removeAttribute('style');
                }
              }
              setIsMaximized(!isMaximized);
            }}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-slate-500">Loading Editor...</div>}>
          <Editor
            height="100%"
            language={language}
            value={startCode}
            onChange={onCodeChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'Fira Code', monospace"
            }}
          />
        </Suspense>
      </div>

      {/* Bottom panel */}
      <div className="h-56 flex flex-col bg-[#111318] border-t border-slate-800">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-[#181b22]">
          <div
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${activeTab === 'testcases'
              ? 'text-indigo-300 border-b-2 border-indigo-400 bg-[#111318]'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            onClick={() => setActiveTab('testcases')}
          >
            Test Cases
          </div>
          <div
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${activeTab === 'results'
              ? 'text-indigo-300 border-b-2 border-indigo-400 bg-[#111318]'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            onClick={() => setActiveTab('results')}
          >
            Test Results
            {summary && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${summary.passed === summary.total
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'
                }`}>
                {summary.passed}/{summary.total}
              </span>
            )}
          </div>
          <div
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${activeTab === 'console'
              ? 'text-indigo-300 border-b-2 border-indigo-400 bg-[#111318]'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            onClick={() => setActiveTab('console')}
          >
            Console
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-3 text-xs text-slate-300">

          {/* Test Cases tab — show public test cases */}
          {activeTab === 'testcases' && (
            <div>
              {(question?.testCases || []).filter(tc => tc.isPublic).map((tc, idx) => (
                <div key={idx} className="mb-3 last:mb-0 bg-[#2a2a2a] rounded-lg p-3 border border-[#3a3a3a]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Input</div>
                  <div className="bg-[#1e1e1e] p-2 rounded mb-2 border border-[#444] font-mono">{tc.input}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Output</div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#444] font-mono">{tc.output}</div>
                </div>
              ))}
              {(question?.testCases || []).filter(tc => tc.isPublic).length === 0 && (
                <div className="text-gray-500 italic">No public test cases.</div>
              )}
            </div>
          )}

          {/* Test Results tab — show run results */}
          {activeTab === 'results' && (
            <div>
              {/* Summary bar */}
              {summary && (
                <div className={`mb-3 p-3 rounded-lg border flex items-center justify-between ${summary.passed === summary.total
                  ? 'bg-emerald-900/20 border-emerald-700/50'
                  : 'bg-red-900/20 border-red-700/50'
                  }`}>
                  <div className="flex items-center gap-2">
                    {summary.passed === summary.total ? (
                      <FaCheck className="text-emerald-400" />
                    ) : (
                      <FaTimes className="text-red-400" />
                    )}
                    <span className={`font-bold text-sm ${summary.passed === summary.total ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                      {summary.passed === summary.total ? 'All Test Cases Passed!' : 'Some Test Cases Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400 font-bold">
                      ✓ {summary.passed} passed
                    </span>
                    <span className="text-red-400 font-bold">
                      ✗ {summary.failed} failed
                    </span>
                    <span className="text-slate-400">
                      Total: {summary.total}
                    </span>
                  </div>
                </div>
              )}

              {/* Individual test case results */}
              {results.length > 0 ? (
                results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-3 rounded-lg border ${r.passed
                      ? 'bg-emerald-900/10 border-emerald-800/30'
                      : 'bg-red-900/10 border-red-800/30'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {r.passed ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <FaCheck size={10} /> Test Case {r.testCaseNumber}
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <FaTimes size={10} /> Test Case {r.testCaseNumber}
                        </span>
                      )}
                      {!r.isPublic && (
                        <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    {r.isPublic && (
                      <div className="space-y-1 font-mono text-[11px]">
                        {r.input !== undefined && (
                          <div>
                            <span className="text-slate-500">Input: </span>
                            <span className="text-slate-300">{r.input}</span>
                          </div>
                        )}
                        {r.expectedOutput !== undefined && (
                          <div>
                            <span className="text-slate-500">Expected: </span>
                            <span className="text-slate-300">{r.expectedOutput}</span>
                          </div>
                        )}
                        {r.actualOutput !== undefined && (
                          <div>
                            <span className="text-slate-500">Actual: </span>
                            <span className={r.passed ? 'text-emerald-400' : 'text-red-400'}>
                              {r.actualOutput || '(empty)'}
                            </span>
                          </div>
                        )}
                        {r.error && (
                          <div className="text-red-400 mt-1">
                            <span className="text-slate-500">Error: </span>
                            {r.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
                ) : (
                <div className="text-gray-500 italic flex items-center gap-2">
                  {isRunning ? (
                    <>
                      <span className="animate-spin">⟳</span> Running...
                    </>
                  ) : (
                    <>
                      <FaPlay size={10} /> Click "Run" to see test results...
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Console tab */}
          {activeTab === 'console' && (
            <div className="space-y-1">
              {(!consoleOutput || consoleOutput.length === 0) && (
                <div className="text-gray-500 italic">&gt; Run code to see output...</div>
              )}
              {(consoleOutput || []).map((log, i) => (
                <div key={i} className={`flex gap-2 items-start font-mono ${log.type === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}>
                  <span>{log.type === 'error' ? '⨯' : '✓'}</span>
                  <span className="whitespace-pre-wrap">{log.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-[#181b22] border-t border-slate-800 flex justify-end gap-3">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-900/20"
        >
          {isRunning ? (
            <><span className="animate-spin">⟳</span> Running...</>
          ) : (
            <><FaPlay size={12} /> Run</>
          )}
        </button>
        {!isEmbedded && (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-900/20"
          >
            {isSubmitting ? (
              <><span className="animate-spin">⟳</span> Submitting...</>
            ) : (
              <><FaPaperPlane size={12} /> Submit</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPanel;