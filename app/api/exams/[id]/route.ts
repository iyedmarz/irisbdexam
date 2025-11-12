import { NextRequest, NextResponse } from 'next/server';
import { getExamById } from '../../../../lib/db-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await getExamById(params.id);
    
    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam' },
      { status: 500 }
    );
  }
}
