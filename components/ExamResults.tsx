'use client';

import { ExamSubmission, Exam } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Award } from 'lucide-react';

interface ExamResultsProps {
  submission: ExamSubmission;
  exam: Exam;
  onBack: () => void;
}

export function ExamResults({ submission, exam, onBack }: ExamResultsProps) {
  const percentage = ((submission.score / submission.totalQuestions) * 100).toFixed(1);
  const passed = parseFloat(percentage) >= 50;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                {passed ? (
                  <Award className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            <CardDescription>
              Submitted on {new Date(submission.submittedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-2xl">
                  {submission.score}/{submission.totalQuestions}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                <p className="text-2xl">{percentage}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Result</p>
                <Badge variant={passed ? 'default' : 'destructive'} className="text-base">
                  {passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>Review your answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {exam.questions.map((question, qIndex) => {
              const studentAnswer = submission.answers[qIndex];
              const correct = JSON.stringify(question.correctAnswers.slice().sort()) === 
                             JSON.stringify(studentAnswer.selectedAnswers.slice().sort());

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm">Question {qIndex + 1}</span>
                        {correct ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <p className="mb-3">{question.text}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isCorrect = question.correctAnswers.includes(oIndex);
                      const wasSelected = studentAnswer.selectedAnswers.includes(oIndex);
                      
                      let className = 'p-3 rounded-lg border ';
                      if (isCorrect && wasSelected) {
                        className += 'bg-green-50 border-green-200';
                      } else if (isCorrect && !wasSelected) {
                        className += 'bg-blue-50 border-blue-200';
                      } else if (!isCorrect && wasSelected) {
                        className += 'bg-red-50 border-red-200';
                      } else {
                        className += 'bg-gray-50';
                      }

                      return (
                        <div key={oIndex} className={className}>
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            <div className="flex items-center space-x-2">
                              {wasSelected && (
                                <Badge variant="outline" className="text-xs">
                                  Your answer
                                </Badge>
                              )}
                              {isCorrect && (
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
