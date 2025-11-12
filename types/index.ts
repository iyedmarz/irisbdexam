export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[]; // indices of correct options (multiple answers possible)
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  createdBy: string; // teacher id
  createdAt: string;
  assignedStudents: string[]; // student ids
}

export interface StudentAnswer {
  questionId: string;
  selectedAnswers: number[]; // indices of selected options
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  answers: StudentAnswer[];
  submittedAt: string;
  score: number;
  totalQuestions: number;
}

export interface ExamAttempt {
  examId: string;
  studentId: string;
  startedAt: string;
  answers: StudentAnswer[];
}
