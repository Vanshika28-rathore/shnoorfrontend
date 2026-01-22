import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ProblemDescription from '../../components/exam/ProblemDescription';
import CodeEditorPanel from '../../components/exam/CodeEditorPanel';
import { getStudentData } from '../../utils/studentData';


const PracticeSession = ({ question: propQuestion, value, onChange, onComplete }) => {
    const { challengeId } = useParams();
    const navigate = useNavigate();

    const isEmbedded = !!propQuestion;

    const [fetchedQuestion, setFetchedQuestion] = useState(null);
    const [loading, setLoading] = useState(!isEmbedded);
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');

    const question = isEmbedded ? propQuestion : fetchedQuestion;

    const languageTemplates = {
        'javascript': '// Write your JavaScript code here\n',
        'python': '# Write your Python code here\n',
        'java': '// Write your Java code here\npublic class Solution {\n    // methods\n}',
        'cpp': '// Write your C++ code here\n',
        'go': '// Write your Go code here\n'
    };

    useEffect(() => {
        if (isEmbedded) {
            if (value !== undefined) {
                setCode(value);
            } else if (propQuestion.starterCode) {
                setCode(propQuestion.starterCode);
            } else {
                setCode(languageTemplates['javascript']);
            }
            setLoading(false);
        } else {
            const fetchQuestion = () => {
                const data = getStudentData();
                const found = data.practiceChallenges?.find(c => c.id === challengeId);
                if (found) {
                    setFetchedQuestion(found);
                    let initialCode = found.starterCode;
                    if (!initialCode) {
                        initialCode = languageTemplates['javascript'];
                    }
                    setCode(initialCode);
                }
                setLoading(false);
            };
            fetchQuestion();
        }
    }, [challengeId, propQuestion, isEmbedded, value]);

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        if (lang === 'javascript' && question.starterCode) {
            setCode(question.starterCode);
        } else {
            setCode(languageTemplates[lang]);
        }
        if (isEmbedded && onChange) onChange(languageTemplates[lang]);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (isEmbedded && onChange) {
            onChange(newCode);
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setConsoleOutput([]);

        const languageMap = {
            'javascript': { language: 'javascript', version: '18.15.0' },
            'python': { language: 'python', version: '3.10.0' },
            'java': { language: 'java', version: '15.0.2' },
            'cpp': { language: 'c++', version: '10.2.0' },
            'go': { language: 'go', version: '1.16.2' }
        };

        const selectedLangConfig = languageMap[selectedLanguage];
        const testCases = (question.testCases || []).filter(tc => tc.isPublic);
        let results = [];
        let allPassed = true;

        if (testCases.length === 0) {
            results.push({ type: 'info', msg: 'No public test cases to run.' });
            setConsoleOutput(results);
            setIsRunning(false);
            return;
        }

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            let runnableCode = code;

            try {
                if (selectedLanguage === 'javascript') {
                    const match = code.match(/function\s+(\w+)\s*\(/);
                    if (match && match[1]) {
                        const funcName = match[1];
                        runnableCode = `
                            ${code}
                            try {
                                const args = [${tc.input}];
                                const result = ${funcName}(...args);
                                if (typeof result === 'object' && result !== null) {
                                    console.log(JSON.stringify(result));
                                } else {
                                    console.log(result);
                                }
                            } catch (err) {
                                console.error(err.message);
                            }
                        `;
                    }
                } else if (selectedLanguage === 'python') {
                    const match = code.match(/def\s+(\w+)\s*\(/);
                    if (match && match[1]) {
                        const funcName = match[1];
                        runnableCode = `
import sys
import json
${code}
if __name__ == "__main__":
    try:
        args = (${tc.input})
        if not isinstance(args, tuple):
            args = (args,)
        result = ${funcName}(*args)
        if isinstance(result, (list, dict, tuple)):
            print(json.dumps(result, separators=(',', ':')))
        elif isinstance(result, bool):
             print("true" if result else "false")
        else:
            print(result)
    except Exception as e:
        print(e, file=sys.stderr)
`;
                    }
                }

            } catch (err) {
                console.error("Wrapper preparation error", err);
            }

            try {
                const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                    language: selectedLangConfig.language,
                    version: selectedLangConfig.version,
                    files: [{ content: runnableCode }],
                    compile_timeout: 10000,
                    run_timeout: 3000,
                });

                const { run, compile } = response.data;

                if (compile && compile.stderr) {
                    allPassed = false;
                    results.push({ type: 'error', msg: `Compilation Error (Test Case ${i + 1}):\n${compile.stderr}` });
                    break;
                }

                if (run.stderr) {
                    allPassed = false;
                    results.push({ type: 'error', msg: `Runtime Error (Test Case ${i + 1}):\n${run.stderr}` });
                } else {
                    const actualOutput = (run.stdout || '').trim();
                    const expectedOutput = (tc.output || '').trim();

                    if (actualOutput === expectedOutput) {
                        results.push({ type: 'success', msg: `Test Case ${i + 1} Passed` });
                    } else {
                        allPassed = false;
                        results.push({ type: 'error', msg: `Test Case ${i + 1} Failed.\nInput: ${tc.input}\nExpected: ${expectedOutput}\nGot: ${actualOutput}` });
                    }
                }
            } catch (error) {
                allPassed = false;
                results.push({ type: 'error', msg: `Execution Error (Test Case ${i + 1}): ${error.message}` });
            }
        }

        if (allPassed && results.length > 0 && !results.some(r => r.type === 'error')) {
            results.push({ type: 'success', msg: 'All Public Test Cases Passed!' });
        }
        setConsoleOutput(results);
        setIsRunning(false);
    };


    if (loading) return <div className="p-8 text-center text-slate-500">Loading challenge...</div>;
    if (!question) return <div className="p-8 text-center text-slate-500">Challenge not found.</div>;

    const content = (
        <div className="flex h-full overflow-hidden">
            <div className="w-[40%] h-full border-r border-slate-200 bg-slate-50">
                <ProblemDescription question={question} />
            </div>
            <div className="w-[60%] h-full relative">
                <CodeEditorPanel
                    question={question}
                    startCode={code}
                    language={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={handleCodeChange}
                    onRun={handleRun}
                    onSubmit={isEmbedded ? null : () => { }}
                    isRunning={isRunning}
                    consoleOutput={consoleOutput}
                    isEmbedded={isEmbedded}
                />
            </div>
        </div>
    );

    if (isEmbedded) {
        return <div className="h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">{content}</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden m-6">
            <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                <button onClick={() => navigate('/student/practice')} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
                    &larr; Back to Challenges
                </button>
            </div>
            <div className="flex-1 overflow-hidden">{content}</div>
        </div>
    );
};

export default PracticeSession;
