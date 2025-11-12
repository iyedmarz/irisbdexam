"use client";

import { useState, useEffect, useRef } from "react";
import { User, Exam, StudentAnswer, ExamSubmission } from "../types";
import {
  saveSubmission,
  saveExamAttempt,
  getExamAttempt,
  deleteExamAttempt,
} from "../lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ArrowLeft, Clock, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ExamTakingProps {
  exam: Exam;
  student: User;
  onComplete: () => void;
  onBack: () => void;
}

export function ExamTaking({
  exam,
  student,
  onComplete,
  onBack,
}: ExamTakingProps) {
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<string>("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initExam = async () => {
      try {
        // Check for existing attempt
        const existingAttempt = await getExamAttempt(exam.id, student.id);

        if (existingAttempt) {
          const elapsed = Math.floor(
            (Date.now() - new Date(existingAttempt.startedAt).getTime()) / 1000
          );
          const remaining = exam.duration * 60 - elapsed;

          if (remaining > 0) {
            setAnswers(existingAttempt.answers);
            setStartTime(existingAttempt.startedAt);
            setTimeRemaining(remaining);
          } else {
            // Time expired, auto-submit
            autoSubmit(existingAttempt.answers);
            return;
          }
        } else {
          // New attempt
          const now = new Date().toISOString();
          setStartTime(now);
          setTimeRemaining(exam.duration * 60);

          const initialAnswers = exam.questions.map((q) => ({
            questionId: q.id,
            selectedAnswers: [],
          }));
          setAnswers(initialAnswers);

          await saveExamAttempt({
            examId: exam.id,
            studentId: student.id,
            startedAt: now,
            answers: initialAnswers,
          });
        }
      } catch (error) {
        console.error("Error initializing exam:", error);
      }
    };

    initExam();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Prevent accidental page close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Auto-save answers periodically
    const autoSave = async () => {
      if (startTime) {
        try {
          await saveExamAttempt({
            examId: exam.id,
            studentId: student.id,
            startedAt: startTime,
            answers,
          });
        } catch (error) {
          console.error("Error auto-saving:", error);
        }
      }
    };
    autoSave();
  }, [answers]);

  const autoSubmit = (answersToSubmit: StudentAnswer[]) => {
    submitExam(answersToSubmit);
  };

  const handleAutoSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    toast.error("Time is up! Submitting your exam...");
    setTimeout(() => {
      autoSubmit(answers);
    }, 1000);
  };

  const toggleAnswer = (questionIndex: number, optionIndex: number) => {
    const updated = [...answers];
    const questionAnswer = updated[questionIndex];
    const selectedIndex = questionAnswer.selectedAnswers.indexOf(optionIndex);

    if (selectedIndex > -1) {
      questionAnswer.selectedAnswers.splice(selectedIndex, 1);
    } else {
      questionAnswer.selectedAnswers.push(optionIndex);
    }

    setAnswers(updated);
  };

  const calculateScore = (answersToScore: StudentAnswer[]): number => {
    let score = 0;

    exam.questions.forEach((question, index) => {
      const studentAnswer = answersToScore[index];
      if (!studentAnswer) return;

      const correct = question.correctAnswers.slice().sort();
      const selected = studentAnswer.selectedAnswers.slice().sort();

      if (JSON.stringify(correct) === JSON.stringify(selected)) {
        score++;
      }
    });

    return score;
  };

  const submitExam = async (answersToSubmit: StudentAnswer[]) => {
    const score = calculateScore(answersToSubmit);

    const submission: ExamSubmission = {
      id: Date.now().toString(),
      examId: exam.id,
      studentId: student.id,
      answers: answersToSubmit,
      submittedAt: new Date().toISOString(),
      score,
      totalQuestions: exam.questions.length,
    };

    try {
      await saveSubmission(submission);
      await deleteExamAttempt(exam.id, student.id);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast.success("Exam submitted successfully!");
      onComplete();
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam. Please try again.");
    }
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(
      (a) => a.selectedAnswers.length === 0
    ).length;

    if (unanswered > 0) {
      setShowWarningDialog(true);
    } else {
      setShowSubmitDialog(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitDialog(false);
    setShowWarningDialog(false);
    submitExam(answers);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress =
    ((exam.questions.length -
      answers.filter((a) => a.selectedAnswers.length === 0).length) /
      exam.questions.length) *
    100;
  const isTimeLow = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div>
                <h1 className="text-xl">{exam.title}</h1>
                <p className="text-sm text-gray-500">
                  {exam.questions.length} questions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isTimeLow
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Clock className="h-5 w-5" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
              <Button onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progress)}% completed
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {exam.questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  Question {qIndex + 1}
                </CardTitle>
                <CardDescription>{question.text}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Select all correct answers:
                  </p>
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleAnswer(qIndex, oIndex)}
                    >
                      <Checkbox
                        checked={answers[qIndex]?.selectedAnswers.includes(
                          oIndex
                        )}
                        onCheckedChange={() => toggleAnswer(qIndex, oIndex)}
                      />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={handleSubmit} size="lg">
            <Send className="h-5 w-5 mr-2" />
            Submit Exam
          </Button>
        </div>
      </div>

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Unanswered Questions</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have{" "}
              {answers.filter((a) => a.selectedAnswers.length === 0).length}{" "}
              unanswered questions. Do you want to submit anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your exam? You cannot change your
              answers after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
