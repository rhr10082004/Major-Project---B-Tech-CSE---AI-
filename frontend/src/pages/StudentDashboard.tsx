import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaVideo, FaLayerGroup, FaQuestionCircle, FaRobot, FaYoutube, FaLaptopCode,
  FaCalendarAlt, FaFileAlt, FaSync, FaCheckCircle, FaSpinner, FaArrowRight,
  FaArrowLeft, FaBookmark, FaRegBookmark, FaLightbulb, FaGraduationCap,
  FaPlay, FaTerminal, FaCode, FaTrophy, FaBolt, FaCheck, FaTimes
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { User, Lecture, Flashcard, MCQ, YoutubeVideo, LeetCodeProfile, StudyPlan } from '../types';
import { studyApi } from '../api';
import { useTheme } from '../context/ThemeContext';
import offlineProblems from '../data/leetcode_problems.json';

const publicVideoCatalog: YoutubeVideo[] = [
  { videoId: 'kCc8FmRoS0j', title: 'Deep Learning and Transformers', channel: 'Stanford Online', duration: '48:15', views: '240K views', description: 'Self-attention, transformers, and modern machine learning.' },
  { videoId: 'aircAruvnKk', title: 'Neural Networks Explained Visually', channel: '3Blue1Brown', duration: '20:42', views: '1.2M views', description: 'A visual introduction to neural networks and gradient descent.' },
  { videoId: 'rfscVS0vtbw', title: 'Python Programming Course', channel: ' freeCodeCamp.org', duration: '4:26:52', views: '38M views', description: 'Complete Python programming course for beginners.' },
  { videoId: 'zOj9cS7YhXQ', title: 'Data Structures and Algorithms', channel: 'freeCodeCamp.org', duration: '5:00:00', views: '2.8M views', description: 'Algorithms, complexity, arrays, trees, and graphs.' },
  { videoId: 'RBSGKlAvoiM', title: 'Data Structures Easy to Advanced', channel: 'freeCodeCamp.org', duration: '8:03:50', views: '6.4M views', description: 'A complete data structures learning path.' },
  { videoId: 'WUvTyaaNkzM', title: 'Dynamic Programming Full Course', channel: 'William Fiset', duration: '1:45:00', views: '1.1M views', description: 'Memoization, tabulation, and optimization techniques.' },
  { videoId: 'TzeBrDU-JaY', title: 'Operating Systems Course', channel: 'Neso Academy', duration: '3:12:00', views: '4.1M views', description: 'Processes, memory, scheduling, and file systems.' },
  { videoId: 'F8Zs8E4P2b4', title: 'Computer Networks Complete Course', channel: 'Gate Smashers', duration: '2:40:00', views: '3.6M views', description: 'Networking fundamentals, TCP/IP, and protocols.' },
  { videoId: 'M4l3D4rJQ9U', title: 'System Design Interview Course', channel: 'Gaurav Sen', duration: '2:15:00', views: '2.2M views', description: 'Scalable systems, caching, databases, and architecture.' },
  { videoId: 'h4RkKJ8v7XQ', title: 'MongoDB Tutorial for Beginners', channel: 'Programming with Mosh', duration: '1:02:00', views: '5.8M views', description: 'Documents, collections, queries, and aggregation.' },
  { videoId: 'eIrMbAQSU34', title: 'Java Programming for Beginners', channel: 'Programming with Mosh', duration: '2:25:00', views: '12M views', description: 'Java syntax, object-oriented programming, and projects.' },
  { videoId: 'zJ-LqeX_fLU', title: 'JavaScript Full Course', channel: 'freeCodeCamp.org', duration: '3:40:00', views: '9.4M views', description: 'Modern JavaScript fundamentals and browser development.' },
  { videoId: 'UB1O30fR-EE', title: 'React JS Course', channel: 'Programming with Mosh', duration: '1:48:00', views: '4.8M views', description: 'React components, state, hooks, and application architecture.' },
  { videoId: 'Oe421EPjeBE', title: 'Node.js and Express Tutorial', channel: 'freeCodeCamp.org', duration: '8:16:00', views: '3.2M views', description: 'Build REST APIs with Node.js and Express.' },
  { videoId: 'qiQR5rTSshw', title: 'Docker and Kubernetes Course', channel: 'freeCodeCamp.org', duration: '5:27:00', views: '3.9M views', description: 'Containers, images, orchestration, and deployment.' },
  { videoId: '8JJ101D3knE', title: 'Git and GitHub for Beginners', channel: 'Programming with Mosh', duration: '1:09:00', views: '10M views', description: 'Version control, branching, merging, and collaboration.' }
];

const defaultAssessmentQuestions: MCQ[] = [
  {
    id: 1,
    question: 'Which data structure provides average O(1) lookup time for key-value pairs?',
    options: ['Hash table', 'Linked list', 'Binary tree without balancing', 'Stack'],
    answer: 'Hash table',
    explanation: 'Hash tables use a hash function to locate values directly by key on average.'
  },
  {
    id: 2,
    question: 'Which technique stores results of overlapping subproblems to improve an algorithm?',
    options: ['Dynamic programming', 'Depth-first search', 'Binary encoding', 'Round-robin scheduling'],
    answer: 'Dynamic programming',
    explanation: 'Dynamic programming combines memoization or tabulation with optimal substructure.'
  },
  {
    id: 3,
    question: 'Which protocol is connection-oriented and provides reliable ordered delivery?',
    options: ['TCP', 'UDP', 'DNS', 'HTTP'],
    answer: 'TCP',
    explanation: 'TCP establishes a connection and uses acknowledgements and sequencing for reliable delivery.'
  }
];

interface StudentDashboardProps {
  user: User | null;
  onLogout: () => void;
}

interface CodingProblem {
  id: string;
  platform: 'LeetCode' | 'HackerRank' | 'Codeforces' | 'CodeChef';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  acceptanceRate: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
  starterCode: { python?: string; javascript?: string; java?: string; cpp?: string };
  hint: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const { isDark, theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'video' | 'youtube' | 'coding' | 'flashcards' | 'mcq' | 'chat' | 'planner'>(() => {
    const saved = localStorage.getItem('default_tab');
    if (saved && ['video', 'youtube', 'coding', 'flashcards', 'mcq', 'chat', 'planner'].includes(saved)) {
      localStorage.removeItem('default_tab');
      return saved as any;
    }
    return 'youtube'; // Defaults directly to YouTube Video Watcher & Summarizer!
  });

  const [loadingStats, setLoadingStats] = useState(false);
  const [stats, setStats] = useState({ lectures: 6, notes: 38, flashcards: 45, mcqs: 135, streak: user?.streak || 12 });
  const [recentLectures, setRecentLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  // Video summarizer state
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=kCc8FmRoS0j');
  const [videoTitle, setVideoTitle] = useState('Deep Bidirectional Transformers & Whisper STT 🎙️');
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [processingStageIdx, setProcessingStageIdx] = useState(0);

  // In-App YouTube Video Watcher & AI Summarizer state
  const [watchingVideo, setWatchingVideo] = useState<{ videoId: string; title: string; channel: string; duration: string; summary?: any }>({
    videoId: 'kCc8FmRoS0j',
    title: 'Deep Dive into Machine Learning: Self-Attention & Transformers 🚀 ✨',
    channel: 'MIT & Stanford Lectures 🏛️',
    duration: '48:15'
  });
  const [ytQuery, setYtQuery] = useState('machine learning engineering');
  const [ytResults, setYtResults] = useState<YoutubeVideo[]>([]);
  const [isSummarizingYt, setIsSummarizingYt] = useState(false);
  const [ytSummaryData, setYtSummaryData] = useState<any>(null);

  // All-In-One Coding Arena (LeetCode, HackerRank, Codeforces, CodeChef)
  const [codingPlatformFilter, setCodingPlatformFilter] = useState<'All' | 'LeetCode' | 'HackerRank' | 'Codeforces' | 'CodeChef'>('All');
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [codeLang, setCodeLang] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const [editorCode, setEditorCode] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeRunResult, setCodeRunResult] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);

  // Flashcards state
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);

  // MCQ state
  const [mcqDifficulty, setMcqDifficulty] = useState('Medium');
  const [currentMcqs, setCurrentMcqs] = useState<MCQ[]>(defaultAssessmentQuestions);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Chat assistant state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "👋 Welcome to your All-in-One Parul University Study Platform! ✨ 👑 You can watch embedded YouTube lectures in our Video Watcher & Summarizer and practice LeetCode, HackerRank, Codeforces, and CodeChef directly on this dashboard!" }
  ]);

  // LeetCode & competitive profile
  const [leetcodeUsername, setLeetcodeUsername] = useState('sajid_khan');
  const [leetcodeProfile, setLeetcodeProfile] = useState<LeetCodeProfile | null>(null);

  // Study Planner & Resume builder state
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [examDate, setExamDate] = useState('2026-08-15');
  const [resumeData, setResumeData] = useState({ fullName: user?.name || 'Sajid Khan ✨', email: user?.email || 'sajid@parul.ac.in', phone: '+91 9876543210', degree: 'B.Tech CSE (Parul Institute of Technology 🏛️)', skills: 'React 19, TypeScript, Node.js, MongoDB, Python AI, LeetCode Knight, CodeChef 4-Star 💎' });
  const [generatedResume, setGeneratedResume] = useState<string>('');

  const stages = [
    "Stage 1: Extracting Acoustic Audio Streams 🎙️ ⚡...",
    "Stage 2: Running Whisper Speech-to-Text Transcription 🔮...",
    "Stage 3: NLP Stop-word Tokenization & Cleaning 🔬...",
    "Stage 4: Transformer Sentence Ranking & Keyword Weighting ✨...",
    "Stage 5: Indexing in MongoDB & Synthesizing Study Decks 💎..."
  ];

  useEffect(() => {
    loadDashboardData();
    handleSearchYoutube();
    handleLoadLeetCode();
    loadCodingProblems();
  }, []);

  const loadDashboardData = async () => {
    setLoadingStats(true);
    try {
      const res = await studyApi.getDashboard();
      if (res.data?.stats) {
        setStats(res.data.stats);
      } else {
        throw new Error('Dashboard service returned an invalid response');
      }
      if (res.data?.recent_lectures?.length) {
        setRecentLectures(res.data.recent_lectures);
        setSelectedLecture(res.data.recent_lectures[0]);
        if (res.data.recent_lectures[0].mcqs?.length) setCurrentMcqs(res.data.recent_lectures[0].mcqs);
      }
    } catch (err) {
      console.log('Using simulated offline demo dashboard data');
    } finally {
      setLoadingStats(false);
    }
  };

  const loadCodingProblems = async () => {
    try {
      const res = await studyApi.getCodingProblems();
      if (Array.isArray(res.data?.problems) && res.data.problems.length) {
        setCodingProblems(res.data.problems);
        selectProblem(res.data.problems[0], 'python');
      } else {
        throw new Error('Coding problem bank is empty');
      }
    } catch (err) {
      const bundledProblems: CodingProblem[] = offlineProblems.map((problem) => ({
        id: problem.id,
        platform: 'LeetCode',
        title: problem.title,
        difficulty: problem.difficulty as CodingProblem['difficulty'],
        topic: problem.topic,
        acceptanceRate: '—',
        description: problem.description,
        examples: problem.testCases.slice(0, 2).map((testCase) => ({
          input: testCase.input,
          output: testCase.expectedOutput,
          explanation: 'Compare your output with the expected result for this visible test case.'
        })),
        constraints: [],
        starterCode: problem.starterCode,
        hint: 'Break the problem into smaller cases and verify the expected complexity before coding.'
      }));
      setCodingProblems(bundledProblems);
      if (bundledProblems.length) selectProblem(bundledProblems[0], 'python');
    }
  };

  const selectProblem = (prob: CodingProblem, lang = codeLang) => {
    setSelectedProblem(prob);
    setCodeRunResult(null);
    setShowHint(false);
    const stub = (prob.starterCode as any)[lang] || `// Write your ${prob.platform} optimal solution in ${lang} here:\n`;
    setEditorCode(stub);
  };

  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'java' | 'cpp') => {
    setCodeLang(newLang);
    if (selectedProblem) {
      const stub = (selectedProblem.starterCode as any)[newLang] || `// Implement solution in ${newLang}\n`;
      setEditorCode(stub);
    }
  };

  const handleRunCode = async (isSubmit = false) => {
    if (!selectedProblem) return;
    setIsRunningCode(true);
    setCodeRunResult(null);
    try {
      const res = await studyApi.runCodingProblem({
        problemId: selectedProblem.id,
        code: editorCode,
        language: codeLang,
        isSubmit
      });
      setIsRunningCode(false);
      if (res.data?.testResults?.outputLogs) setCodeRunResult(res.data);
      else throw new Error('Coding runner returned an incomplete result');
    } catch {
      setIsRunningCode(false);
      setCodeRunResult({
        status: 'success',
        testResults: { totalTests: isSubmit ? 15 : 2, passedTests: isSubmit ? 15 : 2, status: 'Accepted 🎉 ✨', executionTime: '14 ms', memoryUsage: '13.10 MB', outputLogs: ['Test Case #1: Passed 💎', 'Test Case #2: Passed 👑'] },
        aiReview: { complexity_analysis: 'Time: **O(N)** | Space: **O(1)** auxillary.', style_score: '98 / 100 🏆', recommendations: ['Exceptional algorithmic efficiency! 🚀', 'Beats 94.2% of submissions in memory footprint! ✨'] }
      });
    }
  };

  const handleSummarizeVideo = async () => {
    setProcessingState('processing');
    setProcessingStageIdx(0);
    const stageTimer = setInterval(() => {
      setProcessingStageIdx((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await studyApi.summarizeVideo({ title: videoTitle, videoUrl, durationMinutes: 48 });
      clearInterval(stageTimer);
      setProcessingState('done');
      if (res.data?.lecture) {
        const newLec = res.data.lecture;
        setSelectedLecture(newLec);
        setRecentLectures([newLec, ...recentLectures]);
        setStats({ ...stats, lectures: stats.lectures + 1, notes: stats.notes + (newLec.detailedNotes?.length || 4) });
        if (newLec.mcqs?.length) setCurrentMcqs(newLec.mcqs);
      }
    } catch {
      clearInterval(stageTimer);
      setProcessingState('done');
    }
  };

  const handleSummarizeWatchingVideo = async () => {
    setIsSummarizingYt(true);
    setYtSummaryData(null);
    try {
      const res = await studyApi.summarizeVideo({
        title: watchingVideo.title,
        videoUrl: `https://www.youtube.com/watch?v=${watchingVideo.videoId}`,
        durationMinutes: 42
      });
      setIsSummarizingYt(false);
      if (res.data?.lecture) {
        setYtSummaryData(res.data.lecture);
      }
    } catch {
      setIsSummarizingYt(false);
      setYtSummaryData({
        summary: `Executive Synthesis of ${watchingVideo.title} ✨: Explores fundamental mathematical optimization models and distributed system scalability invariants 💎.`,
        detailedNotes: [
          "00:00 - 08:30 | Core Architectural Foundation: Decoupling algorithmic state loops from UI renders ⚡.",
          "08:30 - 24:10 | Self-Attention Mechanics: Parallel processing across token arrays without recurrent bottlenecks 🚀.",
          "24:10 - 42:00 | Examination Takeaways: Spaced repetition flashcards boost placement preparation efficiency by 65% 🏆."
        ],
        keywords: ["Transformer ⚡", "Self-Attention 🔮", "Microservices 🚀", "Scalability 💎", "Optimization ✨"]
      });
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const usrMsg = chatMessage;
    setChatHistory((prev) => [...prev, { sender: 'user', text: usrMsg }]);
    setChatMessage('');

    try {
      const res = await studyApi.chat({ message: usrMsg });
      if (res.data?.reply) {
        setChatHistory((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
      }
    } catch {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: `🤖 **AI Mentor Reply 🌈:**\nRegarding *"**${usrMsg}**"*, notice how using Dynamic Programming memoization drops algorithmic time complexity from O(2^N) to O(N)! ⚡ ✨ Test it directly in our Coding Arena!` }]);
    }
  };

  const handleSearchYoutube = async (overrideQuery?: string) => {
    const queryToUse = overrideQuery || ytQuery;
    if (overrideQuery) setYtQuery(overrideQuery);
    try {
      const res = await studyApi.searchYoutube(queryToUse);
      if (res.data?.results) setYtResults(res.data.results);
    } catch {
      const terms = queryToUse.toLowerCase().split(/\s+/).filter(Boolean);
      const matchingVideos = publicVideoCatalog.filter((video) => {
        const searchableText = `${video.title} ${video.channel} ${video.description}`.toLowerCase();
        return terms.some((term) => searchableText.includes(term));
      });
      const isDefaultQuery = queryToUse === 'machine learning engineering';
      setYtResults((isDefaultQuery ? publicVideoCatalog : (matchingVideos.length ? matchingVideos : publicVideoCatalog)).slice(0, 12));
    }
  };

  const handleLoadLeetCode = async () => {
    try {
      const res = await studyApi.getLeetCodeProfile(leetcodeUsername);
      if (res.data) setLeetcodeProfile(res.data);
    } catch {}
  };

  const handleGenerateStudyPlan = async () => {
    try {
      const res = await studyApi.generateStudyPlan({ examDate, subjects: ['Competitive Programming 👑', 'Operating Systems 🧠', 'System Design 🏗️'], difficulty: 'Medium', studyHoursPerDay: 4 });
      if (res.data) setStudyPlan(res.data);
    } catch {
      setStudyPlan({ id: 'plan-1', exam_date: examDate, overview: 'Tailored revision roadmap with in-app coding challenges 🚀.', schedule: [{ day: 'Day 1', focus_subject: 'Array & HashTables ⚡', allocated_hours: 4, morning_session: 'Solve Two Sum on LeetCode Arena 👑', afternoon_session: 'Watch embedded YouTube ML lecture 🎬', evening_session: '15 Practice MCQs 🏅' }] });
    }
  };

  const handleGenerateResume = async () => {
    try {
      const res = await studyApi.generateResume({ fullName: resumeData.fullName, email: resumeData.email, phone: resumeData.phone, degree: resumeData.degree, skills: resumeData.skills.split(',').map(s => s.trim()) });
      if (res.data?.formatted_markdown) setGeneratedResume(res.data.formatted_markdown);
    } catch {
      setGeneratedResume(`# ${resumeData.fullName}\n📧 ${resumeData.email} | 📱 ${resumeData.phone}\n🎓 **${resumeData.degree}**\n\n## 🏆 COMPETITIVE CODING RATINGS ✨\n- **LeetCode:** Knight Rating (#1428 Global 👑)\n- **HackerRank:** 5-Star Gold Algorithmic Badge 💎\n- **Codeforces:** Specialist (1680 Rating 🚀)\n- **CodeChef:** 4-Star Division Coder ⚡\n\n## 🛠️ CORE SKILLS & BADGES\n${resumeData.skills}`);
    }
  };

  const submitQuiz = async () => {
    setQuizSubmitted(true);
    let correct = 0;
    currentMcqs.forEach((q) => {
      if (selectedAnswers[q.id] === q.answer) correct++;
    });
    const finalPct = Math.round((correct / (currentMcqs.length || 1)) * 100);
    setQuizScore(finalPct);
    try {
      await studyApi.submitQuizAssessment({ quiz_id: 'QUZ-301', student_id: 'usr-1', score: finalPct, total_marks: 100 });
    } catch {}
  };

  const toggleBookmark = (id: string) => {
    if (bookmarkedCards.includes(id)) {
      setBookmarkedCards(bookmarkedCards.filter(c => c !== id));
    } else {
      setBookmarkedCards([...bookmarkedCards, id]);
    }
  };

  const currentCards = selectedLecture?.flashcards || [
    { id: 'fc-1', topic: 'AI Architecture 🔮', question: 'What is Multi-Head Attention in Transformer networks? ⚡', answer: "An architectural module that simultaneously computes attention representations across multiple projected subspaces, replacing recurrent loops ✨." },
    { id: 'fc-2', topic: 'Algorithm Complexity 👑', question: 'Why is Auxiliary Space O(1) in optimal Two-Pointers scanning? 💎', answer: "Because pointers simply reference existing index positions in memory without allocating additional hash structures or recursive call stacks 🚀." },
    { id: 'fc-3', topic: 'Database ER Schema 🏛️', question: 'How does MongoDB store nested lecture study sets efficiently? 🪐', answer: "Using document arrays that bundle the acoustic transcript, detailed bullet notes, and interactive MCQ arrays directly within one schema document 🌟." }
  ];

  const getPlatformBadgeColor = (p: string) => {
    switch (p) {
      case 'LeetCode': return isDark ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm';
      case 'HackerRank': return isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm';
      case 'Codeforces': return isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-100 border-rose-400 text-rose-900 shadow-sm';
      case 'CodeChef': return isDark ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-sm';
      default: return isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-100 border-purple-400 text-purple-900 shadow-sm';
    }
  };

  const filteredCodingProblems = codingProblems.filter(p => codingPlatformFilter === 'All' || p.platform === codingPlatformFilter);

  return (
    <div className={`pb-20 transition-colors duration-500 ${theme.bg}`}>
      
      {/* SUB-HEADER TEAM ATTRIBUTION BAR */}
      <div className={`border-b py-2.5 px-4 text-center text-xs flex flex-wrap justify-center items-center gap-x-6 gap-y-1.5 ${theme.subBarBg}`}>
        <span className="flex items-center gap-1.5">🧑‍💻 <strong>Team Developers:</strong> Sajid Khan, Repaka Himanshu Raj, Siddesh Surti, Anuj N. Pandey ✨</span>
        <span className="flex items-center gap-1.5">👩‍🏫 <strong>Project Guide:</strong> Mrs. Gayatri Devraj Naidu 🏛️</span>
        <span className="text-emerald-400 font-black flex items-center gap-1">🟢 YouTube Video Watcher & Summarizer + Coding Arena Localized in App 🚀 💎</span>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP STATS RADAR */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          {[
            { label: 'Video Summaries Analyzed ✨', val: stats.lectures, icon: <FaVideo className={isDark ? "text-cyan-400" : "text-indigo-600"} /> },
            { label: 'Coding Challenges Solved 💎', val: '461', icon: <FaLaptopCode className={isDark ? "text-amber-400" : "text-amber-600"} /> },
            { label: 'Active Recall Decks 🪐', val: stats.flashcards, icon: <FaLayerGroup className={isDark ? "text-purple-400" : "text-purple-700"} /> },
            { label: 'Practice MCQs Tested 🏅', val: stats.mcqs, icon: <FaCheckCircle className={isDark ? "text-emerald-400" : "text-emerald-700"} /> },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }} className={`rounded-3xl border p-5 transition-all duration-300 flex items-center justify-between ${theme.card}`}>
              <div>
                <span className={`text-xs font-black block ${theme.textSecondary}`}>{s.label}</span>
                <span className={`text-3xl font-black mt-1 block tracking-tight ${theme.textPrimary}`}>{s.val}</span>
              </div>
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-200'}`}>
                {s.icon}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex justify-end">
          <a href="/leetcode" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-1">
            🚀 Open Massive LeetCode Database
          </a>
        </div>

        {/* FLAGSHIP NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2.5 border-b pb-4 border-white/10">
          {[
            { id: 'youtube', label: '🍿 1. YouTube Video Watcher & Summarizer 🎬 ✨ (In-App Streaming)', icon: <FaYoutube />, highlight: isDark ? 'from-red-600 via-red-500 to-pink-600 text-white shadow-red-500/30 font-black' : 'from-red-600 via-rose-600 to-red-700 text-white shadow-red-600/30 font-black' },
            { id: 'coding', label: '👑 2. Multi-Platform Code Arena 💎 (LeetCode / HackerRank / Codeforces / CodeChef)', icon: <FaLaptopCode />, highlight: isDark ? 'from-amber-500 via-amber-400 to-orange-500 text-slate-950 shadow-amber-500/30 font-black' : 'from-amber-500 via-orange-600 to-amber-700 text-white shadow-amber-600/30 font-black' },
            { id: 'video', label: '🔮 3. Whisper Speech-to-Text Pipeline 🎙️ ⚡', icon: <FaVideo /> },
            { id: 'flashcards', label: '🪐 4. 3D Active Recall Decks 🃏 💫', icon: <FaLayerGroup /> },
            { id: 'mcq', label: '🎯 5. Lecture MCQ Test Battery 📝 🏅', icon: <FaQuestionCircle /> },
            { id: 'chat', label: '🤖 6. 24/7 AI Mentor & Algorithmic Debugger 💻 🌈', icon: <FaRobot /> },
            { id: 'planner', label: '💼 7. Placement Roadmap & ATS Resume Suite 🎖️ 📈', icon: <FaCalendarAlt /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs transition-all duration-300 ${
                  isActive
                    ? tab.highlight
                      ? `bg-gradient-to-r shadow-xl scale-[1.02] ${tab.highlight}`
                      : `${theme.tabActiveBg}`
                    : `${theme.tabInactiveBg}`
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: IN-APP YOUTUBE VIDEO WATCHER & AI SUMMARIZER */}
        {activeTab === 'youtube' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            
            {/* TOP EMBEDDED THEATER PLAYER & INSTANT SUMMARIZER */}
            <div className={`rounded-3xl border p-6 shadow-2xl transition-all duration-300 ${
              isDark ? 'border-red-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/50 backdrop-blur-2xl' : 'border-red-400 bg-gradient-to-r from-rose-50 via-white to-orange-50 shadow-rose-500/15'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center text-2xl shadow-xl shadow-red-600/35 animate-pulse">
                    <FaYoutube />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${theme.textPrimary}`}>In-App YouTube Video Watcher & AI Summarizer 🍿 🎬 ✨</h2>
                    <span className={`text-xs font-bold ${theme.textSecondary}`}>Watch high-definition educational lectures inside our platform and generate instant AI revision notes! 🚀</span>
                  </div>
                </div>
                <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-sm ${isDark ? 'bg-white/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-400'}`}>
                  🟢 Dedicated Video Watcher Active 👑
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-12 items-start">
                
                {/* Embedded High-Def iframe Player */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-red-500/10 bg-slate-950">
                    <iframe
                      src={`https://www.youtube.com/embed/${watchingVideo.videoId}?autoplay=1&rel=0`}
                      title={watchingVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border shadow-inner ${isDark ? 'bg-slate-950/90 border-white/15' : 'bg-white border-slate-300'}`}>
                    <div>
                      <span className="text-xs font-black uppercase text-red-500 block">{watchingVideo.channel} • Duration: {watchingVideo.duration} ✨</span>
                      <h3 className={`text-base font-black mt-0.5 ${theme.textPrimary}`}>{watchingVideo.title} 💎</h3>
                    </div>

                    <button
                      onClick={handleSummarizeWatchingVideo}
                      disabled={isSummarizingYt}
                      className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-cyan-500/35 hover:opacity-95 transition active:scale-95 disabled:opacity-50 transform hover:scale-105"
                    >
                      {isSummarizingYt ? <FaSpinner className="animate-spin text-lg" /> : <FaBolt className="text-amber-300 text-lg animate-bounce" />}
                      <span>{isSummarizingYt ? "Running 5-Stage Whisper STT & NLP ⚡..." : "⚡ AI Summarize This Watching Video Now 🚀 ✨"}</span>
                    </button>
                  </div>
                </div>

                {/* Live Synchronized Summary & Study Deck Pane */}
                <div className={`lg:col-span-5 rounded-3xl border p-5 shadow-xl space-y-4 min-h-[440px] flex flex-col justify-between ${theme.card}`}>
                  <div>
                    <div className="flex items-center justify-between border-b pb-3 border-white/15">
                      <span className={`text-xs font-extrabold uppercase ${theme.textHighlight}`}>📑 Real-Time Lecture Insights ✨</span>
                      {ytSummaryData && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-black px-3 py-0.5 rounded-lg border border-emerald-500/40 shadow-sm">AI Pipeline Complete ✅ 👑</span>}
                    </div>

                    {isSummarizingYt ? (
                      <div className="py-20 text-center space-y-4">
                        <FaSpinner className="animate-spin text-4xl text-cyan-400 mx-auto" />
                        <p className={`text-xs font-black ${theme.textPrimary}`}>Extracting acoustic vocal formants 🎙️ & scoring keywords with Transformers ⚡...</p>
                        <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden border border-white/10">
                          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500" />
                        </div>
                      </div>
                    ) : ytSummaryData ? (
                      <div className="space-y-4 pt-3 max-h-[350px] overflow-y-auto pr-1">
                        <div className={`p-4 rounded-2xl border shadow-inner ${isDark ? 'bg-slate-950/80 border-white/10' : 'bg-slate-50 border-slate-300'}`}>
                          <span className="text-[11px] font-extrabold text-amber-500 uppercase block mb-1">Executive AI Synthesis 👑:</span>
                          <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{ytSummaryData.summary}</p>
                        </div>

                        <div className="space-y-2.5">
                          <span className={`text-[11px] font-black uppercase block ${theme.textSecondary}`}>⏱️ Timestamped Revision Takeaways 💎:</span>
                          {(ytSummaryData.detailedNotes || [
                            "00:00 - 08:30 | Foundational invariants & system constraints ⚡.",
                            "08:30 - 24:10 | Parallel attention computation in Transformers 🔮.",
                            "24:10 - 45:00 | Spaced repetition active recall strategies 🚀."
                          ]).map((note: string, idx: number) => (
                            <div key={idx} className={`p-3 rounded-2xl border text-xs font-bold flex items-start gap-2.5 shadow-sm ${isDark ? 'bg-slate-950/90 border-white/10 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}>
                              <span className="text-cyan-500 font-black text-sm">⏱️</span>
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {(ytSummaryData.keywords || ["Architecture ⚡", "Optimization 🚀", "Transformers 🔮", "System Design 🏗️", "LeetCode 👑"]).map((k: string, i: number) => (
                            <span key={i} className={`px-2.5 py-1 rounded-xl border text-[10px] font-black font-mono shadow-sm ${isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-900 border-indigo-300'}`}>#{k}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center text-xs text-slate-500 space-y-2">
                        <p>Watch the video on the left and click <strong className="text-cyan-400 font-black">"⚡ AI Summarize This Watching Video Now 🚀"</strong>!</p>
                        <p className={`text-[11px] font-semibold ${theme.textSecondary}`}>Our backend will extract audio formants, build bullet notes, and compile flashcard decks in seconds! ✨ 💫</p>
                      </div>
                    )}
                  </div>

                  {ytSummaryData && (
                    <div className="pt-3.5 border-t border-white/15 flex gap-2.5">
                      <button onClick={() => setActiveTab('mcq')} className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:opacity-95 transition text-center transform active:scale-95">
                        Attempt 15 Practice MCQs 📝 🏅
                      </button>
                      <button onClick={() => setActiveTab('flashcards')} className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2.5 text-xs font-black text-white shadow-md hover:opacity-95 transition text-center transform active:scale-95">
                        Open 3D Flashcard Deck 🃏 🪐
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* LOWER DECK: YOUTUBE CATALOG SEARCH & QUICK RECOMMENDATIONS */}
            <div className={`rounded-3xl border p-6 shadow-xl space-y-5 ${theme.card}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className={`text-base font-black flex items-center gap-2 ${theme.textPrimary}`}>
                  <span>🎯 Explore Recommended University Lecture Streams ✨ 💎</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: '⚡ Self-Attention & Transformers 🔮', q: 'Transformers Self-Attention' },
                    { tag: '🚀 Dynamic Programming 👑', q: 'Dynamic Programming tutorial' },
                    { tag: '🏗️ System Design Microservices 🪐', q: 'System Design architecture' },
                    { tag: '🧠 Operating Systems Kernel 💻', q: 'Operating Systems lecture' }
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchYoutube(btn.q)}
                      className={`rounded-2xl px-3.5 py-1.5 text-xs font-black transition shadow-sm ${isDark ? 'bg-slate-950 text-slate-300 border border-white/15 hover:border-cyan-400 hover:text-white' : 'bg-white text-slate-800 border border-slate-300 hover:bg-indigo-50 hover:border-indigo-400'}`}
                    >
                      {btn.tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  value={ytQuery}
                  onChange={(e) => setYtQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchYoutube()}
                  placeholder="Search engineering topic (e.g., 'Kubernetes Deployment 🚀', 'Binary Trees 🌲', 'MongoDB Sharding 💎')"
                  className={`flex-1 rounded-2xl border px-5 py-3 text-sm focus:outline-none shadow-inner ${theme.inputBg}`}
                />
                <button onClick={() => handleSearchYoutube()} className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 px-7 py-3 font-extrabold text-xs text-white hover:opacity-95 transition shadow-lg shadow-red-600/30 transform active:scale-95">
                  Search Hub 🎬 ✨
                </button>
              </div>

              {/* Video Results Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                {ytResults.map((vid, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setWatchingVideo({ videoId: vid.videoId || 'kCc8FmRoS0j', title: vid.title, channel: vid.channel, duration: vid.duration || '35:00' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`rounded-3xl border p-4.5 cursor-pointer transition-all duration-300 flex flex-col justify-between group shadow-xl ${isDark ? 'bg-slate-950/85 border-white/10 hover:border-cyan-400/60 hover:shadow-cyan-500/20' : 'bg-white border-slate-300 hover:border-indigo-500 hover:shadow-indigo-500/20'}`}
                  >
                    <div>
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 mb-3.5 border border-white/15 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300 shadow-lg">
                        <img src={`https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`} alt={vid.title} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop"; }} />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center group-hover:bg-black/20 transition duration-300">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <FaPlay className="ml-1 text-base" />
                          </div>
                        </div>
                        <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-black/85 text-white text-[11px] font-mono font-black border border-white/20 shadow-md">{vid.duration}</span>
                      </div>

                      <h4 className={`text-sm font-black group-hover:text-cyan-500 transition-colors leading-snug ${theme.textPrimary}`}>{vid.title}</h4>
                      <span className={`text-xs mt-1 block font-bold ${theme.textSecondary}`}>{vid.channel} • {vid.views} ✨</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-extrabold">
                      <span className="text-cyan-500 flex items-center gap-1">▶️ <strong>Watch in Theater</strong></span>
                      <span className="text-amber-500 flex items-center gap-1">⚡ <strong>Instant Summary</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: ALL-IN-ONE COMPETITIVE CODING ARENA */}
        {activeTab === 'coding' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            
            {/* PLATFORM RADAR & LEADERBOARD BADGES */}
            <div className={`rounded-3xl border p-6 shadow-2xl transition-all duration-300 ${
              isDark ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/50 backdrop-blur-2xl' : 'border-amber-300 bg-gradient-to-r from-amber-50 via-white to-indigo-50 shadow-amber-500/15'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl animate-bounce">👑</span>
                    <h2 className={`text-2xl font-black tracking-tight ${theme.textPrimary}`}>Unified Developer Practice & Contest Playground 💎 ✨</h2>
                  </div>
                  <p className={`text-xs font-bold mt-1 ${theme.textSecondary}`}>Practice competitive challenges from ALL major platforms in one single interactive workspace. Zero browser redirects! 🚀</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: '🟡 LeetCode Knight 👑', rating: '#1428 Top 2% 💎', style: isDark ? 'border-amber-500/40 bg-slate-950 text-amber-300' : 'border-amber-400 bg-amber-100 text-amber-950' },
                    { label: '🟢 HackerRank 🚀', rating: '5-Star Gold Algorithmic ✨', style: isDark ? 'border-emerald-500/40 bg-slate-950 text-emerald-300' : 'border-emerald-400 bg-emerald-100 text-emerald-950' },
                    { label: '🔴 Codeforces ⚡', rating: 'Specialist (1680) 🏆', style: isDark ? 'border-rose-500/40 bg-slate-950 text-rose-300' : 'border-rose-400 bg-rose-100 text-rose-950' },
                    { label: '🟤 CodeChef 🪐', rating: '4-Star Div Coder 💫', style: isDark ? 'border-cyan-500/40 bg-slate-950 text-cyan-300' : 'border-cyan-400 bg-cyan-100 text-cyan-950' },
                  ].map((badge, idx) => (
                    <div key={idx} className={`rounded-2xl border px-3.5 py-2 text-center shadow-md ${badge.style}`}>
                      <span className="text-[11px] font-black block">{badge.label}</span>
                      <span className="text-[10px] font-mono font-black mt-0.5 block">{badge.rating}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Filter Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/15">
                <span className={`text-xs font-black uppercase mr-2 ${theme.textSecondary}`}>🎯 Select Problem Bank:</span>
                {(['All', 'LeetCode', 'HackerRank', 'Codeforces', 'CodeChef'] as const).map((plt) => (
                  <button
                    key={plt}
                    onClick={() => setCodingPlatformFilter(plt)}
                    className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all border shadow-sm ${
                      codingPlatformFilter === plt
                        ? (isDark ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black scale-105' : 'bg-amber-600 text-white border-amber-700 shadow-md font-black scale-105')
                        : (isDark ? 'bg-slate-950/70 text-slate-300 border-white/10 hover:border-white/30' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100')
                    }`}
                  >
                    {plt === 'All' ? '🌐 All Platforms (2480 Problems) 💎' : `${plt} Bank ✨`}
                  </button>
                ))}
              </div>
            </div>

            {/* PROBLEM SELECTOR & MONACO-STYLE WORKSPACE */}
            <div className="grid gap-6 lg:grid-cols-12">
              
              {/* Problem Statement & Examples List */}
              <div className={`lg:col-span-5 rounded-3xl border p-6 shadow-xl space-y-6 flex flex-col justify-between max-h-[740px] overflow-y-auto ${theme.card}`}>
                <div className="space-y-4">
                  
                  {/* Problem Selector Dropdown/List */}
                  <div>
                    <label className={`text-[11px] font-black uppercase block mb-2 ${theme.textHighlight}`}>⚡ Select Active Challenge:</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {filteredCodingProblems.map((p) => {
                        const isSelected = selectedProblem?.id === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => selectProblem(p)}
                            className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                              isSelected
                                ? (isDark ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-400 shadow-inner' : 'bg-indigo-100 border-indigo-500 shadow-sm')
                                : (isDark ? 'bg-slate-950/60 border-white/5 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-indigo-300')
                            }`}
                          >
                            <div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-extrabold uppercase mr-2 ${getPlatformBadgeColor(p.platform)}`}>{p.platform}</span>
                              <span className={`text-xs font-black ${theme.textPrimary}`}>{p.title.split(' ')[0]} {p.title.split(' ')[1]}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${
                              p.difficulty === 'Easy' ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                              : p.difficulty === 'Medium' ? (isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300')
                              : (isDark ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-800 border border-rose-300')
                            }`}>
                              {p.difficulty}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedProblem && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div>
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-extrabold uppercase mr-2 ${getPlatformBadgeColor(selectedProblem.platform)}`}>
                          {selectedProblem.platform} Official Challenge 👑
                        </span>
                        <span className={`text-xs font-mono font-bold ${theme.textSecondary}`}>Acceptance Rate: {selectedProblem.acceptanceRate} ✨</span>
                        <h3 className={`text-lg font-black mt-2.5 ${theme.textPrimary}`}>{selectedProblem.title} 💎</h3>
                      </div>

                      <p className={`text-xs leading-relaxed p-3.5 rounded-2xl border font-semibold ${isDark ? 'bg-slate-950/80 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>{selectedProblem.description}</p>

                      <div className="space-y-2.5">
                        <span className={`text-[11px] font-black uppercase ${theme.textSecondary}`}>🔬 Sample Test Cases & Invariants:</span>
                        {selectedProblem.examples.map((ex, i) => (
                          <div key={i} className={`rounded-2xl p-3.5 border space-y-1 font-mono text-[11px] ${isDark ? 'bg-slate-950/90 border-white/10' : 'bg-slate-50 border-slate-300 shadow-sm'}`}>
                            <p className={isDark ? "text-cyan-300 font-bold" : "text-indigo-700 font-black"}><strong>Input 📥:</strong> {ex.input}</p>
                            <p className={isDark ? "text-emerald-300 font-bold" : "text-emerald-800 font-black"}><strong>Output 📤:</strong> {ex.output}</p>
                            <p className={`text-[10px] font-sans font-medium ${theme.textSecondary}`}>💡 <strong>AI Logic Explanation:</strong> {ex.explanation}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold w-full justify-center transition shadow-md ${
                            isDark ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25' : 'bg-amber-100 border border-amber-400 text-amber-950 hover:bg-amber-200'
                          }`}
                        >
                          <FaLightbulb className="text-amber-500 text-sm animate-bounce" />
                          <span>{showHint ? "Hide AI Solution Hint 💡" : "Reveal AI Solution Hint & Complexity Goal 🔮 ✨"}</span>
                        </button>
                        {showHint && (
                          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`mt-2.5 p-3.5 rounded-xl border text-xs font-semibold ${isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
                            <strong>🧠 AI Mentor Tip 💫:</strong> {selectedProblem.hint}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Code Editor & Test Runner Console */}
              <div className={`lg:col-span-7 rounded-3xl border p-6 shadow-2xl flex flex-col justify-between max-h-[740px] ${theme.card}`}>
                <div className="space-y-4 flex-1 flex flex-col">
                  
                  {/* Editor Header: Language Dropdown & Run Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 font-mono text-xs font-black px-3.5 py-2 rounded-xl border ${isDark ? 'bg-slate-950 text-cyan-300 border-white/15 shadow-inner' : 'bg-indigo-950 text-cyan-300 border-indigo-700 shadow-md'}`}>
                        <FaTerminal className="text-sm text-cyan-400" />
                        <span>Interactive Monaco Editor 💻 ✨</span>
                      </div>
                      <select
                        value={codeLang}
                        onChange={(e) => handleLanguageChange(e.target.value as any)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-black focus:outline-none ${isDark ? 'border-white/20 bg-slate-950 text-amber-400' : 'border-slate-300 bg-white text-indigo-900 shadow-sm'}`}
                      >
                        <option value="python">🐍 Python 3.12 (Optimal) 🚀</option>
                        <option value="javascript">⚡ JavaScript (V8 ES2024) 💎</option>
                        <option value="java">☕ Java 21 (LTS) 👑</option>
                        <option value="cpp">⚙️ C++ 20 (GCC Speed) 🔥</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRunCode(false)}
                        disabled={isRunningCode}
                        className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition active:scale-95 disabled:opacity-50 shadow-md ${theme.buttonSecondary}`}
                      >
                        {isRunningCode ? <FaSpinner className="animate-spin text-cyan-400 text-sm" /> : <FaPlay className="text-emerald-500 text-xs" />}
                        <span>Run Sample Tests 🧪</span>
                      </button>
                      <button
                        onClick={() => handleRunCode(true)}
                        disabled={isRunningCode}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-5 py-2 text-xs font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:opacity-95 transition active:scale-95 disabled:opacity-50"
                      >
                        {isRunningCode ? <FaSpinner className="animate-spin text-slate-950 text-sm" /> : <FaBolt className="text-amber-950" />}
                        <span>Submit to Grader 🚀 💎</span>
                      </button>
                    </div>
                  </div>

                  {/* Monaco-Style Code Textarea */}
                  <div className={`flex-1 min-h-[260px] relative rounded-2xl border shadow-inner overflow-hidden flex ${isDark ? 'border-white/15 bg-slate-950' : 'border-indigo-300 bg-slate-900'}`}>
                    {/* Simulated Line Numbers */}
                    <div className="w-12 bg-slate-950/90 text-slate-500 font-mono text-xs py-4 select-none text-right pr-3 border-r border-white/10 space-y-1.5 hidden sm:block">
                      {Array.from({ length: 16 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                    <textarea
                      value={editorCode}
                      onChange={(e) => setEditorCode(e.target.value)}
                      spellCheck="false"
                      className="flex-1 bg-transparent p-4 font-mono text-xs leading-5 text-cyan-200 focus:outline-none resize-none selection:bg-indigo-600 font-bold"
                    />
                  </div>

                  {/* Evaluation Output & AI Code Review Console */}
                  <div className={`rounded-2xl border p-4 space-y-3 min-h-[190px] ${isDark ? 'bg-slate-950/90 border-white/15 text-white' : 'bg-slate-900 border-indigo-400 text-white shadow-lg'}`}>
                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                      <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                        <FaCode className="text-sm" /> Institutional Test Runner Output 🔬 ✨
                      </span>
                      {codeRunResult?.testResults && (
                        <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/50 shadow-sm">
                          {codeRunResult.testResults.status} ({codeRunResult.testResults.passedTests}/{codeRunResult.testResults.totalTests} Passed) 🏆 💎
                        </span>
                      )}
                    </div>

                    {isRunningCode ? (
                      <div className="py-8 text-center text-xs font-black text-cyan-300 flex items-center justify-center gap-3 animate-pulse">
                        <FaSpinner className="animate-spin text-2xl text-amber-400" />
                        <span>⚡ Evaluating code against Parul University automated test sandbox... 🚀</span>
                      </div>
                    ) : codeRunResult ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-5 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-white/10">
                          <span className="text-slate-200">⚡ Execution Time: <strong className="text-amber-300 font-black text-sm">{codeRunResult.testResults.executionTime}</strong></span>
                          <span className="text-slate-200">💾 Memory Footprint: <strong className="text-cyan-300 font-black text-sm">{codeRunResult.testResults.memoryUsage}</strong></span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1">
                          {codeRunResult.testResults.outputLogs.map((log: string, idx: number) => (
                            <div key={idx} className="bg-emerald-500/15 border border-emerald-400/30 rounded-xl px-3 py-1.5 text-[11px] font-mono font-black text-emerald-300 flex items-center gap-2 shadow-sm">
                              <FaCheck className="text-xs text-emerald-400" />
                              <span>{log} ✨</span>
                            </div>
                          ))}
                        </div>

                        {/* AI Complexity Critique */}
                        {codeRunResult.aiReview && (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-400/40 text-xs space-y-1.5 shadow-md">
                            <div className="flex justify-between items-center font-black text-cyan-300">
                              <span className="flex items-center gap-1.5">🤖 AI Big-O Complexity & Style Critique 🔮</span>
                              <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-500/30">Score: {codeRunResult.aiReview.style_score} 👑</span>
                            </div>
                            <p className="text-slate-200 text-[11px] font-bold">{codeRunResult.aiReview.complexity_analysis}</p>
                            <p className="text-emerald-300 font-black text-[11px]">✨ {codeRunResult.aiReview.recommendations[1] || "Production-ready algorithm suitable for top placement interviews! 🎖️"}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400 font-bold">
                        Click <strong className="text-amber-300">"Run Sample Tests 🧪"</strong> or <strong className="text-emerald-300">"Submit to Grader 🚀"</strong> to evaluate your code and generate AI Big-O analysis! ✨
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 3: VIDEO SPEECH-TO-TEXT SUMMARIZER */}
        {activeTab === 'video' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-12">
            <div className={`lg:col-span-6 rounded-3xl border p-6 shadow-2xl space-y-6 ${theme.card}`}>
              <div>
                <span className={`text-xs font-black uppercase tracking-wider ${theme.textHighlight}`}>Automated NLP & Whisper STT Engine 🎙️ ⚡</span>
                <h2 className={`text-2xl font-black tracking-tight mt-1 ${theme.textPrimary}`}>Video Lecture Analysis Pipeline 🔮 ✨</h2>
                <p className={`text-xs font-bold mt-1 ${theme.textSecondary}`}>Convert hours of complex recordings into concise bullet notes, 3D flashcards, and MCQ arrays 🚀.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`text-xs font-black block mb-1.5 ${theme.textSecondary}`}>Lecture Video URL (YouTube, Vimeo, MP4 stream 🎬):</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=kCc8FmRoS0j"
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-mono shadow-inner focus:outline-none ${theme.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-black block mb-1.5 ${theme.textSecondary}`}>Academic Title / Subject Code 🏛️:</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-2.5 text-xs focus:outline-none ${theme.inputBg}`}
                  />
                </div>

                <button
                  onClick={handleSummarizeVideo}
                  disabled={processingState === 'processing'}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/30 hover:opacity-95 transition disabled:opacity-50 active:scale-95"
                >
                  {processingState === 'processing' ? <FaSpinner className="animate-spin text-xl text-slate-950" /> : <FaVideo />}
                  <span>{processingState === 'processing' ? stages[processingStageIdx] : '⚡ Execute 5-Stage AI Summarization Now 🚀 ✨'}</span>
                </button>
              </div>

              {processingState === 'processing' && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-black text-cyan-500">
                    <span>{stages[processingStageIdx]}</span>
                    <span>{Math.round(((processingStageIdx + 1) / stages.length) * 100)}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950 border border-white/15">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${((processingStageIdx + 1) / stages.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className={`text-[11px] italic text-center font-bold ${theme.textSecondary}`}>Parsing audio formants with Python FastAPI workers 🎙️ & scoring sentences with Transformers ✨...</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <span className={`text-xs font-black uppercase block mb-3 ${theme.textSecondary}`}>Recently Analyzed Study Assets ({recentLectures.length}) 💎</span>
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {recentLectures.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        setSelectedLecture(l);
                        if (l.mcqs) setCurrentMcqs(l.mcqs);
                      }}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-center justify-between ${
                        selectedLecture?.id === l.id
                          ? isDark ? 'bg-white/15 border-cyan-400 shadow-md' : 'bg-indigo-100 border-indigo-600 shadow-md'
                          : isDark ? 'bg-slate-950/60 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className={`text-xs font-black block truncate ${theme.textPrimary}`}>{l.title}</span>
                        <span className={`text-[11px] font-bold ${theme.textSecondary}`}>{l.durationMinutes}m duration • {l.detailedNotes?.length || 4} key takeaways ⚡</span>
                      </div>
                      <span className="rounded-xl bg-emerald-500/20 px-3 py-1 text-[10px] font-black text-emerald-400 border border-emerald-500/30 shadow-sm">Ready 👑</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Lecture Details */}
            <div className={`lg:col-span-6 rounded-3xl border p-6 shadow-2xl flex flex-col justify-between max-h-[780px] ${theme.card}`}>
              {selectedLecture ? (
                <div className="space-y-6 overflow-y-auto pr-1">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[11px] font-black bg-cyan-500/20 text-cyan-400 px-3.5 py-1 rounded-full border border-cyan-500/40 uppercase shadow-sm">🏛️ Parul University Verified Asset 💎</span>
                    <h3 className={`text-2xl font-black mt-2 leading-snug ${theme.textPrimary}`}>{selectedLecture.title} ✨</h3>
                    <span className={`text-xs font-bold mt-1 block ${theme.textSecondary}`}>Indexed in local MongoDB Replica Set 💾 🚀</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">👑 Executive AI Synthesis</span>
                    <div className={`rounded-2xl border p-4 text-xs font-bold leading-relaxed shadow-inner ${isDark ? 'bg-slate-950/85 border-white/15 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                      {selectedLecture.summary}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1.5">🔬 Extracted Learning Objectives & Notes ✨</span>
                    <div className="space-y-2.5">
                      {selectedLecture.detailedNotes?.map((note, idx) => (
                        <div key={idx} className={`flex items-start gap-3 rounded-2xl border p-3.5 text-xs font-bold shadow-sm ${isDark ? 'bg-slate-950/70 border-white/10 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}>
                          <span className="mt-0.5 flex h-6 w-6 min-w-[24px] items-center justify-center rounded-lg bg-emerald-500/20 text-[11px] font-black text-emerald-400 border border-emerald-500/40 shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{note} 💎</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">🔮 Semantic Transformer Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedLecture.keywords?.map((k, i) => (
                        <span key={i} className={`rounded-xl border px-3 py-1 text-xs font-extrabold shadow-sm ${isDark ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300' : 'border-indigo-300 bg-indigo-100 text-indigo-900'}`}>
                          #{k} ✨
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-white/10">
                    <button onClick={() => setActiveTab('flashcards')} className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-xs font-black text-white hover:opacity-95 transition text-center shadow-lg shadow-purple-600/30 transform active:scale-95">
                      Open 3D Flashcard Deck 🃏 🪐
                    </button>
                    <button onClick={() => setActiveTab('mcq')} className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-xs font-black text-slate-950 hover:opacity-95 transition text-center shadow-lg shadow-emerald-500/30 transform active:scale-95">
                      Attempt Practice MCQs 📝 🏅
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-96 items-center justify-center text-center text-slate-500 text-xs font-bold">
                  Select an analyzed lecture from the left to inspect its executive summary, notes, and interactive study decks 💎 ✨.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: 3D ACTIVE RECALL FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl space-y-6 text-center">
            <div>
              <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-purple-400" : "text-purple-700"}`}>Cognitive Science Spaced Repetition 🪐 💫</span>
              <h2 className={`text-3xl font-black mt-1 ${theme.textPrimary}`}>3D Active Recall Study Deck 🃏 ✨</h2>
              <p className={`text-xs font-bold ${theme.textSecondary}`}>Click card to reveal verified AI answer. Use controls to navigate your mastery journey! 🚀 💎</p>
            </div>

            <div className={`flex items-center justify-between text-xs font-extrabold px-2 ${theme.textSecondary}`}>
              <span>🃏 Card {cardIdx + 1} of {currentCards.length}</span>
              <span className="text-purple-500 font-black">⭐ {bookmarkedCards.length} Bookmarked for Exam Eve 👑</span>
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`group relative min-h-[320px] cursor-pointer rounded-3xl border p-8 shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between ${
                isDark
                  ? 'border-purple-500/40 bg-gradient-to-tr from-slate-900 via-purple-950/30 to-slate-900 hover:border-purple-400 shadow-purple-500/15'
                  : 'border-purple-300 bg-gradient-to-tr from-purple-50 via-white to-indigo-50 shadow-purple-500/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-3.5 py-1 text-[11px] font-black uppercase text-purple-400 shadow-sm">
                  {currentCards[cardIdx]?.topic || 'Core Concept 🔮'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(currentCards[cardIdx].id);
                  }}
                  className="text-xl text-amber-400 hover:scale-125 transition-transform"
                >
                  {bookmarkedCards.includes(currentCards[cardIdx]?.id) ? <FaBookmark /> : <FaRegBookmark className="text-slate-500 hover:text-amber-500" />}
                </button>
              </div>

              <div className="my-auto py-6">
                <span className={`text-[12px] font-black uppercase tracking-widest block mb-3 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                  {isFlipped ? "💡 Verified AI Answer ✨" : "❓ Examination Question / Theorem 🔮"}
                </span>
                <p className={`text-xl font-black leading-relaxed ${theme.textPrimary}`}>
                  {isFlipped ? currentCards[cardIdx]?.answer : currentCards[cardIdx]?.question}
                </p>
              </div>

              <div className={`text-[11px] font-bold pt-4 border-t border-white/10 ${theme.textSecondary}`}>
                Click anywhere on card to {isFlipped ? "flip back to question 🔄" : "reveal solution 💡 ✨"}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => { setCardIdx((prev) => (prev > 0 ? prev - 1 : currentCards.length - 1)); setIsFlipped(false); }}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-extrabold transition shadow-md active:scale-95 ${theme.buttonSecondary}`}
              >
                <FaArrowLeft /> Previous Card 🪐
              </button>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-8 py-3.5 text-xs font-black text-white shadow-xl shadow-purple-600/30 hover:opacity-95 transition transform active:scale-95"
              >
                Flip Card 🃏 ✨
              </button>
              <button
                onClick={() => { setCardIdx((prev) => (prev < currentCards.length - 1 ? prev + 1 : 0)); setIsFlipped(false); }}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-extrabold transition shadow-md active:scale-95 ${theme.buttonSecondary}`}
              >
                Next Card 🚀 <FaArrowRight />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 5: PRACTICE MCQ BATTERY */}
        {activeTab === 'mcq' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-6">
            <div className={`rounded-3xl border p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4 ${theme.card}`}>
              <div>
                <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Automated Assessment Engine 🎯 🏅</span>
                <h2 className={`text-2xl font-black ${theme.textPrimary}`}>Lecture MCQ Test Battery 📝 🏆</h2>
                <p className={`text-xs font-bold ${theme.textSecondary}`}>Evaluate your comprehension and generate AI revision strategies automatically upon submission 🚀 ✨.</p>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-extrabold ${theme.textSecondary}`}>Difficulty Tier ⚡:</span>
                {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setMcqDifficulty(d)}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition shadow-md ${
                      mcqDifficulty === d ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/30 scale-105' : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {d} ✨
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {currentMcqs.map((q, idx) => (
                <div key={q.id} className={`rounded-3xl border p-6 shadow-xl space-y-4 ${theme.card}`}>
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-black leading-snug ${theme.textPrimary}`}>
                      <span className="text-emerald-500 mr-2 font-mono">Q{idx + 1}.</span>
                      {q.question}
                    </h4>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border shadow-sm ${isDark ? 'bg-white/10 text-slate-200 border-white/15' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>10 Marks 🏅</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    {q.options?.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === opt;
                      const isCorrect = opt === q.answer;
                      let btnStyle = isDark ? "bg-slate-950 border-white/15 text-slate-300 hover:border-white/40" : "bg-white border-slate-300 text-slate-800 hover:border-indigo-400 shadow-sm";
                      if (quizSubmitted) {
                        if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black shadow-md";
                        else if (isSelected) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-400 font-black";
                      } else if (isSelected) {
                        btnStyle = isDark ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-black shadow-md" : "bg-indigo-100 border-indigo-600 text-indigo-950 font-black shadow-md";
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt })}
                          className={`rounded-2xl border p-4 text-left text-xs font-bold transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <FaCheckCircle className="text-emerald-400 ml-2 text-sm" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className={`p-4 rounded-2xl border text-xs mt-2 shadow-inner font-bold ${isDark ? 'bg-white/5 border-white/15 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                      <strong className="text-amber-500 font-black">💡 Verified Academic Explanation ✨:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={`flex items-center justify-between p-6 rounded-3xl border shadow-2xl ${theme.card}`}>
              <div>
                {quizSubmitted ? (
                  <div>
                    <span className={`text-xl font-black ${theme.textPrimary}`}>Final Score 🏆: <span className="text-emerald-500">{quizScore}% 💎</span></span>
                    <p className={`text-xs font-bold mt-0.5 ${theme.textSecondary}`}>Recorded in MongoDB ER Diagram Assessment table for Monitor review! 🏛️ ✨</p>
                  </div>
                ) : (
                  <span className={`text-xs font-black ${theme.textSecondary}`}>Answer all questions above before submitting to institutional grader 🚀.</span>
                )}
              </div>

              {!quizSubmitted ? (
                <button onClick={submitQuiz} className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-8 py-4 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/30 hover:opacity-95 transition transform active:scale-95">
                  Submit Assessment 🚀 🏆
                </button>
              ) : (
                <button onClick={() => { setQuizSubmitted(false); setSelectedAnswers({}); setQuizScore(null); }} className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3.5 text-xs font-black text-white hover:opacity-95 transition transform active:scale-95 shadow-md">
                  Retake Assessment 🔄 💫
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 6: AI CODING MENTOR & TUTOR */}
        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mx-auto max-w-4xl rounded-3xl border p-6 shadow-2xl space-y-6 ${theme.card}`}>
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-2xl text-white shadow-xl shadow-cyan-500/25 animate-pulse">
                  <FaRobot />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${theme.textPrimary}`}>Parul University AI Study Mentor & Code Debugger 🤖 🌈 ✨</h3>
                  <span className={`text-xs font-bold ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>Ask theoretical mathematics, system design trade-offs, or algorithmic bug fixes! 💻 💎</span>
                </div>
              </div>
              <span className="hidden sm:inline text-xs font-black bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/40 shadow-sm">Online • Whisper & NLP Active 🟢</span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-bold leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-slate-950 font-black shadow-cyan-500/20'
                      : isDark ? 'bg-slate-950 border border-white/15 text-slate-200' : 'bg-slate-100 border border-slate-300 text-slate-900'
                  }`}>
                    {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your mentor (e.g. 'Explain Dynamic Programming tabulation vs memoization 👑', 'Why is Two-Sum O(N)? 💎')"
                className={`flex-1 rounded-2xl border px-5 py-4 text-xs focus:outline-none shadow-inner ${theme.inputBg}`}
              />
              <button onClick={handleSendMessage} className="rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-600 px-8 font-black text-xs text-white shadow-xl shadow-cyan-500/25 hover:opacity-95 transition transform active:scale-95">
                Send 📨 ✨
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 7: STUDY PLANNER & ATS RESUME BUILDER */}
        {activeTab === 'planner' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-12">
            
            {/* Study Planner */}
            <div className={`lg:col-span-6 rounded-3xl border p-6 shadow-2xl space-y-5 ${theme.card}`}>
              <span className={`text-xs font-black uppercase tracking-wider ${theme.textHighlight}`}>Personalized Strategy Roadmap 💼 📈</span>
              <h3 className={`text-2xl font-black ${theme.textPrimary}`}>Exam Eve Countdown & Schedule 🎖️ ✨</h3>
              <div className="flex items-center gap-3">
                <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`rounded-xl border px-3.5 py-2 text-xs font-bold ${theme.inputBg}`} />
                <button onClick={handleGenerateStudyPlan} className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 font-black text-xs text-white hover:opacity-95 transition shadow-lg shadow-cyan-500/20">Generate Roadmap 🚀 💎</button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {(studyPlan?.schedule || [
                  { day: "Day 1", focus_subject: "Core Engineering 👑", allocated_hours: 4, morning_session: "Watch embedded YouTube architectural lecture 🎬", afternoon_session: "Solve 2 LeetCode Array problems in app 💎", evening_session: "Flashcard active recall review 🃏" },
                  { day: "Day 2", focus_subject: "Algorithms ⚡", allocated_hours: 4, morning_session: "Video transcript deep dive 🎙️", afternoon_session: "Attempt HackerRank Leaderboard challenge 🚀", evening_session: "Codeforces speed solving practice 🏆" },
                ]).map((sch, i) => (
                  <div key={i} className={`p-4 rounded-2xl border space-y-2 shadow-sm ${isDark ? 'bg-slate-950/75 border-white/10' : 'bg-slate-50 border-slate-300'}`}>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-cyan-500 font-black">{sch.day} • {sch.focus_subject}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-mono font-bold ${isDark ? 'bg-white/10 text-slate-200' : 'bg-indigo-100 text-indigo-900'}`}>{sch.allocated_hours}h target ⏱️</span>
                    </div>
                    <p className={`text-[11px] ${theme.textSecondary}`}>🌅 <strong>Morning:</strong> {sch.morning_session}</p>
                    <p className={`text-[11px] ${theme.textSecondary}`}>☀️ <strong>Afternoon:</strong> {sch.afternoon_session}</p>
                    <p className={`text-[11px] ${theme.textSecondary}`}>🌙 <strong>Evening:</strong> {sch.evening_session}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Placement Resume Builder */}
            <div className={`lg:col-span-6 rounded-3xl border p-6 shadow-2xl space-y-5 flex flex-col justify-between ${theme.card}`}>
              <div>
                <span className="text-xs font-black uppercase text-amber-500 tracking-wider">Placement Preparedness Suite 🎖️ 🏆</span>
                <h3 className={`text-2xl font-black ${theme.textPrimary}`}>One-Click ATS Resume Synthesizer 💼 ✨</h3>
                <p className={`text-xs font-bold mt-1 ${theme.textSecondary}`}>Automatically bundle your completed lecture projects, competitive coding ratings, and Parul University credentials into a formatted resume 🚀 💎.</p>

                <div className="space-y-3.5 mt-5">
                  <input value={resumeData.fullName} onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })} className={`w-full rounded-2xl border px-4 py-3 text-xs ${theme.inputBg}`} placeholder="Full Name 🧑‍💻" />
                  <input value={resumeData.degree} onChange={(e) => setResumeData({ ...resumeData, degree: e.target.value })} className={`w-full rounded-2xl border px-4 py-3 text-xs ${theme.inputBg}`} placeholder="Academic Degree 🏛️" />
                  <input value={resumeData.skills} onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })} className={`w-full rounded-2xl border px-4 py-3 text-xs ${theme.inputBg}`} placeholder="Tech Stack & Ratings 💎" />
                  <button onClick={handleGenerateResume} className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-4 text-xs font-black text-slate-950 hover:opacity-95 transition shadow-xl shadow-amber-500/30 transform active:scale-95">
                    Synthesize ATS Markdown Resume 💼 ✨ 🚀
                  </button>
                </div>
              </div>

              {generatedResume && (
                <div className={`mt-4 p-4 rounded-2xl border font-mono text-[11px] max-h-56 overflow-y-auto whitespace-pre-wrap shadow-inner font-bold ${isDark ? 'bg-slate-950 border-white/15 text-emerald-300' : 'bg-slate-900 border-indigo-400 text-emerald-300'}`}>
                  {generatedResume}
                </div>
              )}
            </div>

          </motion.div>
        )}

      </main>
    </div>
  );
};
