
import React from 'react';
import { UserProfile } from '../../types';

const Profile: React.FC<{ user: UserProfile }> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-32 h-32 rounded-full bg-indigo-600 text-white flex items-center justify-center text-5xl font-black shadow-xl ring-8 ring-indigo-50">
            {user.username[0].toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-indigo-600 font-medium">@{user.username}</p>
            <div className="flex gap-4 mt-4 flex-wrap justify-center md:justify-start">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase tracking-wider">{user.role}</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold uppercase tracking-wider">{user.studyLevel.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Contact Information</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-800 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-800 font-medium">{user.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Interests</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Primary Goal</span>
                <span className="text-indigo-600 font-bold">{user.learningInterest || 'Generic Career Growth'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
