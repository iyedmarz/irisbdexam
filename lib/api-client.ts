/**
 * Client-side API wrapper for database operations
 * This replaces direct db-storage imports in client components
 */

import { User, Exam, ExamSubmission, ExamAttempt } from '../types';

// =============================================
// USER FUNCTIONS
// =============================================

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  const data = await response.json();
  return data.users || [];
};

// Session management remains client-side
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = sessionStorage.getItem('current_user');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    sessionStorage.setItem('current_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('current_user');
  }
};

// =============================================
// EXAM FUNCTIONS
// =============================================

export const getExams = async (): Promise<Exam[]> => {
  const response = await fetch('/api/exams');
  const data = await response.json();
  return data.exams || [];
};

export const getExamById = async (id: string): Promise<Exam | null> => {
  const response = await fetch(`/api/exams/${id}`);
  
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.exam;
};

export const saveExam = async (exam: Exam): Promise<void> => {
  const response = await fetch('/api/exams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exam),
  });

  if (!response.ok) {
    throw new Error('Failed to save exam');
  }
};

export const deleteExam = async (id: string): Promise<void> => {
  const response = await fetch(`/api/exams?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete exam');
  }
};

// =============================================
// SUBMISSION FUNCTIONS
// =============================================

export const getSubmissions = async (): Promise<ExamSubmission[]> => {
  const response = await fetch('/api/submissions');
  const data = await response.json();
  return data.submissions || [];
};

export const saveSubmission = async (submission: ExamSubmission): Promise<void> => {
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error('Failed to save submission');
  }
};

export const getStudentSubmissions = async (studentId: string): Promise<ExamSubmission[]> => {
  const response = await fetch(`/api/submissions?studentId=${studentId}`);
  const data = await response.json();
  return data.submissions || [];
};

export const getExamSubmissions = async (examId: string): Promise<ExamSubmission[]> => {
  const response = await fetch(`/api/submissions?examId=${examId}`);
  const data = await response.json();
  return data.submissions || [];
};

export const hasStudentSubmitted = async (examId: string, studentId: string): Promise<boolean> => {
  const submissions = await getExamSubmissions(examId);
  return submissions.some(s => s.studentId === studentId);
};

// =============================================
// EXAM ATTEMPT FUNCTIONS
// =============================================

export const getExamAttempt = async (examId: string, studentId: string): Promise<ExamAttempt | null> => {
  const response = await fetch(`/api/attempts?examId=${examId}&studentId=${studentId}`);
  const data = await response.json();
  return data.attempt || null;
};

export const saveExamAttempt = async (attempt: ExamAttempt): Promise<void> => {
  const response = await fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt),
  });

  if (!response.ok) {
    throw new Error('Failed to save attempt');
  }
};

export const deleteExamAttempt = async (examId: string, studentId: string): Promise<void> => {
  const response = await fetch(`/api/attempts?examId=${examId}&studentId=${studentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete attempt');
  }
};
