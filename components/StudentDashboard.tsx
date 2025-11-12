'use client';

import { useState, useEffect } from 'react';
import { User, Exam, ExamSubmission } from '../types';
import { getExams, getStudentSubmissions } from '../lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LogOut, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { ExamTaking } from './ExamTaking';
import { ExamResults } from './ExamResults';
import { Badge } from './ui/badge';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const allExams = await getExams();
      const studentExams = allExams.filter(e => e.assignedStudents.includes(user.id));
      setAvailableExams(studentExams);

      const studentSubmissions = await getStudentSubmissions(user.id);
      setSubmissions(studentSubmissions);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleExamComplete = () => {
    setSelectedExam(null);
    loadData();
  };

  const isExamCompleted = (examId: string) => {
    return submissions.some(s => s.examId === examId);
  };

  const getSubmissionForExam = (examId: string) => {
    return submissions.find(s => s.examId === examId);
  };

  if (selectedExam) {
    return (
      <ExamTaking
        exam={selectedExam}
        student={user}
        onComplete={handleExamComplete}
        onBack={() => setSelectedExam(null)}
      />
    );
  }

  if (selectedSubmission) {
    const exam = availableExams.find(e => e.id === selectedSubmission.examId);
    if (!exam) return null;
    
    return (
      <ExamResults
        submission={selectedSubmission}
        exam={exam}
        onBack={() => setSelectedSubmission(null)}
      />
    );
  }

  const completedCount = submissions.length;
  const pendingCount = availableExams.length - completedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">Student Dashboard</h1>
                <p className="text-sm text-gray-500">{user.name}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{availableExams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{completedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Exams</CardTitle>
            <CardDescription>Exams assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {availableExams.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No exams available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableExams.map((exam) => {
                  const completed = isExamCompleted(exam.id);
                  const submission = getSubmissionForExam(exam.id);
                  
                  return (
                    <div
                      key={exam.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3>{exam.title}</h3>
                            {completed && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{exam.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{exam.questions.length} questions</span>
                            <span>{exam.duration} minutes</span>
                            {completed && submission && (
                              <span className="text-green-600">
                                Score: {submission.score}/{submission.totalQuestions}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {completed && submission ? (
                            <Button
                              onClick={() => setSelectedSubmission(submission)}
                              variant="outline"
                              size="sm"
                            >
                              View Results
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setSelectedExam(exam)}
                              size="sm"
                            >
                              Start Exam
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {completedCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>Your exam performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.slice().reverse().map((submission) => {
                  const exam = availableExams.find(e => e.id === submission.examId);
                  if (!exam) return null;
                  
                  const percentage = ((submission.score / submission.totalQuestions) * 100).toFixed(1);
                  
                  return (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="mb-1">{exam.title}</h3>
                          <p className="text-sm text-gray-500">
                            Submitted {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-1">
                            {submission.score}/{submission.totalQuestions}
                          </div>
                          <Badge variant={parseFloat(percentage) >= 50 ? 'default' : 'destructive'}>
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
