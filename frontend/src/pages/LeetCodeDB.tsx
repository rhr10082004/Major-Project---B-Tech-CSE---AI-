import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import offlineProblems from '../data/leetcode_problems.json';

export const LeetCodeDB: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, [difficulty]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/leetcode/problems`, {
        params: { q: search, difficulty, limit: 100 }
      });
      setProblems(res.data.problems);
    } catch (err) {
      const normalizedSearch = search.toLowerCase();
      setProblems(offlineProblems
        .map((p) => ({
          problemId: Number(p.id.replace('lc-', '')),
          platform: p.platform || 'LeetCode',
          title: p.title,
          slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          difficulty: p.difficulty,
          topics: [p.topic],
          description: p.description,
          starterCode: p.starterCode,
          testCases: p.testCases,
          examples: p.testCases?.slice(0, 2).map((testCase) => ({
            input: testCase.input,
            output: testCase.expectedOutput
          }))
        }))
        .filter((problem) => !difficulty || problem.difficulty === difficulty)
        .filter((problem) => !normalizedSearch || problem.title.toLowerCase().includes(normalizedSearch)));
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto dark:text-white">
      <h1 className="text-3xl font-bold mb-8">LeetCode Problem Database</h1>
      
      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search problems..." 
          className="p-3 border rounded-lg flex-1 dark:bg-gray-800 dark:border-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchProblems()}
        />
        <select 
          className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <button 
          onClick={fetchProblems}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading problems...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Title</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Topics</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr 
                  key={p.problemId} 
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => navigate(`/workspace/${p.slug}`)}
                >
                  <td className="p-4">{p.problemId}</td>
                  <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{p.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                      {p.platform || 'LeetCode'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      p.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="p-4 flex flex-wrap gap-1">
                    {p.topics?.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded-full">{t}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {problems.length === 0 && (
            <div className="text-center py-10 text-gray-500">No problems found. Run the import script!</div>
          )}
        </div>
      )}
    </div>
  );
};
