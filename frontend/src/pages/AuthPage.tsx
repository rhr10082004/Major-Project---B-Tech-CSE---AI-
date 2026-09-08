import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaUserShield, FaLock, FaEnvelope, FaUser, FaArrowRight } from 'react-icons/fa';
import { authApi } from '../api';
import { Role, User } from '../types';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onAuthSuccess: (token: string, user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(mode === 'login' ? 'sajid@parul.ac.in' : '');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Sajid Khan');
  const [role, setRole] = useState<Role>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const res = await authApi.login({ email, password });
        if (res.data?.token && res.data?.user) {
          onAuthSuccess(res.data.token, res.data.user);
          navigate(`/${res.data.user.role.toLowerCase()}-dashboard`);
        }
      } else {
        const res = await authApi.signup({ name, email, password, role });
        if (res.data?.token && res.data?.user) {
          onAuthSuccess(res.data.token, res.data.user);
          navigate(`/${res.data.user.role.toLowerCase()}-dashboard`);
        }
      }
    } catch (err: any) {
      const responseError = err?.response?.data?.error;
      const message = typeof responseError === 'string'
        ? responseError
        : responseError?.message || err?.message;
      setError(message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoRole: Role) => {
    setEmail(demoEmail);
    setPassword('password123');
    setRole(demoRole);
    setError('');
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Glow effect */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="mb-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-cyan-400">
            {mode === 'login' ? 'Workspace Access' : 'Create Account'}
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            {mode === 'login' ? 'Sign In to Portal' : 'Start Your Strategy'}
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Parul Institute of Technology • Enterprise MERN Platform
          </p>
        </div>

        {mode === 'login' && (
          <div className="mb-6">
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 text-center">One-Click Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('sajid@parul.ac.in', 'Student')}
                className="flex flex-col items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
              >
                <FaGraduationCap className="mb-1 text-base" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('gayatri.naidu@parul.ac.in', 'Teacher')}
                className="flex flex-col items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 p-2 text-xs font-bold text-teal-300 hover:bg-teal-500/20 transition"
              >
                <FaChalkboardTeacher className="mb-1 text-base" />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@parul.ac.in', 'Admin')}
                className="flex flex-col items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition"
              >
                <FaUserShield className="mb-1 text-base" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name / Student ID</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Sajid Khan (2303051240191)"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-3.5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="sajid@parul.ac.in"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-3.5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 px-4 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="Student">Student (B.Tech Learner)</option>
                <option value="Teacher">Teacher (Faculty / Guide)</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 text-center font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Enter Portal' : 'Register Workspace'}</span>
            <FaArrowRight className="text-xs" />
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Need an enterprise account?{' '}
              <Link to="/signup" className="font-bold text-cyan-300 hover:underline">
                Register here
              </Link>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <Link to="/login" className="font-bold text-cyan-300 hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
