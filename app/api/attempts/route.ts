import { NextRequest, NextResponse } from "next/server";
import {
  getExamAttempt,
  saveExamAttempt,
  deleteExamAttempt,
} from "../../../lib/db-storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const studentId = searchParams.get("studentId");

    if (!examId || !studentId) {
      return NextResponse.json(
        { error: "examId and studentId are required" },
        { status: 400 },
      );
    }

    const attempt = await getExamAttempt(examId, studentId);
    return NextResponse.json({ attempt });
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const attempt = await request.json();
    await saveExamAttempt(attempt);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving attempt:", error);
    return NextResponse.json(
      { error: "Failed to save attempt" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const studentId = searchParams.get("studentId");

    if (!examId || !studentId) {
      return NextResponse.json(
        { error: "examId and studentId are required" },
        { status: 400 },
      );
    }

    await deleteExamAttempt(examId, studentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attempt:", error);
    return NextResponse.json(
      { error: "Failed to delete attempt" },
      { status: 500 },
    );
  }
}