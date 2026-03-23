-- ============================================
-- BridgeToBrilliance Database Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. SUBJECTS TABLE
-- ============================================
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  color TEXT DEFAULT '#4169E1',
  icon TEXT DEFAULT '📚',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can read subjects
CREATE POLICY "Subjects are viewable by everyone" ON subjects
  FOR SELECT USING (true);

-- Teachers can create subjects
CREATE POLICY "Teachers can create subjects" ON subjects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Teachers can update their own subjects
CREATE POLICY "Teachers can update own subjects" ON subjects
  FOR UPDATE USING (
    teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Teachers can delete their own subjects
CREATE POLICY "Teachers can delete own subjects" ON subjects
  FOR DELETE USING (
    teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 3. LESSONS TABLE
-- ============================================
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Everyone can read lessons
CREATE POLICY "Lessons are viewable by everyone" ON lessons
  FOR SELECT USING (true);

-- Subject teachers can manage lessons
CREATE POLICY "Teachers can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subjects s
      JOIN profiles p ON s.teacher_id = p.id
      WHERE s.id = lessons.subject_id AND p.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 4. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read announcements
CREATE POLICY "Announcements are viewable by everyone" ON announcements
  FOR SELECT USING (true);

-- Teachers and admins can create announcements
CREATE POLICY "Teachers and admins can create announcements" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Authors can update their own announcements
CREATE POLICY "Authors can update own announcements" ON announcements
  FOR UPDATE USING (
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Authors can delete their own announcements
CREATE POLICY "Authors can delete own announcements" ON announcements
  FOR DELETE USING (
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 5. CLASSES TABLE
-- ============================================
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_link TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Everyone can read classes
CREATE POLICY "Classes are viewable by everyone" ON classes
  FOR SELECT USING (true);

-- Subject teachers can manage classes
CREATE POLICY "Teachers can manage classes" ON classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subjects s
      JOIN profiles p ON s.teacher_id = p.id
      WHERE s.id = classes.subject_id AND p.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 6. ENROLLMENTS TABLE
-- ============================================
CREATE TABLE enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Students can see their own enrollments
CREATE POLICY "Students can see own enrollments" ON enrollments
  FOR SELECT USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Students can enroll themselves
CREATE POLICY "Students can enroll themselves" ON enrollments
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Students can unenroll themselves, admins can unenroll anyone
CREATE POLICY "Students can unenroll themselves" ON enrollments
  FOR DELETE USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 7. PROGRESS TABLE
-- ============================================
CREATE TABLE progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Students can see their own progress, teachers and admins can see all
CREATE POLICY "Progress visibility" ON progress
  FOR SELECT USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Students can update their own progress
CREATE POLICY "Students can update own progress" ON progress
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can modify own progress" ON progress
  FOR UPDATE USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================
-- 8. GRADES TABLE
-- ============================================
CREATE TABLE grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  assignment_title TEXT NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Students can see their own grades, teachers and admins can see all
CREATE POLICY "Grades visibility" ON grades
  FOR SELECT USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Teachers and admins can insert grades
CREATE POLICY "Teachers can create grades" ON grades
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Teachers and admins can update grades
CREATE POLICY "Teachers can update grades" ON grades
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- ============================================
-- 9. AUTO-CREATE PROFILE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
