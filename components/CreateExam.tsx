"use client";

import { useState, useEffect } from "react";
import { User, Exam, Question } from "../types";
import { saveExam, getUsers } from "../lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface CreateExamProps {
  user: User;
  onBack: () => void;
  onExamCreated: () => void;
}

export function CreateExam({ user, onBack, onExamCreated }: CreateExamProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "",
      options: ["", "", "", ""],
      correctAnswers: [],
    },
  ]);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const allUsers = await getUsers();
        setStudents(allUsers.filter((u) => u.role === "student"));
      } catch (error) {
        console.error("Error loading students:", error);
      }
    };
    loadStudents();
  }, []);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      options: ["", "", "", ""],
      correctAnswers: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    const correctAnswers = [...updated[qIndex].correctAnswers];
    const index = correctAnswers.indexOf(oIndex);

    if (index > -1) {
      correctAnswers.splice(index, 1);
    } else {
      correctAnswers.push(oIndex);
    }

    updated[qIndex].correctAnswers = correctAnswers;
    setQuestions(updated);
  };

  const toggleStudent = (studentId: string) => {
    if (assignedStudents.includes(studentId)) {
      setAssignedStudents(assignedStudents.filter((id) => id !== studentId));
    } else {
      setAssignedStudents([...assignedStudents, studentId]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return;
      }
      if (q.correctAnswers.length === 0) {
        toast.error(`Question ${i + 1} has no correct answer selected`);
        return;
      }
    }

    if (assignedStudents.length === 0) {
      toast.error("Please assign at least one student");
      return;
    }

    const exam: Exam = {
      id: Date.now().toString(),
      title,
      description,
      duration,
      questions,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      assignedStudents,
    };

    try {
      await saveExam(exam);
      toast.success("Exam created successfully!");
      onExamCreated();
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error("Failed to save exam. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Exam
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>
              Set up the basic information for your exam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                placeholder="e.g., Mathematics Final Exam - Bac+3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the exam"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  Add multiple choice questions (multiple answers possible)
                </CardDescription>
              </div>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <Label>Question {qIndex + 1}</Label>
                  {questions.length > 1 && (
                    <Button
                      onClick={() => removeQuestion(qIndex)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Enter your question"
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(qIndex, "text", e.target.value)
                  }
                  rows={2}
                />
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">
                    Answer Options (check all correct answers)
                  </Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <Checkbox
                        checked={question.correctAnswers.includes(oIndex)}
                        onCheckedChange={() =>
                          toggleCorrectAnswer(qIndex, oIndex)
                        }
                      />
                      <Input
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Students</CardTitle>
            <CardDescription>
              Select students who will take this exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={assignedStudents.includes(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                  />
                  <Label className="cursor-pointer">{student.name}</Label>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-sm text-gray-500">No students available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
