-- IRIS Exam Platform - Initial Database Schema
-- PostgreSQL Migration Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- 2. EXAMS TABLE
-- =============================================
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    passing_score DECIMAL(5,2) DEFAULT 50.00,
    allow_review BOOLEAN DEFAULT TRUE,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_options BOOLEAN DEFAULT FALSE
);

-- Indexes for exams table
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_active ON exams(is_active);
CREATE INDEX idx_exams_dates ON exams(start_date, end_date);

-- =============================================
-- 3. QUESTIONS TABLE
-- =============================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    points DECIMAL(5,2) DEFAULT 1.00,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(exam_id, question_order)
);

-- Indexes for questions table
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_questions_order ON questions(exam_id, question_order);

-- =============================================
-- 4. ANSWER_OPTIONS TABLE
-- =============================================
CREATE TABLE answer_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(question_id, option_order)
);

-- Indexes for answer_options table
CREATE INDEX idx_options_question ON answer_options(question_id);
CREATE INDEX idx_options_correct ON answer_options(question_id, is_correct);

-- =============================================
-- 5. EXAM_ASSIGNMENTS TABLE
-- =============================================
CREATE TABLE exam_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(exam_id, student_id)
);

-- Indexes for exam_assignments table
CREATE INDEX idx_assignments_exam ON exam_assignments(exam_id);
CREATE INDEX idx_assignments_student ON exam_assignments(student_id);

-- =============================================
-- 6. EXAM_SUBMISSIONS TABLE
-- =============================================
CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    score DECIMAL(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score / total_questions) * 100) STORED,
    time_taken INTEGER, -- in seconds
    ip_address INET,
    user_agent TEXT,
    is_passed BOOLEAN GENERATED ALWAYS AS (((score / total_questions) * 100) >= 50) STORED,
    UNIQUE(exam_id, student_id)
);

-- Indexes for exam_submissions table
CREATE INDEX idx_submissions_exam ON exam_submissions(exam_id);
CREATE INDEX idx_submissions_student ON exam_submissions(student_id);
CREATE INDEX idx_submissions_date ON exam_submissions(submitted_at);

-- =============================================
-- 7. STUDENT_ANSWERS TABLE
-- =============================================
CREATE TABLE student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES exam_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_options UUID[] NOT NULL, -- Array of option IDs
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- Indexes for student_answers table
CREATE INDEX idx_answers_submission ON student_answers(submission_id);
CREATE INDEX idx_answers_question ON student_answers(question_id);
CREATE INDEX idx_answers_correct ON student_answers(is_correct);

-- =============================================
-- 8. EXAM_ATTEMPTS TABLE (Active Sessions)
-- =============================================
CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    last_saved_at TIMESTAMP DEFAULT NOW(),
    answers_json JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL
);

-- Index for exam_attempts table
CREATE INDEX idx_attempts_active ON exam_attempts(exam_id, student_id, is_active);
CREATE INDEX idx_attempts_expires ON exam_attempts(expires_at);

-- Add unique constraint for active attempts only
CREATE UNIQUE INDEX idx_attempts_unique_active ON exam_attempts(exam_id, student_id) WHERE is_active = TRUE;

-- =============================================
-- TRIGGER: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA: Default Users
-- =============================================
-- Note: Passwords are hashed using bcrypt
-- Plain passwords: teacher123, student123

INSERT INTO users (id, username, password_hash, role, name, email) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'teacher', '$2a$10$YourHashedPasswordHere1', 'teacher', 'Prof. Martin Dubois', 'martin.dubois@iris.edu'),
('550e8400-e29b-41d4-a716-446655440002', 'student', '$2a$10$YourHashedPasswordHere2', 'student', 'Sophie Laurent', 'sophie.laurent@iris.edu'),
('550e8400-e29b-41d4-a716-446655440003', 'student2', '$2a$10$YourHashedPasswordHere3', 'student', 'Thomas Bernard', 'thomas.bernard@iris.edu');

-- =============================================
-- VIEWS: Useful queries
-- =============================================

-- View: Exam Statistics
CREATE OR REPLACE VIEW exam_statistics AS
SELECT 
    e.id,
    e.title,
    e.created_by,
    COUNT(DISTINCT ea.student_id) as total_assigned,
    COUNT(DISTINCT es.id) as total_submissions,
    ROUND(AVG(es.percentage), 2) as average_score,
    COUNT(CASE WHEN es.is_passed THEN 1 END) as passed_count,
    COUNT(CASE WHEN NOT es.is_passed THEN 1 END) as failed_count
FROM exams e
LEFT JOIN exam_assignments ea ON e.id = ea.exam_id
LEFT JOIN exam_submissions es ON e.id = es.exam_id
GROUP BY e.id, e.title, e.created_by;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE users IS 'Stores all user accounts (teachers and students)';
COMMENT ON TABLE exams IS 'Stores exam metadata and settings';
COMMENT ON TABLE questions IS 'Stores individual questions for each exam';
COMMENT ON TABLE answer_options IS 'Stores all possible answers for each question';
COMMENT ON TABLE exam_assignments IS 'Tracks which students are assigned to which exams';
COMMENT ON TABLE exam_submissions IS 'Stores completed exam submissions';
COMMENT ON TABLE student_answers IS 'Stores individual answers for each question';
COMMENT ON TABLE exam_attempts IS 'Tracks ongoing exam sessions with auto-save';
