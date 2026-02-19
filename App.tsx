
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from './types';
import { auth, getUserProfile } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import Settings from './components/Profile/Settings';
import ResumeScanner from './components/Tools/ResumeScanner';
import PersonalityTest from './components/Tools/PersonalityTest';
import SkillTree from './components/Skills/SkillTree';
import Navigation from './components/Layout/Navigation';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profileData = await getUserProfile(firebaseUser.uid);
        if (profileData) {
          setUser(profileData as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-bold animate-pulse">Initializing SkillPath AI...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => signOut(auth);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {user && <Navigation user={user} onLogout={handleLogout} />}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/resume-scanner" element={user && user.studyLevel !== 'BELOW_UNI' ? <ResumeScanner /> : <Navigate to="/" />} />
            <Route path="/personality-test" element={user ? <PersonalityTest /> : <Navigate to="/login" />} />
            <Route path="/skill-tree" element={user ? <SkillTree user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
