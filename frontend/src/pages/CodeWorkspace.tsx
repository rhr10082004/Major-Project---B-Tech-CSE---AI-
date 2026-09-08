import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL, AI_BASE_URL } from '../api';
import offlineProblems from '../data/leetcode_problems.json';

export const CodeWorkspace: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [customInput, setCustomInput] = useState('');
  
  // AI Tutor State
  const [aiChat, setAiChat] = useState<{role: string, text: string}[]>([]);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  
  // Layout State (active bottom tab)
  const [bottomTab, setBottomTab] = useState<'testcases' | 'result'>('testcases');

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  const fetchProblem = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/leetcode/problems/slug/${slug}`);
      setProblem(res.data.problem);
      // Set starter code
      const stub = res.data.problem.starterCode?.[language] || getDefaultStub(language, res.data.problem);
      setCode(stub);
    } catch (err) {
      const offlineProblem = offlineProblems.find((candidate) =>
        candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
      );
      if (offlineProblem) {
        const normalizedProblem = {
          ...offlineProblem,
          problemId: Number(offlineProblem.id.replace('lc-', '')),
          platform: offlineProblem.platform || 'LeetCode',
          slug,
          examples: offlineProblem.testCases?.slice(0, 2).map((testCase) => ({
            input: testCase.input,
            output: testCase.expectedOutput
          }))
        };
        setProblem(normalizedProblem);
        setCode(normalizedProblem.starterCode?.[language] || getDefaultStub(language, normalizedProblem));
      } else {
        console.error(err);
      }
    }
    setLoading(false);
  };

  const getDefaultStub = (lang: string, prob: any) => {
    if (lang === 'python') return `def solve():\n    # Write your solution here\n    pass`;
    if (lang === 'javascript') return `function solve() {\n    // Write your solution here\n}`;
    if (lang === 'java') return `class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}`;
    if (lang === 'cpp') return `class Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};`;
    return `// Write your solution here`;
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const stub = problem?.starterCode?.[newLang] || getDefaultStub(newLang, problem);
    setCode(stub);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setBottomTab('result');
    setRunResult({ status: 'Running', output: 'Executing code in isolated sandbox...', error: null });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/leetcode/problems/${slug}/run`, {
        language,
        code,
        customTestCases: customInput.trim() ? [{ input: customInput }] : null
      });
      setRunResult(res.data);
    } catch (err: any) {
      setRunResult({
        status: 'Unavailable',
        output: 'Your code is ready in the editor. Live execution requires the coding backend to be online.',
        error: err.response?.data?.error || err.message
      });
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setBottomTab('result');
    setRunResult({ status: 'Judging', output: 'Running hidden test cases...', error: null });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/leetcode/problems/${slug}/submit`, {
        language,
        code,
        userId: 'usr-1' // mock user id
      });
      setRunResult({
        status: res.data.submission.status,
        output: res.data.output,
        error: res.data.error,
        runtime: res.data.submission.runtime,
        memory: res.data.submission.memory,
        testCasesPassed: res.data.submission.testCasesPassed,
        totalTestCases: res.data.submission.totalTestCases
      });
      
      // Auto-trigger AI Review if error
      if (res.data.submission.status !== 'Accepted') {
         triggerAiReview(res.data.submission.status, res.data.error || 'Wrong Answer');
      }
    } catch (err: any) {
      setRunResult({
        status: 'Unavailable',
        output: 'Your solution is ready. Submission requires the coding backend to be online.',
        error: err.response?.data?.error || err.message
      });
    }
    setIsSubmitting(false);
  };

  const requestHint = async () => {
    setIsGeneratingHint(true);
    try {
      const res = await axios.post(`${AI_BASE_URL}/api/ai/leetcode/hint`, {
        problem_title: problem.title,
        problem_description: problem.description,
        difficulty: problem.difficulty,
        hint_level: hintLevel
      });
      setAiChat(prev => [...prev, { role: 'ai', text: res.data.hint }]);
      if (hintLevel < 5) setHintLevel(prev => prev + 1);
    } catch (err) {
      setAiChat(prev => [...prev, { role: 'ai', text: 'AI Tutor is currently unavailable.' }]);
    }
    setIsGeneratingHint(false);
  };

  const triggerAiReview = async (errorType: string, errorMessage: string) => {
    setAiChat(prev => [...prev, { role: 'ai', text: `Analyzing your ${errorType}...` }]);
    try {
      const res = await axios.post(`${AI_BASE_URL}/api/ai/leetcode/review`, {
        problem_title: problem.title,
        code: code,
        language: language,
        error_type: errorType,
        error_message: errorMessage
      });
      setAiChat(prev => [...prev, { role: 'ai', text: `Feedback: ${res.data.feedback}` }]);
    } catch (err) {}
  };

  if (loading) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}><div className="text-xl text-blue-500 font-bold animate-pulse">Loading Workspace...</div></div>;
  if (!problem) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center text-red-500`}>Problem not found</div>;

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg} ${theme.textPrimary}`}>
      {/* Workspace Header */}
      <header className={`h-14 flex items-center justify-between px-4 border-b ${isDark ? 'border-gray-800 bg-[#1e1e1e]' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/leetcode')} className="font-bold hover:text-blue-500 transition">&larr; DB</button>
          <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold rounded text-indigo-500 bg-indigo-500/10">{problem.platform || 'LeetCode'}</span>
          <span className={`px-2 py-0.5 text-xs font-bold rounded ${problem.difficulty === 'Easy' ? 'text-green-500 bg-green-500/10' : problem.difficulty === 'Medium' ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10'}`}>{problem.difficulty}</span>
            <h1 className="font-bold">{problem.problemId}. {problem.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRunCode} disabled={isRunning || isSubmitting} className="px-4 py-1.5 text-sm font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded flex items-center gap-2 transition disabled:opacity-50">
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
          <button onClick={handleSubmit} disabled={isRunning || isSubmitting} className="px-4 py-1.5 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded flex items-center gap-2 transition shadow-lg shadow-green-500/20 disabled:opacity-50">
            {isSubmitting ? 'Judging...' : '☁ Submit'}
          </button>
        </div>
      </header>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Description */}
        <div className={`w-[30%] min-w-[300px] border-r overflow-y-auto p-6 ${isDark ? 'border-gray-800 bg-[#1e1e1e]/50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="prose dark:prose-invert max-w-none text-sm">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-500">
            <span>{problem.platform || 'LeetCode'}</span>
            <span>•</span>
            <span>{problem.difficulty}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: problem.description }} />
            
            {problem.examples?.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Examples</h3>
                {problem.examples.map((ex: any, i: number) => (
                  <div key={i} className={`p-4 rounded-lg mb-4 font-mono text-xs ${isDark ? 'bg-black/40 border border-white/5' : 'bg-gray-200/50'}`}>
                    <div className="mb-2"><strong className="text-gray-400">Input:</strong> <br/>{ex.input}</div>
                    <div className="mb-2"><strong className="text-gray-400">Output:</strong> <br/>{ex.output}</div>
                    {ex.explanation && <div><strong className="text-gray-400">Explanation:</strong> <br/>{ex.explanation}</div>}
                  </div>
                ))}
              </div>
            )}

            {problem.constraints?.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Constraints</h3>
                <ul className="list-disc pl-5 font-mono text-xs opacity-80">
                  {problem.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel: Editor & Console */}
        <div className="flex-1 flex flex-col min-w-[400px]">
          {/* Editor Header */}
          <div className={`h-10 flex items-center px-4 border-b ${isDark ? 'border-gray-800 bg-[#1e1e1e]' : 'border-gray-200 bg-white'}`}>
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`text-xs font-bold px-2 py-1 rounded outline-none cursor-pointer ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
            >
              <option value="python">Python 3.10</option>
              <option value="javascript">Node.js 18</option>
              <option value="cpp">C++ 10</option>
              <option value="java">Java 15</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="go">Go 1.16</option>
            </select>
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'c' || language === 'cpp' ? 'cpp' : language}
              theme={isDark ? 'vs-dark' : 'light'}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", scrollBeyondLastLine: false }}
            />
          </div>

          {/* Console / Test Cases Panel */}
          <div className={`h-[300px] flex flex-col border-t ${isDark ? 'border-gray-800 bg-[#1e1e1e]' : 'border-gray-200 bg-white'}`}>
            <div className={`flex items-center gap-1 border-b px-2 pt-2 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button onClick={() => setBottomTab('testcases')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${bottomTab === 'testcases' ? (isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black') : 'text-gray-500 hover:text-gray-300'}`}>
                Test Cases
              </button>
              <button onClick={() => setBottomTab('result')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 ${bottomTab === 'result' ? (isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black') : 'text-gray-500 hover:text-gray-300'}`}>
                Execution Result {runResult && <span className={`w-2 h-2 rounded-full ${runResult.status === 'Accepted' || runResult.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}></span>}
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {bottomTab === 'testcases' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold opacity-70 mb-2 block">Custom Input (Stdin)</label>
                    <textarea 
                      className={`w-full h-32 p-3 font-mono text-sm rounded-lg outline-none border transition ${isDark ? 'bg-black/50 border-gray-700 focus:border-blue-500' : 'bg-white border-gray-300 focus:border-blue-500'}`}
                      placeholder="Enter custom test cases here..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="font-mono text-sm">
                  {!runResult ? (
                    <div className="opacity-50 text-center mt-10">Run or Submit code to see results.</div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className={`text-lg font-bold ${runResult.status === 'Accepted' || runResult.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>
                        {runResult.status}
                      </h3>
                      
                      {runResult.runtime && (
                        <div className="flex gap-4 text-xs opacity-70">
                          <span>Runtime: {runResult.runtime} ms</span>
                          <span>Memory: {runResult.memory} MB</span>
                          {runResult.testCasesPassed !== undefined && <span>Test Cases: {runResult.testCasesPassed}/{runResult.totalTestCases}</span>}
                        </div>
                      )}
                      
                      {runResult.output && (
                        <div>
                          <strong className="text-xs opacity-70 block mb-1">Stdout:</strong>
                          <pre className={`p-3 rounded-lg ${isDark ? 'bg-black/40' : 'bg-gray-100'} whitespace-pre-wrap`}>{runResult.output}</pre>
                        </div>
                      )}
                      
                      {runResult.error && (
                        <div>
                          <strong className="text-xs text-red-400 block mb-1">Stderr:</strong>
                          <pre className={`p-3 rounded-lg ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'} whitespace-pre-wrap`}>{runResult.error}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: AI Tutor */}
        <div className={`w-[25%] min-w-[280px] border-l flex flex-col ${isDark ? 'border-gray-800 bg-[#1e1e1e]/50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="p-4 border-b border-gray-800/20 dark:border-gray-700">
            <h2 className="font-bold flex items-center gap-2">🤖 Gemini AI Tutor</h2>
            <p className="text-[10px] opacity-70 mt-1">Stuck? Get progressive Socratic hints without revealing the answer immediately.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiChat.length === 0 ? (
              <div className="text-center opacity-50 text-xs mt-10">AI is ready to assist you.</div>
            ) : (
              aiChat.map((msg, i) => (
                <div key={i} className={`p-3 text-sm rounded-xl ${msg.role === 'ai' ? (isDark ? 'bg-blue-900/20 border border-blue-500/20' : 'bg-blue-50 border border-blue-100') : (isDark ? 'bg-gray-800' : 'bg-gray-200')}`}>
                  {msg.text}
                </div>
              ))
            )}
            {isGeneratingHint && (
              <div className="p-3 text-sm rounded-xl bg-blue-900/20 border border-blue-500/20 animate-pulse">Thinking...</div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-800/20 dark:border-gray-700 flex flex-col gap-2">
            <button 
              onClick={requestHint} 
              disabled={isGeneratingHint || hintLevel > 5}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {hintLevel <= 5 ? `Ask for Hint ${hintLevel}` : `Full Solution Reached`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
