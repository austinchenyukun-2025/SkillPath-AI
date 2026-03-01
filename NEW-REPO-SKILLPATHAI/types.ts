
export enum UserRole {
  JOBSEEKER = 'JOBSEEKER',
  RECRUITER = 'RECRUITER'
}

export enum StudyLevel {
  BELOW_UNI = 'BELOW_UNI',
  UNI = 'UNI',
  POST_GRAD = 'POST_GRAD'
}

export interface UserProfile {
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  studyLevel: StudyLevel;
  learningInterest?: string;
  personalityHistory?: PersonalityTestResult[];
  skillProgress?: Record<string, number>; // skillId -> completionCount
  createdAt?: string;
}

export interface PersonalityTrait {
  trait: string;
  value: number; // -100 to 100
  leftLabel: string;
  rightLabel: string;
}

export interface PersonalityTestResult {
  date: string;
  summary: string;
  industries: string[];
  roles: string[];
  traits: PersonalityTrait[];
  overallScore: number; // 0-100 for timeline progress
}

export interface PersonalityQuestion {
  id: string;
  section: 'WORK_STYLE' | 'SKILLS' | 'KNOWLEDGE';
  type: 'MULTIPLE_CHOICE' | 'SUBJECTIVE';
  question: string;
  options?: string[];
}

export interface SkillNode {
  id: string;
  label: string;
  status: 'locked' | 'available' | 'completed';
  description: string;
  children?: SkillNode[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of options
  explanation: string;
}

export interface Quiz {
  skillId: string;
  skillLabel: string;
  questions: QuizQuestion[];
  summary?: string;
  wrongAnswers?: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
}

export interface LearningTopic {
  id: string;
  label: string;
  description: string;
}

export interface ResumeScanResult {
  score: number;
  missingSkills: string[];
  improvementTips: string[];
  suggestedJobs: string[];
}
