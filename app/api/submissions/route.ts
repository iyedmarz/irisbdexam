import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions, saveSubmission, getStudentSubmissions, getExamSubmissions } from '../../../lib/db-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const examId = searchParams.get('examId');

    if (studentId) {
      const submissions = await getStudentSubmissions(studentId);
      return NextResponse.json({ submissions });
    }

    if (examId) {
      const submissions = await getExamSubmissions(examId);
      return NextResponse.json({ submissions });
    }

    const submissions = await getSubmissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const submission = await request.json();
    await saveSubmission(submission);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}
