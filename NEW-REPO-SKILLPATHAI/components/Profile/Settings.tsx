
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Settings</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
          <div>
            <h4 className="font-bold text-gray-800">Change Password</h4>
            <p className="text-sm text-gray-500">Update your security credentials</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </div>

        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
          <div>
            <h4 className="font-bold text-gray-800">Privacy and Security</h4>
            <p className="text-sm text-gray-500">Manage data sharing and account visibility</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </div>

        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
          <div>
            <h4 className="font-bold text-gray-800">Help & Feedback</h4>
            <p className="text-sm text-gray-500">Contact support or suggest features</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </div>

        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
          <div className="text-red-600">
            <h4 className="font-bold">Deactivate Account</h4>
            <p className="text-sm">Permanently delete your profile and data</p>
          </div>
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </div>
      </div>
    </div>
  );
};

export default Settings;
