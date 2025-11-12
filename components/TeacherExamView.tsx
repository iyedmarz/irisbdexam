"use client";

import { useState, useEffect } from "react";
import { Exam, ExamSubmission, User } from "../types";
import { getExamSubmissions, getUsers } from "../lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Download,
  Trash2,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";
import { exportToCSV, exportToPDF } from "../lib/export";
import { toast } from "sonner";

interface TeacherExamViewProps {
  exam: Exam;
  onBack: () => void;
  onDelete: () => void;
}

export function TeacherExamView({
  exam,
  onBack,
  onDelete,
}: TeacherExamViewProps) {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const examSubmissions = await getExamSubmissions(exam.id);
        setSubmissions(examSubmissions);

        const allUsers = await getUsers();
        const studentUsers = allUsers.filter((u) => u.role === "student");
        setStudents(studentUsers);
      } catch (error) {
        console.error("Error loading exam data:", error);
      }
    };
    loadData();
  }, [exam.id]);

  const assignedStudents = students.filter((s) =>
    exam.assignedStudents.includes(s.id)
  );
  const submissionRate =
    assignedStudents.length > 0
      ? ((submissions.length / assignedStudents.length) * 100).toFixed(1)
      : "0";

  const averageScore =
    submissions.length > 0
      ? (
          submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length
        ).toFixed(1)
      : "0";

  const averagePercentage =
    submissions.length > 0
      ? (
          submissions.reduce(
            (sum, s) => sum + (s.score / s.totalQuestions) * 100,
            0
          ) / submissions.length
        ).toFixed(1)
      : "0";

  const handleExportCSV = () => {
    exportToCSV(submissions, exam, students);
    toast.success("Exported to CSV successfully!");
  };

  const handleExportPDF = () => {
    exportToPDF(submissions, exam, students);
    toast.success("Opening print dialog...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl">{exam.title}</h1>
                <p className="text-sm text-gray-500">
                  Created on {new Date(exam.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={onDelete} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Assigned Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{assignedStudents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {submissionRate}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {averageScore}/{exam.questions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {averagePercentage}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Duration</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{exam.duration} min</div>
              <p className="text-xs text-muted-foreground">
                {exam.questions.length} questions
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>
                  View all exam submissions and scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => {
                        const student = students.find(
                          (s) => s.id === submission.studentId
                        );
                        const percentage = (
                          (submission.score / submission.totalQuestions) *
                          100
                        ).toFixed(1);
                        const passed = parseFloat(percentage) >= 50;

                        return (
                          <TableRow key={submission.id}>
                            <TableCell>{student?.name || "Unknown"}</TableCell>
                            <TableCell>
                              {submission.score}/{submission.totalQuestions}
                            </TableCell>
                            <TableCell>{percentage}%</TableCell>
                            <TableCell>
                              <Badge
                                variant={passed ? "default" : "destructive"}
                              >
                                {passed ? "Passed" : "Failed"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                submission.submittedAt
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Exam Questions</CardTitle>
                <CardDescription>
                  Review all questions in this exam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {exam.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <p className="mb-3">
                      <strong>Question {index + 1}:</strong> {question.text}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => {
                        const isCorrect =
                          question.correctAnswers.includes(oIndex);
                        return (
                          <div
                            key={oIndex}
                            className={`p-2 rounded ${
                              isCorrect
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {isCorrect && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-100 text-green-700"
                                >
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Students</CardTitle>
                <CardDescription>
                  Students who can take this exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedStudents.map((student) => {
                      const hasSubmitted = submissions.some(
                        (s) => s.studentId === student.id
                      );
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.username}</TableCell>
                          <TableCell>
                            {hasSubmitted ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
