import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  IconUser, IconLogOut, IconClock, IconCheckCircle, IconXCircle 
} from './Icons';

export const StudentDashboard = ({ user, onLogout }) => {
    const [tab, setTab] = useState('browse'); // browse, history, leaderboard
    const [quizzes, setQuizzes] = useState([]);
    const [myAttempts, setMyAttempts] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeQuizId, setActiveQuizId] = useState(null);
    const [activeAttempt, setActiveAttempt] = useState(null);

    useEffect(() => {
        fetchData();
    }, [tab]);

    const fetchData = async () => {
        try {
            const [qRes, aRes, lRes] = await Promise.all([
                api.get('/quizzes'),
                api.get('/attempts'),
                api.get('/leaderboard')
            ]);
            // Only show published quizzes
            setQuizzes(qRes.data.filter(q => q.status === 'published'));
            setMyAttempts(aRes.data.filter(a => a.studentId === user.id));
            setLeaderboard(lRes.data);
        } catch (err) {
            console.error("Failed to fetch student data", err);
        }
    };

    if (activeAttempt) {
        return <ScoreReveal attempt={activeAttempt} quizzes={quizzes} onBack={() => { setActiveAttempt(null); fetchData(); setTab('history'); }} />;
    }

    if (activeQuizId) {
        return <QuizTaker user={user} quizId={activeQuizId} onFinish={(attempt) => { setActiveQuizId(null); setActiveAttempt(attempt); }} onCancel={() => setActiveQuizId(null)} />;
    }

    return (
        <div className="min-h-screen bg-navy-900 flex flex-col">
            <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-display font-bold tracking-tight text-white">Assess<span className="text-amber-400">IQ</span></h1>
                <div className="flex gap-6 items-center">
                    <nav className="flex gap-2">
                        <button onClick={()=>setTab('browse')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'browse' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white'}`}>Available Quizzes</button>
                        <button onClick={()=>setTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'history' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white'}`}>My History</button>
                        <button onClick={()=>setTab('leaderboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'leaderboard' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white'}`}>Leaderboard</button>
                    </nav>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                        <IconUser className="text-amber-400"/> {user.name}
                    </div>
                    <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors"><IconLogOut /></button>
                </div>
            </header>
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full animate-fade-in">
                {tab === 'browse' && <StudentBrowse quizzes={quizzes} startQuiz={setActiveQuizId} />}
                {tab === 'history' && <StudentHistory myAttempts={myAttempts} quizzes={quizzes} />}
                {tab === 'leaderboard' && <StudentLeaderboard leaderboard={leaderboard} />}
            </main>
        </div>
    );
};

const StudentBrowse = ({ quizzes, startQuiz }) => {
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');

    const subjects = ['All', ...new Set(quizzes.map(q => q.subject))];

    const filteredQuizzes = quizzes.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-display font-semibold text-white">Available Quizzes</h2>
                <div className="flex gap-4 w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search quizzes..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 flex-1 sm:w-64"
                    />
                    <select 
                        value={subjectFilter} 
                        onChange={e => setSubjectFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map(quiz => (
                    <div key={quiz.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg flex flex-col hover:border-amber-500/30 transition-colors group">
                        <div className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded font-medium w-max mb-4">{quiz.subject}</div>
                        <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
                        <div className="text-sm text-slate-400 flex items-center gap-4 mb-6">
                            <span className="flex items-center gap-1"><IconClock className="w-4 h-4"/> {quiz.timeLimit}m</span>
                        </div>
                        <button 
                            onClick={() => startQuiz(quiz.id)}
                            className="mt-auto w-full bg-amber-600/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 py-2.5 rounded-lg font-medium transition-all group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                            Start Attempt
                        </button>
                    </div>
                ))}
                {filteredQuizzes.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        No published quizzes found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentLeaderboard = ({ leaderboard }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-semibold text-white">Global Leaderboard</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-4 font-medium">Rank</th>
                            <th className="px-6 py-4 font-medium">Student Name</th>
                            <th className="px-6 py-4 font-medium">Quizzes Completed</th>
                            <th className="px-6 py-4 font-medium">Average Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {leaderboard.map((student, idx) => (
                            <tr key={student.id} className={`transition-colors ${idx < 3 ? 'bg-amber-500/5' : 'hover:bg-slate-700/20'}`}>
                                <td className="px-6 py-4 font-bold text-white">
                                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                                </td>
                                <td className={`px-6 py-4 font-medium ${idx < 3 ? 'text-amber-400' : 'text-white'}`}>{student.name}</td>
                                <td className="px-6 py-4">{student.quizzesTaken}</td>
                                <td className="px-6 py-4 font-bold">{student.averageScore}%</td>
                            </tr>
                        ))}
                        {leaderboard.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-500">No attempts have been recorded yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StudentHistory = ({ myAttempts, quizzes }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-semibold text-white">My History</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-4 font-medium">Quiz Title</th>
                            <th className="px-6 py-4 font-medium">Score</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {myAttempts.map(attempt => {
                            const quiz = quizzes.find(q => q.id === attempt.quizId);
                            return (
                                <tr key={attempt.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{quiz ? quiz.title : 'Unknown'}</td>
                                    <td className="px-6 py-4 font-bold text-white">{attempt.score}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${attempt.passed ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {attempt.passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{new Date(attempt.submittedAt).toLocaleDateString()}</td>
                                </tr>
                            )
                        })}
                        {myAttempts.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-500">No attempts yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const QuizTaker = ({ user, quizId, onFinish, onCancel }) => {
   /* const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);*/
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        /*const loadQuiz = async () => {
            const [qRes, qsRes] = await Promise.all([
                api.get('/quizzes'),
                api.get(`/quizzes/${quizId}/questions`)
            ]);
            const theQuiz = qRes.data.find(q => q.id === quizId);
            setQuiz(theQuiz);
            setQuestions(qsRes.data);
            setAnswers(new Array(qsRes.data.length).fill(''));
            setTimeLeft(theQuiz.timeLimit * 60);
        };*/
        const loadQuiz = async () => {

    try {

        setLoading(true);
        setError('');

        const [qRes, qsRes] = await Promise.all([
            api.get('/quizzes'),
            api.get(`/quizzes/${quizId}/questions`)
        ]);

        const theQuiz = qRes.data.find(
            q => q.id === quizId
        );

        if (!theQuiz) {
            throw new Error('Quiz not found');
        }

        if (!qsRes.data || qsRes.data.length === 0) {
            throw new Error(
                'This quiz has no valid questions'
            );
        }

        setQuiz(theQuiz);

        setQuestions(qsRes.data);

        setAnswers(
            new Array(qsRes.data.length).fill('')
        );

        setTimeLeft(theQuiz.timeLimit * 60);

    } catch (err) {

        console.error(err);

        setError(
            err.response?.data?.error ||
            err.message ||
            'Failed to load quiz'
        );

    } finally {

        setLoading(false);
    }
};

        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (!quiz) return;
        if (timeLeft <= 0) {
            submitQuiz();
            return;
        }
        const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, quiz]);

    const submitQuiz = async () => {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            const ans = answers[idx];
            if (q.type === 'short') {
                if ((ans||'').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) correctCount++;
            } else {
                if (ans === q.correctAnswer) correctCount++;
            }
        });
        const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
        const passed = score >= quiz.passMark;
        const attemptPayload = {
            quizId: quiz.id,
            studentId: user.id,
            answers,
            score: Number(score.toFixed(2)),
            timeTaken: (quiz.timeLimit * 60) - timeLeft,
            passed
        };
        
        try {
            const res = await api.post('/attempts', attemptPayload);
            onFinish({ ...attemptPayload, id: res.data.id, submittedAt: new Date().toISOString() });
        } catch (err) {
            console.error("Failed to submit attempt", err);
        }
    };

    //if (!quiz || questions.length === 0) return <div className="p-8 text-white">Loading quiz...</div>;
    if (loading) {
    return (
        <div className="p-8 text-white">
            Loading quiz...
        </div>
    );
}

if (error) {
    return (
        <div className="p-8 text-red-400">
            {error}
        </div>
    );
}

    const q = questions[currentIdx];
    const formatTime = (secs) => `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2, '0')}`;

    return (
        <div className="min-h-screen bg-navy-900 flex flex-col">
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-display font-semibold text-white">{quiz.title}</h2>
                <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-1.5 rounded-lg ${timeLeft < 60 ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-slate-900 text-amber-400'}`}>
                    <IconClock className="w-5 h-5"/> {formatTime(timeLeft)}
                </div>
                <button onClick={onCancel} className="text-slate-400 hover:text-white">Cancel</button>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-3xl bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 rounded-t-2xl overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{width: `${((currentIdx) / questions.length) * 100}%`}}></div>
                    </div>

                    <div className="flex justify-between text-sm text-slate-400 mb-6 font-medium">
                        <span>Question {currentIdx + 1} of {questions.length}</span>
                        <span className="uppercase tracking-wider">{q.type === 'mcq' ? 'Multiple Choice' : q.type === 'tf' ? 'True / False' : 'Short Answer'}</span>
                    </div>

                    <h3 className="text-2xl text-white font-medium mb-8 leading-snug">{q.questionText}</h3>

                    <div className="space-y-3 mb-10">
                        {q.type === 'mcq' && q.options && q.options.map((opt, i) => (
                            <button 
                                key={i} 
                                onClick={() => { const newA=[...answers]; newA[currentIdx]=opt; setAnswers(newA); }}
                                className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${answers[currentIdx] === opt ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                            >
                                {opt}
                            </button>
                        ))}
                        {q.type === 'tf' && ['True', 'False'].map((opt, i) => (
                            <button 
                                key={i} 
                                onClick={() => { const newA=[...answers]; newA[currentIdx]=opt; setAnswers(newA); }}
                                className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${answers[currentIdx] === opt ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                            >
                                {opt}
                            </button>
                        ))}
                        {q.type === 'short' && (
                            <input 
                                type="text" 
                                value={answers[currentIdx]} 
                                onChange={e => { const newA=[...answers]; newA[currentIdx]=e.target.value; setAnswers(newA); }}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 text-lg"
                                placeholder="Type your answer here..."
                            />
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-slate-700">
                        <button 
                            onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                            disabled={currentIdx === 0}
                            className="px-6 py-2.5 rounded-lg font-medium text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        {currentIdx < questions.length - 1 ? (
                            <button 
                                onClick={() => setCurrentIdx(i => i + 1)}
                                className="px-8 py-2.5 rounded-lg font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-lg"
                            >
                                Next
                            </button>
                        ) : (
                            <button 
                                onClick={submitQuiz}
                                className="px-8 py-2.5 rounded-lg font-medium bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-lg"
                            >
                                Submit Quiz
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const ScoreReveal = ({ attempt, quizzes, onBack }) => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        api.get(`/quizzes/${attempt.quizId}/questions`).then(res => setQuestions(res.data));
    }, [attempt.quizId]);

    return (
        <div className="min-h-screen bg-navy-900 py-12 px-4 overflow-y-auto animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="text-slate-400 hover:text-white mb-6">← Back to Dashboard</button>
                <div className="text-center mb-12 animate-slide-up">
                    <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 border-4 ${attempt.passed ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
                        <span className="text-4xl font-display font-bold">{attempt.score}%</span>
                    </div>
                    <h2 className="text-4xl font-display font-bold text-white mb-2">{attempt.passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
                    <p className="text-slate-400 text-lg">You have completed {quiz?.title}</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 mb-8">
                    <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-4 mb-6">Detailed Results</h3>
                    <div className="space-y-6">
                        {questions.map((q, idx) => {
                            const userAns = attempt.answers[idx];
                            const isCorrect = q.type === 'short' ? (userAns||'').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim() : userAns === q.correctAnswer;
                            return (
                                <div key={q.id} className={`p-5 rounded-xl border ${isCorrect ? 'bg-teal-500/5 border-teal-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {isCorrect ? <IconCheckCircle className="text-teal-400 w-6 h-6"/> : <IconXCircle className="text-red-400 w-6 h-6"/>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-medium mb-3 leading-relaxed">{idx + 1}. {q.questionText}</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                    <div className="text-slate-500 text-xs uppercase mb-1">Your Answer</div>
                                                    <div className={`font-medium ${isCorrect ? 'text-teal-400' : 'text-red-400'}`}>{userAns || '(No answer)'}</div>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                    <div className="text-slate-500 text-xs uppercase mb-1">Correct Answer</div>
                                                    <div className="font-medium text-white">{q.correctAnswer}</div>
                                                </div>
                                            </div>
                                            {q.explanation && (
                                                <div className="text-slate-400 text-sm mt-2 border-t border-slate-700/50 pt-2">
                                                    <span className="text-slate-300 font-medium">Explanation:</span> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
