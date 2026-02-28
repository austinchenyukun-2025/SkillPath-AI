
import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { UserProfile, SkillNode, Quiz, QuizQuestion, LearningTopic } from '../../types';
import { generateSkillTree, chatWithCoach, generateQuiz, getProactiveCoachMessage, getLearningTopics, teachTopic, generateQuizSummary } from '../../services/geminiService';

const generateLevels = (baseId: string, baseLabel: string, baseDescription: string) => {
  const levels: SkillNode[] = [];
  for (let i = 1; i <= 5; i++) {
    levels.push({
      id: `${baseId}-lvl-${i}`,
      label: `${baseLabel} ${i}`,
      description: `${baseDescription} (Level ${i})`,
      status: 'locked'
    });
  }
  // Link them linearly
  for (let i = 0; i < 4; i++) {
    levels[i].children = [levels[i+1]];
  }
  return levels[0];
};

const FIXED_SOFT_SKILLS: SkillNode = {
  id: 'soft-skills',
  label: 'Soft Skills',
  status: 'available',
  description: 'Master non-technical skills essential for professional growth.',
  children: [
    generateLevels('ss-1', 'Communication', 'Effectively convey ideas.'),
    generateLevels('ss-2', 'Leadership', 'Guide teams towards success.'),
    generateLevels('ss-3', 'Time Management', 'Optimize your daily schedule.')
  ]
};

const FIXED_LANGUAGES: SkillNode = {
  id: 'languages',
  label: 'Languages',
  status: 'available',
  description: 'Common professional languages.',
  children: [
    generateLevels('lang-1', 'English', 'Standard global business language.'),
    generateLevels('lang-2', 'Spanish', 'Conversational greetings and basic phrases.'),
    generateLevels('lang-3', 'Mandarin', 'Simple business etiquette.')
  ]
};

const SkillTree: React.FC<{ user: UserProfile, onUpdateUser: (user: UserProfile) => void }> = ({ user, onUpdateUser }) => {
  const [customSkillTree, setCustomSkillTree] = useState<SkillNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Learning Flow State
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null);
  const [teachingContent, setTeachingContent] = useState('');
  const [isTeaching, setIsTeaching] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [teachingLoading, setTeachingLoading] = useState(false);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  useEffect(() => {
    const fetchCustomTree = async () => {
      const interest = user.learningInterest || 'Software Engineering';
      setLoading(true);
      try {
        const tree = await generateSkillTree(interest);
        // Transform the generated tree to have 5 levels for each leaf
        if (tree.children) {
          tree.children = tree.children.map((child: any) => ({
            ...child,
            children: child.children ? child.children.map((subChild: any) => generateLevels(subChild.id, subChild.label, subChild.description)) : []
          }));
        }
        setCustomSkillTree({ ...tree, status: 'available' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomTree();
  }, [user.learningInterest]);

  const getCompletionCount = (nodeId: string) => {
    return user.skillProgress?.[nodeId] || 0;
  };

  const isNodeUnlocked = (node: SkillNode, parent?: SkillNode) => {
    // Root nodes are always available
    if (node.id === 'soft-skills' || node.id === 'languages' || (customSkillTree && node.id === customSkillTree.id)) return true;
    
    // If it's a level node (e.g., ss-1-lvl-1)
    const levelMatch = node.id.match(/-lvl-(\d+)$/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      if (level === 1) return true; // Level 1 is always unlocked if its parent is unlocked
      
      // Get previous level ID
      const baseId = node.id.replace(/-lvl-\d+$/, '');
      const prevLevelId = `${baseId}-lvl-${level - 1}`;
      const prevCompletionCount = getCompletionCount(prevLevelId);
      
      return prevCompletionCount >= 5;
    }

    return true; // Default to true for category nodes
  };

  const handleNodeClick = async (node: SkillNode) => {
    if (!isNodeUnlocked(node)) return;
    
    setSelectedNode(node);
    setCoachResponse('Thinking...');
    setShowQuiz(false);
    setQuiz(null);
    setQuizCompleted(false);
    setTopics([]);
    setSelectedTopic(null);
    setTeachingContent('');
    setIsTeaching(false);
    
    setTopicsLoading(true);
    try {
      const proactiveMsg = await getProactiveCoachMessage(node.label, node.description, user.name);
      setCoachResponse(proactiveMsg || '');
      
      const topicsData = await getLearningTopics(node.label, node.description);
      setTopics(topicsData.topics || []);
    } catch (e) {
      setCoachResponse(`Hello! I'm your AI Coach. How can I help you master ${node.label} today?`);
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleTopicSelect = async (topic: LearningTopic) => {
    if (!selectedNode) return;
    setSelectedTopic(topic);
    setIsTeaching(true);
    setTeachingLoading(true);
    setTeachingContent('');
    setShowQuiz(false);
    
    try {
      const content = await teachTopic(topic.label, selectedNode.label, user.name);
      setTeachingContent(content || '');
    } catch (e) {
      setTeachingContent('Sorry, I encountered an error while preparing the lesson.');
    } finally {
      setTeachingLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage) return;
    const msg = chatMessage;
    setChatMessage('');
    setCoachResponse('Thinking...');
    try {
      const response = await chatWithCoach(msg, (selectedTopic?.label || selectedNode?.label) || 'General Career Path');
      setCoachResponse(response || '');
    } catch (e) {
      setCoachResponse("Sorry, I'm busy right now.");
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedNode || !selectedTopic) return;
    setQuizLoading(true);
    setShowQuiz(true);
    setUserAnswers([]);
    try {
      const quizData = await generateQuiz(selectedTopic.label, selectedTopic.description);
      setQuiz({
        skillId: selectedNode.id,
        skillLabel: selectedTopic.label,
        questions: quizData.questions
      });
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setQuizCompleted(false);
      setSelectedOption(null);
      setShowExplanation(false);
    } catch (e) {
      console.error(e);
      setShowQuiz(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    setUserAnswers(prev => [...prev, index]);
    if (quiz && index === quiz.questions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizLoading(true);
      try {
        const wrongAnswers = quiz.questions.map((q, i) => ({
          question: q.question,
          userAnswer: q.options[userAnswers[i]],
          correctAnswer: q.options[q.correctAnswer],
          explanation: q.explanation,
          isCorrect: userAnswers[i] === q.correctAnswer
        })).filter(a => !a.isCorrect);

        const summary = await generateQuizSummary(quiz.skillLabel, quizScore, quiz.questions.length, wrongAnswers);
        
        setQuiz(prev => prev ? { ...prev, summary, wrongAnswers } : null);
        
        // Update user progress
        const newProgress = { ...(user.skillProgress || {}) };
        newProgress[selectedNode.id] = (newProgress[selectedNode.id] || 0) + 1;
        onUpdateUser({ ...user, skillProgress: newProgress });
        
        setQuizCompleted(true);
      } catch (e) {
        console.error(e);
      } finally {
        setQuizLoading(false);
      }
    }
  };

  const renderTree = (node: SkillNode) => {
    const unlocked = isNodeUnlocked(node);
    const completions = getCompletionCount(node.id);
    const isLevelNode = node.id.includes('-lvl-');

    return (
      <div key={node.id} className="flex flex-col items-center">
        <button
          onClick={() => handleNodeClick(node)}
          className={`p-4 rounded-2xl border-2 transition-all transform hover:scale-105 ${
            completions >= 5 ? 'bg-green-100 border-green-500 text-green-800' :
            unlocked ? 'bg-indigo-50 border-indigo-500 text-indigo-800' :
            'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
          } min-w-[140px] shadow-sm relative`}
        >
          <span className="font-bold">{node.label}</span>
          {isLevelNode && unlocked && (
            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full font-black">
              {completions}/5
            </div>
          )}
        </button>
        
        {node.children && node.children.length > 0 && (
          <div className={`mt-8 flex ${isLevelNode ? 'flex-col' : 'gap-8'}`}>
            {node.children.map(child => (
              <div key={child.id} className="relative">
                <div className={`absolute ${isLevelNode ? 'top-[-32px] left-1/2 h-[32px] w-[2px]' : 'top-[-32px] left-1/2 h-[32px] w-[2px]'} bg-gray-200 -translate-x-1/2`}></div>
                {renderTree(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800">Skill Tree Path</h1>
        <p className="text-gray-500 mt-4 text-lg">Master each level 5 times to unlock the next challenge.</p>
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
              <div className="flex items-center gap-4">
                {isTeaching && (
                  <button onClick={() => setIsTeaching(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                )}
                <div>
                  <h3 className="text-xl font-bold">{selectedTopic ? selectedTopic.label : selectedNode.label}</h3>
                  <p className="text-indigo-100 text-sm">{selectedTopic ? selectedTopic.description : selectedNode.description}</p>
                </div>
              </div>
              <button onClick={() => {setSelectedNode(null); setCoachResponse(''); setShowQuiz(false); setIsTeaching(false); setSelectedTopic(null);}} className="p-2 hover:bg-white/10 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4 min-h-[300px]">
              {quizLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-600 font-bold">Processing...</p>
                </div>
              ) : !isTeaching && !showQuiz ? (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">🤖</div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-gray-700 max-w-[80%] markdown-body">
                      <Markdown>{coachResponse}</Markdown>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select a topic to learn:</h4>
                    {topicsLoading ? (
                      <div className="flex items-center gap-2 text-indigo-600 font-bold animate-pulse">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        Preparing topics...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {topics.map(topic => (
                          <button
                            key={topic.id}
                            onClick={() => handleTopicSelect(topic)}
                            className="text-left p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-500 hover:shadow-md transition group flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-gray-800">{topic.label}</div>
                              <div className="text-xs text-gray-500">{topic.description}</div>
                            </div>
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : isTeaching && !showQuiz ? (
                <div className="space-y-6">
                  {teachingLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-indigo-600 font-bold">Preparing your lesson...</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">🤖</div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed markdown-body">
                          <Markdown>{teachingContent}</Markdown>
                        </div>
                      </div>
                      
                      <div className="flex justify-center pt-4">
                        <button 
                          onClick={handleStartQuiz}
                          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                          Ready for the Quiz?
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {quizCompleted ? (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="text-center py-4">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-gray-800">Round Completed!</h3>
                        <p className="text-gray-500">You scored <span className="text-indigo-600 font-black text-2xl">{quizScore}</span> out of {quiz?.questions.length}</p>
                        <p className="text-sm text-indigo-500 font-bold mt-2">Progress: {getCompletionCount(selectedNode.id)}/5 rounds</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                        <h4 className="font-bold text-indigo-800 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          Performance Summary
                        </h4>
                        <div className="text-gray-700 italic leading-relaxed markdown-body">
                          <Markdown>{quiz?.summary}</Markdown>
                        </div>
                      </div>

                      {quiz?.wrongAnswers && quiz.wrongAnswers.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-red-600 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            Review Wrong Questions
                          </h4>
                          <div className="space-y-4">
                            {quiz.wrongAnswers.map((wa, i) => (
                              <div key={i} className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-2">
                                <p className="font-bold text-gray-800 text-sm">{wa.question}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="text-red-600">Your Answer: <span className="font-bold">{wa.userAnswer}</span></div>
                                  <div className="text-green-600">Correct Answer: <span className="font-bold">{wa.correctAnswer}</span></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-2 bg-white/50 p-2 rounded-lg">{wa.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 justify-center pt-6">
                        <button 
                          onClick={() => {setShowQuiz(false); setIsTeaching(false); setSelectedTopic(null);}}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg"
                        >
                          Back to Skills
                        </button>
                      </div>
                    </div>
                  ) : quiz && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        <span className="text-xs font-bold text-gray-400">Score: {quizScore}</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">{quiz.questions[currentQuestionIndex].question}</h4>
                      <div className="space-y-3">
                        {quiz.questions[currentQuestionIndex].options.map((option, idx) => (
                          <button
                            key={idx}
                            disabled={showExplanation}
                            onClick={() => handleOptionSelect(idx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              showExplanation 
                                ? idx === quiz.questions[currentQuestionIndex].correctAnswer
                                  ? 'bg-green-50 border-green-500 text-green-800'
                                  : idx === selectedOption
                                    ? 'bg-red-50 border-red-500 text-red-800'
                                    : 'bg-white border-gray-100 text-gray-400'
                                : 'bg-white border-gray-100 hover:border-indigo-500 text-gray-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {showExplanation && (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fadeIn">
                          <p className="text-sm text-indigo-800">
                            <span className="font-bold">Explanation:</span> {quiz.questions[currentQuestionIndex].explanation}
                          </p>
                          <button 
                            onClick={handleNextQuestion}
                            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
                          >
                            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!showQuiz && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTree;


