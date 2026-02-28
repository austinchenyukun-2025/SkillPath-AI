
import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { getAIPersonalityAssessment } from '../../services/geminiService';
import { PersonalityQuestion, PersonalityTestResult, UserProfile } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, ReferenceLine, Cell
} from 'recharts';
import { 
  ChevronRight, ChevronLeft, Brain, Briefcase, Lightbulb, 
  History, CheckCircle2, Loader2, Sparkles, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const QUESTIONS: PersonalityQuestion[] = [
  // Section 1: Work Style and Environment
  {
    id: 'ws1',
    section: 'WORK_STYLE',
    type: 'MULTIPLE_CHOICE',
    question: "What environment do you thrive in?",
    options: ["Fast-paced & Dynamic", "Steady & Predictable", "Collaborative & Team-focused", "Independent & Quiet"]
  },
  {
    id: 'ws2',
    section: 'WORK_STYLE',
    type: 'SUBJECTIVE',
    question: "Describe your ideal workday and how you handle pressure."
  },
  {
    id: 'ws3',
    section: 'WORK_STYLE',
    type: 'MULTIPLE_CHOICE',
    question: "How do you prefer to receive feedback?",
    options: ["Direct & Candid", "Constructive & Gentle", "Data-driven & Objective", "Public Recognition"]
  },
  // Section 2: Skills and Abilities
  {
    id: 'sa1',
    section: 'SKILLS',
    type: 'MULTIPLE_CHOICE',
    question: "Which of these is your strongest soft skill?",
    options: ["Communication", "Problem-solving", "Leadership", "Attention to detail"]
  },
  {
    id: 'sa2',
    section: 'SKILLS',
    type: 'SUBJECTIVE',
    question: "What is a skill you're most proud of and how have you used it?"
  },
  {
    id: 'sa3',
    section: 'SKILLS',
    type: 'MULTIPLE_CHOICE',
    question: "How do you approach learning new technologies?",
    options: ["Hands-on / Trial and error", "Structured courses / Reading", "Watching tutorials", "Mentorship / Pairing"]
  },
  // Section 3: Knowledge and Interest
  {
    id: 'ki1',
    section: 'KNOWLEDGE',
    type: 'MULTIPLE_CHOICE',
    question: "Which field interests you the most?",
    options: ["Technology & Software", "Creative Arts & Design", "Business & Finance", "Healthcare & Science"]
  },
  {
    id: 'ki2',
    section: 'KNOWLEDGE',
    type: 'SUBJECTIVE',
    question: "What is a topic you could talk about for hours?"
  },
  {
    id: 'ki3',
    section: 'KNOWLEDGE',
    type: 'MULTIPLE_CHOICE',
    question: "What motivates you most in a career?",
    options: ["Financial reward", "Making an impact", "Continuous learning", "Work-life balance"]
  }
];

const PersonalityTest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<PersonalityTestResult | null>(null);
  const [history, setHistory] = useState<PersonalityTestResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('skillpath_user');
    if (storedUser) {
      const user = JSON.parse(storedUser) as UserProfile;
      if (user.personalityHistory) {
        setHistory(user.personalityHistory);
      }
    }
  }, []);

  const handleAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    const formattedAnswers = QUESTIONS.map(q => ({
      question: q.question,
      answer: answers[q.id] || ''
    }));

    if (formattedAnswers.some(a => !a.answer)) return;

    setAnalyzing(true);
    try {
      const res = await getAIPersonalityAssessment(formattedAnswers);
      const newResult: PersonalityTestResult = {
        ...res,
        date: new Date().toLocaleDateString()
      };
      
      setResults(newResult);
      
      // Update history
      const newHistory = [newResult, ...history].slice(0, 10);
      setHistory(newHistory);
      
      const storedUser = localStorage.getItem('skillpath_user');
      if (storedUser) {
        const user = JSON.parse(storedUser) as UserProfile;
        user.personalityHistory = newHistory;
        localStorage.setItem('skillpath_user', JSON.stringify(user));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const renderQuestion = () => {
    return (
      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          {currentQuestion.section === 'WORK_STYLE' && <Briefcase className="w-5 h-5 text-indigo-600" />}
          {currentQuestion.section === 'SKILLS' && <Brain className="w-5 h-5 text-purple-600" />}
          {currentQuestion.section === 'KNOWLEDGE' && <Lightbulb className="w-5 h-5 text-amber-600" />}
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {currentQuestion.section.replace('_', ' ')}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 leading-tight">
          {currentQuestion.question}
        </h3>

        {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(currentQuestion.id, opt)}
                className={`p-4 text-left rounded-2xl border-2 transition-all ${
                  answers[currentQuestion.id] === opt
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt}</span>
                  {answers[currentQuestion.id] === opt && <CheckCircle2 className="w-5 h-5" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <textarea
            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[150px] transition-all text-lg"
            placeholder="Share your thoughts here..."
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
          />
        )}

        <div className="flex items-center justify-between pt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-gray-500 font-bold hover:text-gray-800 disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  };

  if (analyzing) {
    return (
      <div className="max-w-3xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Analyzing Your Personality</h2>
          <p className="text-gray-500">Our AI is mapping your traits to the perfect career path...</p>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Assessment Results</h2>
          <button 
            onClick={() => { setResults(null); setAnswers({}); setCurrentStep(0); }}
            className="text-indigo-600 font-bold hover:underline flex items-center gap-2"
          >
            Retake Test
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Summary & Traits */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Who You Are</h3>
                  <p className="text-sm text-gray-500">AI-generated personality profile</p>
                </div>
              </div>
              <div className="text-gray-600 leading-relaxed text-lg italic markdown-body">
                <Markdown>{results.summary}</Markdown>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-10">Personality Traits</h3>
              <div className="space-y-12">
                {results.traits.map((trait, idx) => {
                  const colors = ['#52b788', '#ee9b00', '#0a9396', '#9b5de5', '#f15bb5'];
                  const color = colors[idx % colors.length];
                  // Map -100...100 to 0...100%
                  const position = (trait.value + 100) / 2;
                  const displayValue = Math.abs(trait.value);
                  const displayLabel = trait.value < 0 ? trait.leftLabel : trait.rightLabel;

                  return (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between text-2xl font-light text-gray-500 px-1">
                        <span>{trait.leftLabel}</span>
                        <span>{trait.rightLabel}</span>
                      </div>
                      
                      <div className="relative h-2.5 w-full rounded-full" style={{ backgroundColor: color, opacity: 0.8 }}>
                        {/* Thumb */}
                        <motion.div 
                          initial={{ left: '50%' }}
                          animate={{ left: `${position}%` }}
                          transition={{ type: 'spring', stiffness: 40, damping: 12 }}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full border-4 border-white shadow-md z-10"
                          style={{ backgroundColor: color }}
                        />
                      </div>

                      <div className="text-center pt-2">
                        <span className="text-2xl font-bold text-gray-700">
                          {displayValue}% 
                        </span>
                        <span className="text-2xl font-bold ml-2" style={{ color: color }}>
                          {displayLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Career Path & Timeline */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200"
            >
              <h3 className="text-xl font-bold mb-6">Career Alignment</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-indigo-100 text-sm mb-3 font-medium uppercase tracking-wider">Top Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {results.industries.map((ind, i) => (
                      <span key={i} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-indigo-100 text-sm mb-3 font-medium uppercase tracking-wider">Recommended Roles</p>
                  <div className="space-y-2">
                    {results.roles.map((role, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="font-medium">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {history.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800">Growth Timeline</h3>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...history].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-50 text-xs">
                                <p className="font-bold">{payload[0].payload.date}</p>
                                <p className="text-indigo-600">Score: {payload[0].value}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="overallScore" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#6366f1' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">
                  Career alignment score over your last {history.length} tests
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Personality Insights</h2>
              <p className="text-gray-500">Discover your path through 3 key dimensions</p>
            </div>
            {history.length > 0 && (
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all"
                title="View History"
              >
                <History className="w-6 h-6" />
              </button>
            )}
          </div>

          {!showHistory ? (
            <div className="space-y-8">
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-600"
                />
              </div>

              <AnimatePresence mode="wait">
                {renderQuestion()}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Past Assessments</h3>
                <button onClick={() => setShowHistory(false)} className="text-indigo-600 font-bold text-sm">Back to Test</button>
              </div>

              {history.length > 1 && (
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Progress Over Time</span>
                  </div>
                  <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...history].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="overallScore" 
                          stroke="#6366f1" 
                          strokeWidth={2} 
                          dot={{ r: 3, fill: '#6366f1' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer" onClick={() => setResults(h)}>
                    <div>
                      <p className="font-bold text-gray-800">{h.date}</p>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{h.summary}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600">{h.overallScore}%</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Alignment</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalityTest;
