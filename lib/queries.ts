import { query } from './db';
import { User, Exam, Question, ExamSubmission, ExamAttempt } from '../types';
// import bcrypt from 'bcryptjs';

// =============================================
// USER QUERIES
// =============================================

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  // 1. Première requête pour trouver l'utilisateur et son mot de passe stocké (qui est désormais en clair)
  const result = await query(
    'SELECT * FROM users WHERE username = $1 AND is_active = TRUE',
    [username]
  );

  if (result.rows.length === 0) {
    // Utilisateur non trouvé ou inactif
    return null;
  }

  const user = result.rows[0];

  // 2. NOUVELLE LOGIQUE : Comparaison directe du mot de passe en clair
  // Nous comparons le mot de passe soumis (password) avec la colonne stockée (user.password_hash)
  const isValidPassword = (password === user.password_hash);

  if (!isValidPassword) {
    // Mot de passe incorrect
    return null;
  }

  // Si le mot de passe est valide (en clair)
  // Update last login
  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  return {
    id: user.id,
    username: user.username,
    // Nous continuons de ne pas envoyer le mot de passe au client
    password: '',
    role: user.role,
    name: user.name,
  };
}

// export async function authenticateUser(username: string, password: string): Promise<User | null> {
//   const result = await query(
//     'SELECT * FROM users WHERE username = $1 AND is_active = TRUE',
//     [username]
//   );

//   if (result.rows.length === 0) {
//     return null;
//   }

//   const user = result.rows[0];
//   const isValidPassword = await bcrypt.compare(password, user.password_hash);

//   if (!isValidPassword) {
//     return null;
//   }

//   // Update last login
//   await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

//   return {
//     id: user.id,
//     username: user.username,
//     password: '', // Don't send password to client
//     role: user.role,
//     name: user.name,
//   };
// }

export async function getUsers(): Promise<User[]> {
  const result = await query('SELECT id, username, role, name FROM users WHERE is_active = TRUE');
  return result.rows.map(row => ({
    id: row.id,
    username: row.username,
    password: '',
    role: row.role,
    name: row.name,
  }));
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query(
    'SELECT id, username, role, name FROM users WHERE id = $1 AND is_active = TRUE',
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    username: row.username,
    password: '',
    role: row.role,
    name: row.name,
  };
}

// =============================================
// EXAM QUERIES
// =============================================

export async function getExams(): Promise<Exam[]> {
  const result = await query(`
    SELECT 
      e.*,
      json_agg(
        json_build_object(
          'id', q.id,
          'text', q.question_text,
          'options', (
            SELECT json_agg(
              json_build_object(
                'text', ao.option_text,
                'order', ao.option_order
              )
              ORDER BY ao.option_order
            )
            FROM answer_options ao
            WHERE ao.question_id = q.id
          ),
          'correctAnswers', (
            SELECT array_agg(ao.option_order ORDER BY ao.option_order)
            FROM answer_options ao
            WHERE ao.question_id = q.id AND ao.is_correct = TRUE
          )
        )
        ORDER BY q.question_order
      ) FILTER (WHERE q.id IS NOT NULL) as questions_data,
      ARRAY_AGG(DISTINCT ea.student_id) FILTER (WHERE ea.student_id IS NOT NULL) as assigned_student_ids
    FROM exams e
    LEFT JOIN questions q ON e.id = q.exam_id
    LEFT JOIN exam_assignments ea ON e.id = ea.exam_id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `);

  return result.rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    duration: row.duration,
    questions: row.questions_data || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
    assignedStudents: row.assigned_student_ids || [],
  }));
}

export async function getExamById(id: string): Promise<Exam | null> {
  const result = await query(`
    SELECT 
      e.*,
      json_agg(
        json_build_object(
          'id', q.id,
          'text', q.question_text,
          'options', (
            SELECT json_agg(ao.option_text ORDER BY ao.option_order)
            FROM answer_options ao
            WHERE ao.question_id = q.id
          ),
          'correctAnswers', (
            SELECT array_agg(ao.option_order ORDER BY ao.option_order)
            FROM answer_options ao
            WHERE ao.question_id = q.id AND ao.is_correct = TRUE
          )
        )
        ORDER BY q.question_order
      ) FILTER (WHERE q.id IS NOT NULL) as questions_data,
      ARRAY_AGG(DISTINCT ea.student_id) FILTER (WHERE ea.student_id IS NOT NULL) as assigned_student_ids
    FROM exams e
    LEFT JOIN questions q ON e.id = q.exam_id
    LEFT JOIN exam_assignments ea ON e.id = ea.exam_id
    WHERE e.id = $1
    GROUP BY e.id
  `, [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    duration: row.duration,
    questions: row.questions_data || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
    assignedStudents: row.assigned_student_ids || [],
  };
}

export async function saveExam(exam: Exam): Promise<void> {
  const client = await require('./db').getClient();

  try {
    await client.query('BEGIN');

    // Check if exam exists
    const existingExam = await client.query('SELECT id FROM exams WHERE id = $1', [exam.id]);

    if (existingExam.rows.length > 0) {
      // Update exam
      await client.query(`
        UPDATE exams 
        SET title = $1, description = $2, duration = $3, updated_at = NOW()
        WHERE id = $4
      `, [exam.title, exam.description, exam.duration, exam.id]);

      // Delete old questions and options (cascade will handle options)
      await client.query('DELETE FROM questions WHERE exam_id = $1', [exam.id]);
    } else {
      // Insert new exam
      await client.query(`
        INSERT INTO exams (id, title, description, duration, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [exam.id, exam.title, exam.description, exam.duration, exam.createdBy]);
    }

    // Insert questions and options
    for (let i = 0; i < exam.questions.length; i++) {
      const question = exam.questions[i];

      // Insert question
      const questionResult = await client.query(`
        INSERT INTO questions (id, exam_id, question_text, question_order)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [question.id, exam.id, question.text, i + 1]);

      const questionId = questionResult.rows[0].id;

      // Insert answer options
      for (let j = 0; j < question.options.length; j++) {
        const isCorrect = question.correctAnswers.includes(j);
        await client.query(`
          INSERT INTO answer_options (question_id, option_text, is_correct, option_order)
          VALUES ($1, $2, $3, $4)
        `, [questionId, question.options[j], isCorrect, j]);
      }
    }

    // Delete old assignments
    await client.query('DELETE FROM exam_assignments WHERE exam_id = $1', [exam.id]);

    // Insert new assignments
    for (const studentId of exam.assignedStudents) {
      await client.query(`
        INSERT INTO exam_assignments (exam_id, student_id, assigned_by)
        VALUES ($1, $2, $3)
      `, [exam.id, studentId, exam.createdBy]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteExam(id: string): Promise<void> {
  await query('DELETE FROM exams WHERE id = $1', [id]);
}

// =============================================
// SUBMISSION QUERIES
// =============================================

export async function getSubmissions(): Promise<ExamSubmission[]> {
  const result = await query(`
    SELECT 
      es.*,
      json_agg(
        json_build_object(
          'questionId', sa.question_id,
          'selectedAnswers', (
            SELECT array_agg(ao.option_order ORDER BY ao.option_order)
            FROM answer_options ao
            WHERE ao.id = ANY(sa.selected_options)
          )
        )
        ORDER BY sa.answered_at
      ) FILTER (WHERE sa.id IS NOT NULL) as answers_data
    FROM exam_submissions es
    LEFT JOIN student_answers sa ON es.id = sa.submission_id
    GROUP BY es.id
    ORDER BY es.submitted_at DESC
  `);

  return result.rows.map(row => ({
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    answers: row.answers_data || [],
    submittedAt: row.submitted_at,
    score: parseFloat(row.score),
    totalQuestions: row.total_questions,
  }));
}

export async function saveSubmission(submission: ExamSubmission): Promise<void> {
  const client = await require('./db').getClient();

  try {
    await client.query('BEGIN');

    // Insert submission
    const submissionResult = await client.query(`
      INSERT INTO exam_submissions (id, exam_id, student_id, started_at, submitted_at, score, total_questions)
      VALUES ($1, $2, $3, NOW(), NOW(), $4, $5)
      RETURNING id
    `, [submission.id, submission.examId, submission.studentId, submission.score, submission.totalQuestions]);

    const submissionId = submissionResult.rows[0].id;

    // Get exam questions with their answer options
    const questionsResult = await client.query(`
      SELECT q.id as question_id, 
             array_agg(ao.id ORDER BY ao.option_order) as option_ids,
             array_agg(ao.is_correct ORDER BY ao.option_order) as option_correctness
      FROM questions q
      LEFT JOIN answer_options ao ON q.question_id = ao.question_id
      WHERE q.exam_id = $1
      GROUP BY q.id
      ORDER BY q.question_order
    `, [submission.examId]);

    // Insert student answers
    for (const answer of submission.answers) {
      const questionData = questionsResult.rows.find((q: any) => q.question_id === answer.questionId);
      if (!questionData) continue;

      // Convert option indices to option UUIDs
      const selectedOptionIds = answer.selectedAnswers.map((index: number) => questionData.option_ids[index]);

      // Check if answer is correct
      const correctIndices = questionData.option_correctness
        .map((isCorrect: boolean, idx: number) => isCorrect ? idx : -1)
        .filter((idx: number) => idx !== -1);

      const isCorrect = JSON.stringify(answer.selectedAnswers.slice().sort()) ===
        JSON.stringify(correctIndices.sort());

      await client.query(`
        INSERT INTO student_answers (submission_id, question_id, selected_options, is_correct)
        VALUES ($1, $2, $3, $4)
      `, [submissionId, answer.questionId, selectedOptionIds, isCorrect]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getStudentSubmissions(studentId: string): Promise<ExamSubmission[]> {
  const submissions = await getSubmissions();
  return submissions.filter(s => s.studentId === studentId);
}

export async function getExamSubmissions(examId: string): Promise<ExamSubmission[]> {
  const submissions = await getSubmissions();
  return submissions.filter(s => s.examId === examId);
}

export async function hasStudentSubmitted(examId: string, studentId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM exam_submissions WHERE exam_id = $1 AND student_id = $2',
    [examId, studentId]
  );
  return result.rows.length > 0;
}

// =============================================
// EXAM ATTEMPT QUERIES
// =============================================

export async function getExamAttempt(examId: string, studentId: string): Promise<ExamAttempt | null> {
  const result = await query(`
    SELECT * FROM exam_attempts 
    WHERE exam_id = $1 AND student_id = $2 AND is_active = TRUE
  `, [examId, studentId]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    examId: row.exam_id,
    studentId: row.student_id,
    startedAt: row.started_at,
    answers: row.answers_json,
  };
}

export async function saveExamAttempt(attempt: ExamAttempt): Promise<void> {
  await query(`
    INSERT INTO exam_attempts (exam_id, student_id, started_at, answers_json, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (exam_id, student_id) WHERE is_active = TRUE
    DO UPDATE SET answers_json = $4, last_saved_at = NOW()
  `, [
    attempt.examId,
    attempt.studentId,
    attempt.startedAt,
    JSON.stringify(attempt.answers),
    new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
  ]);
}

export async function deleteExamAttempt(examId: string, studentId: string): Promise<void> {
  await query(`
    UPDATE exam_attempts 
    SET is_active = FALSE 
    WHERE exam_id = $1 AND student_id = $2
  `, [examId, studentId]);
}
