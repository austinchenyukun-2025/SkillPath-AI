
import React, { useState } from 'react';
import { getAIPersonalityAssessment } from '../../services/geminiService';

const QUESTIONS = [
  "Do you prefer working alone or in a team?",
  "How do you handle stress in high-pressure situations?",
  "Would you rather follow a set routine or have daily variety?",
  "Are you more interested in logic and data or creativity and people?",
  "Where do you see yourself in 5 years?"
];

const PersonalityTest: React.FC = () => {
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{ industries: string[], roles: string[], summary: string } | null>(null);

  const handleFinish = async () => {
    if (answers.some(a => !a)) return;
    setAnalyzing(true);
    try {
      const res = await getAIPersonalityAssessment(answers);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Personality Insights</h2>
        <p className="text-gray-500 mb-8">Tell us about yourself, and our AI will suggest the best career paths.</p>

        {!results ? (
          <div className="space-y-8">
            {QUESTIONS.map((q, i) => (
              <div key={i}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{q}</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                  value={answers[i]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[i] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  placeholder="Your answer..."
                />
              </div>
            ))}
            <button
              onClick={handleFinish}
              disabled={analyzing || answers.some(a => !a)}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {analyzing ? 'Analyzing your personality...' : 'Generate Career Insights'}
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeInUp">
            <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
              <h3 className="text-xl font-bold text-purple-900 mb-2">Who you are</h3>
              <p className="text-purple-800 opacity-80 leading-relaxed">{results.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> Best Fit Industries
                </h4>
                <ul className="space-y-2">
                  {results.industries.map((ind, i) => (
                    <li key={i} className="text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> Recommended Roles
                </h4>
                <ul className="space-y-2">
                  {results.roles.map((role, i) => (
                    <li key={i} className="text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setResults(null)}
              className="text-indigo-600 font-bold hover:underline"
            >
              Retake Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;
