
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
}

export interface SkillNode {
  id: string;
  label: string;
  status: 'locked' | 'available' | 'completed';
  description: string;
  children?: SkillNode[];
}

export interface ResumeScanResult {
  score: number;
  missingSkills: string[];
  improvementTips: string[];
  suggestedJobs: string[];
}
