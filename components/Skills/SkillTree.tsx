
import React, { useState, useEffect } from 'react';
import { UserProfile, SkillNode } from '../../types';
import { generateSkillTree, chatWithCoach } from '../../services/geminiService';

const FIXED_SOFT_SKILLS: SkillNode = {
  id: 'soft-skills',
  label: 'Soft Skills',
  status: 'available',
  description: 'Master non-technical skills essential for professional growth.',
  children: [
    { id: 'ss-1', label: 'Communication', status: 'available', description: 'Effectively convey ideas.' },
    { id: 'ss-2', label: 'Leadership', status: 'locked', description: 'Guide teams towards success.' },
    { id: 'ss-3', label: 'Time Management', status: 'locked', description: 'Optimize your daily schedule.' }
  ]
};

const FIXED_LANGUAGES: SkillNode = {
  id: 'languages',
  label: 'Languages',
  status: 'available',
  description: 'Common professional languages (Basic level).',
  children: [
    { id: 'lang-1', label: 'English (B1)', status: 'available', description: 'Standard global business language.' },
    { id: 'lang-2', label: 'Spanish (Basic)', status: 'locked', description: 'Conversational greetings and basic phrases.' },
    { id: 'lang-3', label: 'Mandarin (Basic)', status: 'locked', description: 'Simple business etiquette.' }
  ]
};

const SkillTree: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [customSkillTree, setCustomSkillTree] = useState<SkillNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomTree = async () => {
      const interest = user.learningInterest || 'Software Engineering';
      setLoading(true);
      try {
        const tree = await generateSkillTree(interest);
        setCustomSkillTree({ ...tree, status: 'available' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomTree();
  }, [user.learningInterest]);

  const handleSendMessage = async () => {
    if (!chatMessage) return;
    const msg = chatMessage;
    setChatMessage('');
    setCoachResponse('Thinking...');
    try {
      const response = await chatWithCoach(msg, selectedNode?.label || 'General Career Path');
      setCoachResponse(response || '');
    } catch (e) {
      setCoachResponse("Sorry, I'm busy right now.");
    }
  };

  const renderTree = (node: SkillNode) => (
    <div key={node.id} className="flex flex-col items-center">
      <button
        onClick={() => setSelectedNode(node)}
        className={`p-4 rounded-2xl border-2 transition-all transform hover:scale-105 ${
          node.status === 'completed' ? 'bg-green-100 border-green-500 text-green-800' :
          node.status === 'available' ? 'bg-indigo-50 border-indigo-500 text-indigo-800' :
          'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
        } min-w-[140px] shadow-sm`}
      >
        <span className="font-bold">{node.label}</span>
      </button>
      
      {node.children && node.children.length > 0 && (
        <div className="mt-8 flex gap-8">
          {node.children.map(child => (
            <div key={child.id} className="relative">
              <div className="absolute top-[-32px] left-1/2 h-[32px] w-[2px] bg-gray-200 -translate-x-1/2"></div>
              {renderTree(child)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12 animate-fadeIn">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800">Your Learning Paths</h1>
        <p className="text-gray-500 mt-4 text-lg">Click on a skill to learn more and talk to your AI Soft Skill Coach.</p>
      </header>

      <div className="flex flex-col gap-16 pb-20 overflow-x-auto items-center">
        {/* Soft Skills Path */}
        <section className="flex flex-col items-center w-full min-w-[600px]">
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-10">Soft Skills</h2>
          {renderTree(FIXED_SOFT_SKILLS)}
        </section>

        {/* Languages Path */}
        <section className="flex flex-col items-center w-full min-w-[600px]">
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-10">Professional Languages</h2>
          {renderTree(FIXED_LANGUAGES)}
        </section>

        {/* Dynamic Interest Path */}
        <section className="flex flex-col items-center w-full min-w-[600px]">
          <h2 className="text-xl font-bold text-indigo-600 uppercase tracking-widest mb-10">
            {user.learningInterest ? `Path: ${user.learningInterest}` : 'Career Specialization'}
          </h2>
          {loading ? (
            <div className="text-indigo-600 font-bold animate-pulse">Growing your custom skill tree...</div>
          ) : customSkillTree ? (
            renderTree(customSkillTree)
          ) : (
             <div className="text-gray-400">Unable to generate custom tree.</div>
          )}
        </section>
      </div>

      {/* AI Coach Overlay */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold">{selectedNode.label}</h3>
                <p className="text-indigo-100 text-sm">{selectedNode.description}</p>
              </div>
              <button onClick={() => {setSelectedNode(null); setCoachResponse('');}} className="p-2 hover:bg-white/10 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4 min-h-[300px]">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">🤖</div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-gray-700 max-w-[80%]">
                  Hello! I'm your AI Coach. How can I help you master <strong>{selectedNode.label}</strong> today?
                </div>
              </div>
              {coachResponse && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">🤖</div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-gray-700 max-w-[80%]">
                    {coachResponse}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-white rounded-b-3xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask the coach anything..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTree;
