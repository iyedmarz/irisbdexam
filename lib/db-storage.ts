/**
 * Database Storage Layer
 * This file provides the same interface as localStorage storage.ts
 * but uses PostgreSQL instead
 */

import { User, Exam, ExamSubmission, ExamAttempt } from '../types';
import * as queries from './queries';

// =============================================
// USER FUNCTIONS
// =============================================

export const getUsers = async (): Promise<User[]> => {
  return await queries.getUsers();
};

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  return await queries.authenticateUser(username, password);
};

// For session management - we'll use cookies/JWT instead of storing in DB
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
  return await queries.getExams();
};

export const getExamById = async (id: string): Promise<Exam | null> => {
  return await queries.getExamById(id);
};

export const saveExam = async (exam: Exam): Promise<void> => {
  return await queries.saveExam(exam);
};

export const deleteExam = async (id: string): Promise<void> => {
  return await queries.deleteExam(id);
};

// =============================================
// SUBMISSION FUNCTIONS
// =============================================

export const getSubmissions = async (): Promise<ExamSubmission[]> => {
  return await queries.getSubmissions();
};

export const saveSubmission = async (submission: ExamSubmission): Promise<void> => {
  return await queries.saveSubmission(submission);
};

export const getStudentSubmissions = async (studentId: string): Promise<ExamSubmission[]> => {
  return await queries.getStudentSubmissions(studentId);
};

export const getExamSubmissions = async (examId: string): Promise<ExamSubmission[]> => {
  return await queries.getExamSubmissions(examId);
};

export const hasStudentSubmitted = async (examId: string, studentId: string): Promise<boolean> => {
  return await queries.hasStudentSubmitted(examId, studentId);
};

// =============================================
// EXAM ATTEMPT FUNCTIONS
// =============================================

export const getExamAttempt = async (examId: string, studentId: string): Promise<ExamAttempt | null> => {
  return await queries.getExamAttempt(examId, studentId);
};

export const saveExamAttempt = async (attempt: ExamAttempt): Promise<void> => {
  return await queries.saveExamAttempt(attempt);
};

export const deleteExamAttempt = async (examId: string, studentId: string): Promise<void> => {
  return await queries.deleteExamAttempt(examId, studentId);
};
