import { NextRequest, NextResponse } from 'next/server';
import { getExams, saveExam, deleteExam } from '../../../lib/db-storage';

export async function GET() {
  try {
    const exams = await getExams();
    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const exam = await request.json();
    await saveExam(exam);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving exam:', error);
    return NextResponse.json(
      { error: 'Failed to save exam' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Exam ID is required' },
        { status: 400 }
      );
    }

    await deleteExam(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    );
  }
}
