
import React, { useState } from 'react';
import { auth, saveUserProfile } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserRole, StudyLevel } from '../../types';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phone: '',
    role: UserRole.JOBSEEKER,
    studyLevel: StudyLevel.UNI,
    learningInterest: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserProfile(userCredential.user.uid, {
        ...formData,
        email,
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Join SkillPath AI</h2>
      <p className="text-center text-gray-500 mb-8">Personalized career education starts here.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border"
            onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
          >
            <option value={UserRole.JOBSEEKER}>Job Seeker</option>
            <option value={UserRole.RECRUITER}>Recruiter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Study Level</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border"
            onChange={(e) => setFormData({...formData, studyLevel: e.target.value as StudyLevel})}
          >
            <option value={StudyLevel.BELOW_UNI}>Below University</option>
            <option value={StudyLevel.UNI}>University</option>
            <option value={StudyLevel.POST_GRAD}>Post-Graduate</option>
          </select>
        </div>

        {formData.studyLevel === StudyLevel.BELOW_UNI && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to learn or be?</label>
            <textarea
              required
              placeholder="e.g. I want to learn web development or become a pilot..."
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setFormData({...formData, learningInterest: e.target.value})}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg mt-4 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
};

export default Register;
