'use client';

import { useState, useEffect } from 'react';
import { User, Exam } from '../types';
import { getExams, deleteExam, getUsers, getCurrentUser } from '../lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, LogOut, BookOpen, Users, FileText } from 'lucide-react';
import { CreateExam } from './CreateExam';
import { TeacherExamView } from './TeacherExamView';
import { Badge } from './ui/badge';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

export function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allExams = await getExams();
      const teacherExams = allExams.filter(e => e.createdBy === user.id);
      setExams(teacherExams);

      const allUsers = await getUsers();
      const studentUsers = allUsers.filter(u => u.role === 'student');
      setStudents(studentUsers);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(examId);
        await loadData();
        if (selectedExam?.id === examId) {
          setSelectedExam(null);
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const handleExamCreated = () => {
    setShowCreateExam(false);
    loadData();
  };

  if (showCreateExam) {
    return (
      <CreateExam
        user={user}
        onBack={() => setShowCreateExam(false)}
        onExamCreated={handleExamCreated}
      />
    );
  }

  if (selectedExam) {
    return (
      <TeacherExamView
        exam={selectedExam}
        onBack={() => {
          setSelectedExam(null);
          loadData();
        }}
        onDelete={() => handleDeleteExam(selectedExam.id)}
      />
    );
  }

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
                <h1 className="text-2xl">Teacher Dashboard</h1>
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
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{exams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{exams.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Exams</CardTitle>
                <CardDescription>Manage your exams and view statistics</CardDescription>
              </div>
              <Button onClick={() => setShowCreateExam(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No exams created yet</p>
                <Button onClick={() => setShowCreateExam(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Exam
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedExam(exam)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1">{exam.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{exam.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{exam.questions.length} questions</span>
                          <span>{exam.duration} minutes</span>
                          <span>{exam.assignedStudents.length} students assigned</span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
