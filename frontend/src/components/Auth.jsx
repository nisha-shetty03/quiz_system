import React, { useState } from 'react';
import { api } from '../api';
import { IconShield, IconGraduationCap, IconChevronLeft } from './Icons';

export const Landing = ({ setView }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-navy-900 px-4 animate-fade-in relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>

      <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 text-center z-10 tracking-tight">
          Assess<span className="text-teal-400">IQ</span>
      </h1>
      <p className="text-slate-400 text-lg mb-12 text-center max-w-md z-10">
          A modern platform for intelligent assessments and learning progress tracking.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl z-10">
          <button 
              onClick={() => setView('login_admin')}
              className="flex-1 group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-teal-500/50 transition-all duration-300 overflow-hidden"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <IconShield className="w-12 h-12 text-teal-400 mb-4 mx-auto" />
              <h2 className="text-2xl font-display font-semibold text-white mb-2 text-center">Administrator</h2>
              <p className="text-slate-400 text-center text-sm">Manage quizzes, view performance reports, and monitor students.</p>
          </button>
          <button 
              onClick={() => setView('login_student')}
              className="flex-1 group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-amber-500/50 transition-all duration-300 overflow-hidden"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <IconGraduationCap className="w-12 h-12 text-amber-400 mb-4 mx-auto" />
              <h2 className="text-2xl font-display font-semibold text-white mb-2 text-center">Student</h2>
              <p className="text-slate-400 text-center text-sm">Take quizzes, track your progress, and view historical attempts.</p>
          </button>
      </div>
  </div>
);

export const Login = ({ role, setView, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (isRegister) {
            const res = await api.post('/auth/register', { name, email, password, role });
            onLogin(res.data);
        } else {
            const res = await api.post('/auth/login', { email, password, role });
            onLogin(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.error || (isRegister ? 'Registration failed' : 'Login failed'));
      }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4 animate-scale-up">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${role === 'admin' ? 'bg-teal-500' : 'bg-amber-500'}`}></div>
              <button onClick={() => setView('landing')} className="text-slate-400 hover:text-white flex items-center gap-1 mb-6 text-sm transition-colors">
                  <IconChevronLeft className="w-4 h-4"/> Back
              </button>
              <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
                  {role === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </h2>
              <p className="text-slate-400 text-center mb-8 text-sm">
                  {isRegister ? 'Create a new account' : 'Sign in to your account'}
              </p>
              
              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm text-center">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                  {isRegister && (
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                          <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" required/>
                      </div>
                  )}
                  <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" required/>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" required/>
                  </div>
                  <button type="submit" className={`w-full py-3 rounded-lg font-medium text-white transition-colors mt-4 ${role === 'admin' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
                      {isRegister ? 'Sign Up' : 'Sign In'}
                  </button>
              </form>
              <div className="mt-6 text-center">
                  <button 
                      onClick={() => { setIsRegister(!isRegister); setError(''); }} 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                      {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
              </div>
          </div>
      </div>
  );
};
