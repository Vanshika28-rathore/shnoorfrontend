import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProblemDescription from '../../components/exam/ProblemDescription';
import CodeEditorPanel from '../../components/exam/CodeEditorPanel';
import api from '../../api/axios';

const PracticeSession = ({ question: propQuestion, onChange }) => {
    const { challengeId } = useParams();
    const navigate = useNavigate();

    const isEmbedded = !!propQuestion;

    const languageTemplates = {
        javascript: '// Write your JavaScript code here\n',
        python: '# Write your Python code here\n',
        java: '// Write your Java code here\npublic class Solution {\n    // methods\n}',
        cpp: '// Write your C++ code here\n',
        go: '// Write your Go code here\n'
    };

    const [fetchedQuestion, setFetchedQuestion] = useState(null);
    const [loading, setLoading] = useState(isEmbedded ? false : true);
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [testResults, setTestResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [submitMessage, setSubmitMessage] = useState(null);

    const question = isEmbedded ? propQuestion : fetchedQuestion;

    useEffect(() => {
        if (isEmbedded) {
            const initialCode = propQuestion?.starterCode || languageTemplates.javascript;
            setCode(initialCode);
            return;
        }

        const fetchQuestion = async () => {
            try {
                const res = await api.get(`/api/practice/${challengeId}`);
                const data = res.data;

                const mapped = {
                    id: data.challenge_id,
                    title: data.title,
                    description: data.description,
                    starterCode: data.starter_code,
                    testCases: data.test_cases
                };

                setFetchedQuestion(mapped);
                setCode(mapped.starterCode || languageTemplates.javascript);
            } catch (err) {
                console.error("Failed to fetch challenge:", err);
            }
            setLoading(false);
        };

        fetchQuestion();
    }, [challengeId, isEmbedded, propQuestion?.starterCode]);

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        const template = languageTemplates[lang] || '';
        setCode(template);
        if (isEmbedded && onChange) onChange(template);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (isEmbedded && onChange) onChange(newCode);
    };

    // ✅ RUN — execute code and show test results
    const handleRun = async () => {
        setIsRunning(true);
        setConsoleOutput([]);
        setTestResults(null);
        setSubmitMessage(null);

        try {
            const qId = isEmbedded ? propQuestion?.id : challengeId;
            
            const res = await api.post('/api/practice/run', {
                code,
                language: selectedLanguage,
                challengeId: qId
            });

            const data = res.data;

            // Store structured test results
            setTestResults({
                results: data.results || [],
                summary: data.summary || {
                    total: (data.results || []).length,
                    passed: (data.results || []).filter(r => r.passed).length,
                    failed: (data.results || []).filter(r => !r.passed).length
                },
                passed: data.passed
            });

            // Also populate console with any errors
            const errorLogs = (data.results || [])
                .filter(r => r.error)
                .map(r => ({ type: 'error', msg: `Test ${r.testCaseNumber}: ${r.error}` }));

            if (errorLogs.length > 0) {
                setConsoleOutput(errorLogs);
            }

        } catch (err) {
            setConsoleOutput([
                { type: 'error', msg: err.response?.data?.message || err.message }
            ]);
        }

        setIsRunning(false);
    };

    // ✅ SUBMIT — run all test cases and save the submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const qId = isEmbedded ? propQuestion?.id : challengeId;

            const res = await api.post('/api/practice/submit', {
                code,
                language: selectedLanguage,
                challengeId: qId
            });

            const data = res.data;

            // Show test results from submission
            setTestResults({
                results: data.results || [],
                summary: data.summary || {
                    total: (data.results || []).length,
                    passed: (data.results || []).filter(r => r.passed).length,
                    failed: (data.results || []).filter(r => !r.passed).length
                },
                passed: data.passed
            });

            // Show submission success message
            const totalPassed = data.summary?.passed || 0;
            const totalTests = data.summary?.total || 0;

            if (data.passed) {
                setSubmitMessage({
                    type: 'success',
                    text: `🎉 All ${totalTests} test cases passed! Solution submitted successfully.`
                });
            } else {
                setSubmitMessage({
                    type: 'partial',
                    text: `Submitted! ${totalPassed}/${totalTests} test cases passed.`
                });
            }
        } catch (err) {
            setSubmitMessage({
                type: 'error',
                text: err.response?.data?.message || 'Submission failed. Please try again.'
            });
        }

        setIsSubmitting(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading challenge...</div>;
    }

    if (!question) {
        return <div className="p-8 text-center text-slate-500">Challenge not found.</div>;
    }

    const content = (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100/70">
            <div className="w-full lg:w-[40%] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
                <ProblemDescription question={question} />
            </div>

            <div className="w-full lg:w-[60%] lg:h-full relative flex flex-col bg-slate-950">
                {/* Submit message banner */}
                {submitMessage && (
                    <div className={`px-4 py-2 text-sm font-semibold flex items-center justify-between border-b ${submitMessage.type === 'success'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : submitMessage.type === 'partial'
                                ? 'bg-amber-500 text-white border-amber-400'
                                : 'bg-red-600 text-white border-red-500'
                        }`}>
                        <span>{submitMessage.text}</span>
                        <button
                            onClick={() => setSubmitMessage(null)}
                            className="ml-2 text-white/80 hover:text-white text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="flex-1 min-h-0">
                    <CodeEditorPanel
                        question={question}
                        startCode={code}
                        language={selectedLanguage}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={handleCodeChange}
                        onRun={handleRun}
                        onSubmit={isEmbedded ? null : handleSubmit}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                        consoleOutput={consoleOutput}
                        testResults={testResults}
                        isEmbedded={isEmbedded}
                    />
                </div>
            </div>
        </div>
    );

    if (isEmbedded) {
        return (
            <div className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                {content}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full lg:h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-4 lg:px-6 py-3 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 flex items-center justify-between">
                <button
                    onClick={() => navigate('/student/practice')}
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
                >
                    &larr; Back to Challenges
                </button>
            </div>
            <div className="flex-1 overflow-hidden">{content}</div>
        </div>
    );
};

export default PracticeSession;