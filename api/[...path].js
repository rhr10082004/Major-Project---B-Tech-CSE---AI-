const users = new Map([
  ['demo@student.com', { id: 'usr-demo', name: 'Demo Student', email: 'demo@student.com', role: 'STUDENT', streak: 12, password: 'password123' }]
]);

const userFromRequest = (req) => {
  const email = req.headers['x-demo-user'];
  return (email && users.get(email)) || users.get('demo@student.com');
};

export default async function handler(req, res) {
  const route = req.url.split('?')[0].replace(/^\/api\/?/, '');
  if (route === 'health') return res.status(200).json({ status: 'healthy', service: 'ai-study-strategist-vercel-api', db_mode: 'presentation memory' });

  if (route === 'auth/login' && req.method === 'POST') {
    const { email = 'demo@student.com', password = 'password123' } = req.body || {};
    const user = users.get(email);
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    return res.json({ token: `presentation-${user.id}`, user: { ...user, password: undefined } });
  }

  if (route === 'auth/signup' && req.method === 'POST') {
    const { name, email, password, role = 'STUDENT' } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    const user = { id: `usr-${Date.now()}`, name, email, role: role.toUpperCase(), streak: 0, password };
    users.set(email, user);
    return res.status(201).json({ token: `presentation-${user.id}`, user: { ...user, password: undefined } });
  }

  if (route === 'auth/me') {
    const user = userFromRequest(req);
    return res.json({ user: { ...user, password: undefined } });
  }

  if (route === 'dashboard') return res.json({ stats: { lectures: 6, notes: 38, flashcards: 45, mcqs: 135, streak: 12 }, recent_activity: [] });
  if (route === 'chat') return res.json({ response: 'This presentation mode is ready. Ask me about active recall, spaced repetition, or your study plan.' });
  if (route === 'document/summarize' || route === 'video/summarize') return res.json({ summary: 'Key concepts were extracted successfully for this presentation demo.', key_points: ['Core concepts identified', 'Important definitions organized', 'Revision guidance prepared'] });
  if (route === 'mcq/generate') return res.json({ questions: [{ question: 'Which technique improves long-term retention?', options: ['Active recall', 'Passive rereading', 'Skipping revision', 'Cramming'], answer: 'Active recall', explanation: 'Active recall strengthens retrieval pathways.' }] });
  if (route === 'flashcards/generate') return res.json({ flashcards: [{ front: 'What is active recall?', back: 'A method of retrieving information from memory without looking at notes.' }] });
  if (route === 'studyplan/generate') return res.json({ plan: [{ day: 'Day 1', tasks: ['Review core concepts', 'Complete a short quiz'] }] });
  if (route === 'resume/generate') return res.json({ resume: 'AI Study Strategist presentation resume draft.' });
  if (route === 'coding/problems') return res.json({ problems: [] });
  if (route === 'courses') return res.json([]);
  if (route === 'topics') return res.json([]);
  if (route === 'sessions') return res.json([]);
  if (route === 'resources') return res.json([]);

  return res.status(404).json({ error: 'API route not found', route });
}
