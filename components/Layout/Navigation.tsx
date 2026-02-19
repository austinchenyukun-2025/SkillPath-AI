
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserProfile, StudyLevel } from '../../types';

interface NavigationProps {
  user: UserProfile;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="hidden md:block bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1 rounded-lg">SP</span>
            SkillPath AI
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className={`text-sm font-medium ${isActive('/') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>Dashboard</Link>
            {user.studyLevel !== StudyLevel.BELOW_UNI && (
              <Link to="/resume-scanner" className={`text-sm font-medium ${isActive('/resume-scanner') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>Resume Scanner</Link>
            )}
            <Link to="/skill-tree" className={`text-sm font-medium ${isActive('/skill-tree') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>Skill Tree</Link>
            <Link to="/personality-test" className={`text-sm font-medium ${isActive('/personality-test') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>Personality</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
            <button onClick={onLogout} className="text-sm font-medium text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-indigo-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link to="/skill-tree" className={`flex flex-col items-center gap-1 ${isActive('/skill-tree') ? 'text-indigo-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span className="text-[10px] font-bold">Skills</span>
        </Link>
        {user.studyLevel !== StudyLevel.BELOW_UNI && (
          <Link to="/resume-scanner" className={`flex flex-col items-center gap-1 ${isActive('/resume-scanner') ? 'text-indigo-600' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span className="text-[10px] font-bold">Resume</span>
          </Link>
        )}
        <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-indigo-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default Navigation;
