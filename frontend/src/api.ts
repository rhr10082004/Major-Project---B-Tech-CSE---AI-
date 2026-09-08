import axios from 'axios';

const configuredApiUrl = (import.meta as any).env?.VITE_API_URL || '';
const configuredAiUrl = (import.meta as any).env?.VITE_AI_URL || '';

// Keep the public Vercel deployment self-contained when an old external host is unavailable.
export const API_BASE_URL = configuredApiUrl.includes('onrender.com') ? '' : configuredApiUrl;
export const AI_BASE_URL = configuredAiUrl.includes('onrender.com') ? '' : configuredAiUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

if (!API_BASE_URL) {
  api.defaults.adapter = async (config) => {
    const url = config.url || '';
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const demoUser = { id: 'usr-demo', name: body.name || 'Demo Student', email: body.email || 'demo@student.com', role: body.role || 'STUDENT', streak: 12 };
    let data: unknown = {};
    if (url.includes('/auth/login') || url.includes('/auth/signup')) data = { token: 'presentation-demo-token', user: demoUser };
    else if (url.includes('/auth/me')) data = { user: demoUser };
    else if (url.includes('/dashboard')) data = { stats: { lectures: 6, notes: 38, flashcards: 45, mcqs: 135, streak: 12 }, recent_activity: [] };
    else if (url.includes('/coding/problems')) data = { problems: [] };
    else if (url.includes('/chat')) data = { response: 'Presentation mode is ready. Ask me about active recall or your study plan.' };
    else if (url.includes('/summarize')) data = { summary: 'Key concepts were extracted successfully for this presentation demo.', key_points: ['Core concepts identified', 'Important definitions organized'] };
    else if (url.includes('/mcq/generate')) data = { questions: [{ question: 'Which technique improves long-term retention?', options: ['Active recall', 'Passive rereading'], answer: 'Active recall' }] };
    else if (url.includes('/flashcards/generate')) data = { flashcards: [{ front: 'What is active recall?', back: 'Retrieving information from memory without looking at notes.' }] };
    else if (url.includes('/studyplan/generate')) data = { plan: [{ day: 'Day 1', tasks: ['Review core concepts', 'Complete a short quiz'] }] };
    else if (url.includes('/resume/generate')) data = { resume: 'AI Study Strategist presentation resume draft.' };
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: { email?: string; password?: string }) => api.post('/api/auth/login', credentials),
  signup: (data: { name: string; email: string; password: string; role: string }) => api.post('/api/auth/signup', data),
  me: () => api.get('/api/auth/me')
};

export const studyApi = {
  getDashboard: () => api.get('/api/dashboard'),
  summarizeVideo: (data: { title?: string; videoUrl?: string; durationMinutes?: number }) => api.post('/api/video/summarize', data),
  summarizeDocument: (data: { text: string; docType?: string; title?: string }) => api.post('/api/document/summarize', data),
  getLectures: () => api.get('/api/lectures'),
  getLectureById: (id: string) => api.get(`/api/lectures/${id}`),
  generateMcqs: (data: { text?: string; count?: number; difficulty?: string; topic?: string }) => api.post('/api/mcq/generate', data),
  generateFlashcards: (data: { text?: string; count?: number; topic?: string }) => api.post('/api/flashcards/generate', data),
  chat: (data: { message: string; language?: string; context?: string }) => api.post('/api/chat', data),
  generateStudyPlan: (data: { examDate?: string; subjects?: string[]; difficulty?: string; studyHoursPerDay?: number }) => api.post('/api/studyplan/generate', data),
  generateResume: (data: { fullName?: string; email?: string; phone?: string; degree?: string; skills?: string[] | string; projects?: Array<{ title: string; description: string }> }) => api.post('/api/resume/generate', data),
  searchYoutube: (query: string) => api.get('/api/youtube/search', { params: { q: query } }),
  getLeetCodeProfile: (username: string) => api.get('/api/leetcode/profile', { params: { username } }),
  getFacultyAnalytics: () => api.get('/api/faculty/analytics'),
  getAdminMetrics: () => api.get('/api/admin/metrics'),

  // Complete ER Diagram API methods (Figure 3.2 Report Alignment)
  getCourses: () => api.get('/api/courses'),
  getTopics: () => api.get('/api/topics'),
  getSessions: () => api.get('/api/sessions'),
  getResources: () => api.get('/api/resources'),
  submitQuizAssessment: (data: { quiz_id?: string; student_id?: string; score?: number; total_marks?: number; answers?: any }) => api.post('/api/quizzes/submit', data),
  getPerformanceRecords: (studentId = 'all') => api.get(`/api/performance/${studentId}`),
  getRecommendations: (studentId = 'all') => api.get(`/api/recommendations/${studentId}`),

  // All-in-One Unified Coding Arena (LeetCode + HackerRank + Codeforces + CodeChef)
  getCodingProblems: (params?: { platform?: string; difficulty?: string; topic?: string }) => api.get('/api/coding/problems', { params }),
  getCodingProblemById: (id: string) => api.get(`/api/coding/problems/${id}`),
  runCodingProblem: (data: { problemId: string; code: string; language: string; isSubmit?: boolean }) => api.post('/api/coding/run', data)
};
