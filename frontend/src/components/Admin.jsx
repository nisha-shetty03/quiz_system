import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  IconUser, IconLogOut, IconClock, IconEdit, IconCheckCircle, 
  IconPlus, IconTrash, IconChevronLeft, IconXCircle 
} from './Icons';

export const AdminDashboard = ({ user, onLogout }) => {
    const [tab, setTab] = useState('overview'); 
    const [editingQuiz, setEditingQuiz] = useState(null); 
    const [quizzes, setQuizzes] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [qRes, aRes, uRes] = await Promise.all([
                api.get('/quizzes'),
                api.get('/attempts'),
                api.get('/users')
            ]);
            setQuizzes(qRes.data);
            setAttempts(aRes.data);
            setStudents(uRes.data.filter(u => u.role === 'student'));
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: IconClock },
        { id: 'quizzes', label: 'Manage Quizzes', icon: IconEdit },
        { id: 'performance', label: 'Performance Report', icon: IconCheckCircle },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-navy-900">
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-display font-bold tracking-tight text-white">Assess<span className="text-teal-400">IQ</span> <span className="text-xs uppercase tracking-widest text-slate-500 ml-1">Admin</span></h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setEditingQuiz(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === t.id && !editingQuiz ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}>
                            <t.icon className="w-5 h-5"/> {t.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-4 px-2 text-sm text-slate-300">
                        <IconUser className="text-teal-400"/> {user.name}
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-2 justify-center px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors">
                        <IconLogOut/> Sign Out
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
                {editingQuiz ? (
                    <QuizEditor 
                        quiz={editingQuiz} 
                        onClose={() => { setEditingQuiz(null); fetchData(); }} 
                    />
                ) : (
                    <>
                        {tab === 'overview' && <AdminOverview quizzes={quizzes} students={students} attempts={attempts} />}
                        {tab === 'quizzes' && <QuizManager user={user} quizzes={quizzes} setQuizzes={setQuizzes} onEdit={setEditingQuiz} />}
                        {tab === 'performance' && <PerformanceReport attempts={attempts} students={students} quizzes={quizzes} />}
                    </>
                )}
            </main>
        </div>
    );
};

const AdminOverview = ({ quizzes, students, attempts }) => {
    const avgScore = attempts.length > 0 ? (attempts.reduce((acc, a) => acc + Number(a.score), 0) / attempts.length).toFixed(1) : 0;
    const passRate = attempts.length > 0 ? ((attempts.filter(a => a.passed).length / attempts.length) * 100).toFixed(1) : 0;
    const publishedQuizzes = quizzes.filter(q => q.status === 'published').length;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-semibold text-white">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
                    <div className="text-slate-400 text-sm font-medium mb-1">Published Quizzes</div>
                    <div className="text-4xl font-display font-bold text-white">{publishedQuizzes} <span className="text-lg text-slate-500 font-normal">/ {quizzes.length}</span></div>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
                    <div className="text-slate-400 text-sm font-medium mb-1">Total Students</div>
                    <div className="text-4xl font-display font-bold text-white">{students.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
                    <div className="text-slate-400 text-sm font-medium mb-1">Average Score</div>
                    <div className="text-4xl font-display font-bold text-teal-400">{avgScore}%</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
                    <div className="text-slate-400 text-sm font-medium mb-1">Global Pass Rate</div>
                    <div className="text-4xl font-display font-bold text-amber-400">{passRate}%</div>
                </div>
            </div>
        </div>
    );
};

const QuizManager = ({ user, quizzes, setQuizzes, onEdit }) => {
    const handleCreate = async () => {
        const newQuiz = { title: 'New Quiz', subject: 'General', timeLimit: 10, passMark: 50, status: 'draft', createdBy: user.id };
        try {
            const res = await api.post('/quizzes', newQuiz);
            setQuizzes([res.data, ...quizzes]);
            onEdit(res.data);
        } catch(err) {
            console.error("Failed to create quiz", err);
        }
    };

    const handleDelete = async (id) => {
        if(confirm('Are you sure you want to delete this quiz?')) {
            try {
                await api.delete(`/quizzes/${id}`);
                setQuizzes(quizzes.filter(q => q.id !== id));
            } catch(err) {
                console.error("Failed to delete quiz", err);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-semibold text-white">Manage Quizzes</h2>
                <button onClick={handleCreate} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <IconPlus /> Create Quiz
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg flex flex-col relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${quiz.status === 'published' ? 'bg-teal-500' : 'bg-slate-500'}`}></div>
                        <div className="flex justify-between items-start mb-4 pl-3">
                            <div className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded font-medium flex items-center gap-2">
                                {quiz.subject}
                                <span className={`w-2 h-2 rounded-full ${quiz.status === 'published' ? 'bg-teal-400' : 'bg-slate-400'}`}></span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onEdit(quiz)} className="text-slate-400 hover:text-teal-400 transition-colors"><IconEdit className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(quiz.id)} className="text-slate-400 hover:text-red-400 transition-colors"><IconTrash className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2 pl-3">{quiz.title}</h3>
                        <div className="text-sm text-slate-400 flex items-center gap-4 mt-auto pt-4 pl-3">
                            <span className="flex items-center gap-1"><IconClock className="w-4 h-4"/> {quiz.timeLimit}m</span>
                            <span className="flex items-center gap-1"><IconCheckCircle className="w-4 h-4"/> {quiz.passMark}% Pass</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${quiz.status === 'published' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                {quiz.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuizEditor = ({ quiz, onClose }) => {
    const [title, setTitle] = useState(quiz.title);
    const [subject, setSubject] = useState(quiz.subject);
    const [timeLimit, setTimeLimit] = useState(quiz.timeLimit);
    const [passMark, setPassMark] = useState(quiz.passMark);
    const [status, setStatus] = useState(quiz.status || 'draft');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        api.get(`/quizzes/${quiz.id}/questions`).then(res => setQuestions(res.data));
    }, [quiz.id]);

    const handleSave = async () => {
        await api.put(`/quizzes/${quiz.id}`, { title, subject, timeLimit: Number(timeLimit), passMark: Number(passMark), status });
        onClose();
    };

    /*const addQuestion = async (type) => {
        const payload = { quizId: quiz.id, type, questionText: 'New Question', options: type==='tf'?['True','False']:['Option 1', 'Option 2'], correctAnswer: '', explanation: '' };
        
        const res = await api.post('/questions', payload);
        setQuestions([...questions, res.data]);
    };
*/
    const addQuestion = async (type) => {

    const payload = {
        quizId: quiz.id,
        type,
        questionText: 'New Question',
        options: type === 'tf'
            ? ['True', 'False']
            : ['Option 1', 'Option 2'],
        correctAnswer: '',
        explanation: ''
    };

    try {

        const res = await api.post('/questions', payload);

        setQuestions([...questions, res.data]);

    } catch (err) {

        alert(
            err.response?.data?.error ||
            'Failed to add question'
        );
    }
};
    /*const updateQuestion = async (id, updates) => {
        const qToUpdate = questions.find(q => q.id === id);
        const updatedQ = { ...qToUpdate, ...updates };
        setQuestions(questions.map(q => q.id === id ? updatedQ : q));
        await api.put(`/questions/${id}`, updatedQ);
    };
*/
    const updateQuestion = async (id, updates) => {

    const qToUpdate = questions.find(q => q.id === id);

    const updatedQ = {
        ...qToUpdate,
        ...updates
    };

    // FRONTEND VALIDATION
    if (
        updatedQ.explanation &&
        updatedQ.explanation.length > 500
    ) {
        alert('Explanation cannot exceed 500 characters');
        return;
    }

    try {

        // SAVE TO BACKEND FIRST
        await api.put(`/questions/${id}`, updatedQ);

        // UPDATE FRONTEND ONLY IF SUCCESS
        setQuestions(
            questions.map(q =>
                q.id === id ? updatedQ : q
            )
        );

    } catch (err) {

        alert(
            err.response?.data?.error ||
            'Failed to update question'
        );
    }
};
    const deleteQuestion = async (id) => {
        await api.delete(`/questions/${id}`);
        setQuestions(questions.filter(q => q.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-1 mb-2 text-sm">
                <IconChevronLeft className="w-4 h-4"/> Back to Quizzes
            </button>
            
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <h3 className="text-xl font-display font-semibold text-white">Quiz Settings</h3>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                        <button 
                            onClick={() => setStatus('draft')} 
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'draft' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Draft
                        </button>
                        <button 
                            onClick={() => setStatus('published')} 
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'published' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Published
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Title</label>
                        <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Subject / Category</label>
                        <input type="text" value={subject} onChange={e=>setSubject(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Time Limit (mins)</label>
                        <input type="number" value={timeLimit} onChange={e=>setTimeLimit(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Pass Mark (%)</label>
                        <input type="number" value={passMark} onChange={e=>setPassMark(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
                    </div>
                </div>
                <button onClick={handleSave} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Save Settings & Status</button>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg space-y-6">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <h3 className="text-xl font-display font-semibold text-white">Questions</h3>
                    <div className="flex gap-2">
                        <button onClick={()=>addQuestion('mcq')} className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-md text-white transition-colors">+ MCQ</button>
                        <button onClick={()=>addQuestion('tf')} className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-md text-white transition-colors">+ True/False</button>
                        <button onClick={()=>addQuestion('short')} className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-md text-white transition-colors">+ Short Answer</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <QuestionEditorItem key={q.id} q={q} idx={idx} updateQ={(upd) => updateQuestion(q.id, upd)} deleteQ={() => deleteQuestion(q.id)} />
                    ))}
                    {questions.length === 0 && <div className="text-slate-400 text-sm text-center py-4">No questions added yet.</div>}
                </div>
            </div>
        </div>
    );
};

const QuestionEditorItem = ({ q, idx, updateQ, deleteQ }) => {
    const handleOptionChange = (oIdx, val) => {
        const newOpts = [...q.options];
        newOpts[oIdx] = val;
        updateQ({options: newOpts});
    };

    return (
        <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
            <div className="flex justify-between items-center mb-3">
                <span className="text-teal-400 font-medium text-sm">Question {idx + 1} ({q.type.toUpperCase()})</span>
                <button onClick={deleteQ} className="text-slate-500 hover:text-red-400"><IconTrash className="w-4 h-4"/></button>
            </div>
            <div className="space-y-3">
                <input type="text" placeholder="Question Text" value={q.questionText} onChange={e=>updateQ({questionText: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:border-teal-500 outline-none" />
                
                {q.type === 'mcq' && (
                    <div className="pl-4 space-y-2 border-l-2 border-slate-700">
                        {q.options && q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-2 items-center">
                                <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === opt} onChange={()=>updateQ({correctAnswer: opt})} className="accent-teal-500" />
                                <input type="text" value={opt} onChange={e=>handleOptionChange(oIdx, e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-white text-sm" />
                            </div>
                        ))}
                        <button onClick={()=>updateQ({options: [...(q.options||[]), 'New Option']})} className="text-xs text-teal-400">+ Add Option</button>
                    </div>
                )}
                
                {q.type === 'tf' && (
                    <div className="flex gap-4">
                        <label className="flex gap-2 items-center text-sm text-white"><input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === 'True'} onChange={()=>updateQ({correctAnswer: 'True'})} className="accent-teal-500"/> True</label>
                        <label className="flex gap-2 items-center text-sm text-white"><input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === 'False'} onChange={()=>updateQ({correctAnswer: 'False'})} className="accent-teal-500"/> False</label>
                    </div>
                )}

                {q.type === 'short' && (
                    <input type="text" placeholder="Exact Correct Answer" value={q.correctAnswer} onChange={e=>updateQ({correctAnswer: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:border-teal-500 outline-none" />
                )}

               {/*<textarea placeholder="Explanation" value={q.explanation || ''} onChange={e=>updateQ({explanation: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:border-teal-500 outline-none h-20" />*/}
               <textarea
                        placeholder="Explanation"
                        value={q.explanation || ''}
                        maxLength={500}
                        onChange={e =>
                            updateQ({
                                explanation: e.target.value
                            })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:border-teal-500 outline-none h-20"
                    />

                    <p className="text-xs text-slate-400 mt-1 text-right">
                        {(q.explanation || '').length}/500 characters
                    </p>
            </div>
        </div>
    )
};

const PerformanceReport = ({ attempts, students, quizzes }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-semibold text-white">Performance Report</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Quiz</th>
                                <th className="px-6 py-4 font-medium">Score</th>
                                <th className="px-6 py-4 font-medium">Time Taken</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {attempts.map(attempt => {
                                const student = students.find(u => u.id === attempt.studentId);
                                const quiz = quizzes.find(q => q.id === attempt.quizId);
                                return (
                                    <tr key={attempt.id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{student ? student.name : 'Unknown'}</td>
                                        <td className="px-6 py-4">{quiz ? quiz.title : 'Deleted Quiz'}</td>
                                        <td className="px-6 py-4">{attempt.score}%</td>
                                        <td className="px-6 py-4">{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${attempt.passed ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {attempt.passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(attempt.submittedAt).toLocaleDateString()}</td>
                                    </tr>
                                )
                            })}
                            {attempts.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-slate-500">No attempts recorded yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
