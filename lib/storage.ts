import { User, Exam, ExamSubmission, ExamAttempt } from '../types';

const STORAGE_KEYS = {
  USERS: 'iris_exam_users',
  EXAMS: 'iris_exam_exams',
  SUBMISSIONS: 'iris_exam_submissions',
  CURRENT_USER: 'iris_exam_current_user',
  ATTEMPTS: 'iris_exam_attempts',
};

// Initialize with default users
const initializeDefaultUsers = () => {
  const users = getUsers();
  if (users.length === 0) {
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'teacher',
        password: 'teacher123',
        role: 'teacher',
        name: 'Prof. Martin Dubois',
      },
      {
        id: '2',
        username: 'student',
        password: 'student123',
        role: 'student',
        name: 'Sophie Laurent',
      },
      {
        id: '3',
        username: 'student2',
        password: 'student123',
        role: 'student',
        name: 'Thomas Bernard',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const authenticateUser = (username: string, password: string): User | null => {
  initializeDefaultUsers();
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

export const getExams = (): Exam[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
  return data ? JSON.parse(data) : [];
};

export const saveExam = (exam: Exam) => {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === exam.id);
  if (index >= 0) {
    exams[index] = exam;
  } else {
    exams.push(exam);
  }
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
};

export const getExamById = (id: string): Exam | null => {
  const exams = getExams();
  return exams.find(e => e.id === id) || null;
};

export const deleteExam = (id: string) => {
  const exams = getExams().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
};

export const getSubmissions = (): ExamSubmission[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return data ? JSON.parse(data) : [];
};

export const saveSubmission = (submission: ExamSubmission) => {
  const submissions = getSubmissions();
  submissions.push(submission);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
};

export const getStudentSubmissions = (studentId: string): ExamSubmission[] => {
  return getSubmissions().filter(s => s.studentId === studentId);
};

export const getExamSubmissions = (examId: string): ExamSubmission[] => {
  return getSubmissions().filter(s => s.examId === examId);
};

export const getExamAttempt = (examId: string, studentId: string): ExamAttempt | null => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
  const attempts: ExamAttempt[] = data ? JSON.parse(data) : [];
  return attempts.find(a => a.examId === examId && a.studentId === studentId) || null;
};

export const saveExamAttempt = (attempt: ExamAttempt) => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
  const attempts: ExamAttempt[] = data ? JSON.parse(data) : [];
  const index = attempts.findIndex(a => a.examId === attempt.examId && a.studentId === attempt.studentId);
  if (index >= 0) {
    attempts[index] = attempt;
  } else {
    attempts.push(attempt);
  }
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
};

export const deleteExamAttempt = (examId: string, studentId: string) => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
  const attempts: ExamAttempt[] = data ? JSON.parse(data) : [];
  const filtered = attempts.filter(a => !(a.examId === examId && a.studentId === studentId));
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(filtered));
};

export const hasStudentSubmitted = (examId: string, studentId: string): boolean => {
  const submissions = getSubmissions();
  return submissions.some(s => s.examId === examId && s.studentId === studentId);
};
