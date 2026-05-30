import React, { useState } from 'react';
import { Landing, Login } from './components/Auth';
import { AdminDashboard } from './components/Admin';
import { StudentDashboard } from './components/Student';
import './index.css';

function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setView('admin_dashboard');
    } else {
      setView('student_dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('landing');
  };

  return (
    <>
      {view === 'landing' && <Landing setView={setView} />}
      {view === 'login_admin' && <Login role="admin" setView={setView} onLogin={handleLogin} />}
      {view === 'login_student' && <Login role="student" setView={setView} onLogin={handleLogin} />}
      {view === 'admin_dashboard' && <AdminDashboard user={currentUser} onLogout={handleLogout} />}
      {view === 'student_dashboard' && <StudentDashboard user={currentUser} onLogout={handleLogout} />}
    </>
  );
}

export default App;
