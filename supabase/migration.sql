-- ============================================
-- BridgeToBrilliance Database Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 0. CLEANUP (Run first to allow re-running migration)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.admin_update_profile_role(UUID, user_role);
DROP FUNCTION IF EXISTS public.admin_set_user_banned(UUID, boolean);
DROP FUNCTION IF EXISTS public.admin_get_all_profiles();
DROP FUNCTION IF EXISTS public.is_current_user_admin();

DROP TABLE IF EXISTS public.teacher_assignments CASCADE;
DROP TABLE IF EXISTS public.security_settings CASCADE;
DROP TABLE IF EXISTS public.security_logs CASCADE;
DROP TABLE IF EXISTS public.rate_limits CASCADE;
DROP TABLE IF EXISTS public.ip_bans CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.study_plan_tasks CASCADE;
DROP TABLE IF EXISTS public.study_plans CASCADE;
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.study_notes CASCADE;
DROP TABLE IF EXISTS public.flashcard_progress CASCADE;
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.flashcard_decks CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.study_group_members CASCADE;
DROP TABLE IF EXISTS public.study_groups CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role;

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
  email TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  bio TEXT,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Admin-only operations on profiles via SECURITY DEFINER functions (prevents RLS recursion)
-- These bypass RLS entirely and are the only way admins can modify other users' profiles

-- Helper function: update any profile's role (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_profile_role(profile_id UUID, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET role = new_role, updated_at = NOW() WHERE id = profile_id;
END;
$$;

-- Helper function: ban/unban a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_user_banned(profile_id UUID, banned boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET is_banned = banned, updated_at = NOW() WHERE id = profile_id;
END;
$$;

-- Helper function: get all profiles (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles;
END;
$$;

-- Helper function: check if current user is admin (for use in app, not RLS policies)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val FROM profiles WHERE user_id = auth.uid() LIMIT 1;
  RETURN user_role_val = 'admin';
END;
$$;

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
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
  );

-- Teachers can delete their own subjects
CREATE POLICY "Teachers can delete own subjects" ON subjects
  FOR DELETE USING (
    teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
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
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
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
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
  );

-- Authors can delete their own announcements
CREATE POLICY "Authors can delete own announcements" ON announcements
  FOR DELETE USING (
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
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
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
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
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
  );

-- Students can unenroll themselves, admins can unenroll anyone
CREATE POLICY "Students can unenroll themselves" ON enrollments
  FOR DELETE USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
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
-- ============================================
-- 10. STUDY GROUPS
-- ============================================
CREATE TABLE study_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📖',
  color TEXT DEFAULT '#4169E1',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Study groups viewable by all" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Students/teachers can create groups" ON study_groups FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('student', 'teacher', 'admin'))
);
CREATE POLICY "Creators can update their groups" ON study_groups FOR UPDATE USING (
  created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Creators can delete their groups" ON study_groups FOR DELETE USING (
  created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- ============================================
-- 11. STUDY GROUP MEMBERS
-- ============================================
CREATE TABLE study_group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group members" ON study_group_members FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_group_members WHERE student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND group_id = study_group_members.group_id)
);
CREATE POLICY "Members can join groups" ON study_group_members FOR INSERT WITH CHECK (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Members can leave groups" ON study_group_members FOR DELETE USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_groups WHERE id = study_group_members.group_id AND created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- ============================================
-- 12. GROUP CHAT MESSAGES
-- ============================================
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages viewable by group members" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members WHERE student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND group_id = chat_messages.group_id)
);
CREATE POLICY "Group members can send messages" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM study_group_members WHERE student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND group_id = chat_messages.group_id)
);
CREATE POLICY "Senders can delete their messages" ON chat_messages FOR DELETE USING (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_groups WHERE id = chat_messages.group_id AND created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- ============================================
-- 13. FLASHCARD DECKS
-- ============================================
CREATE TABLE flashcard_decks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flashcard decks viewable by all" ON flashcard_decks FOR SELECT USING (true);
CREATE POLICY "Students/teachers can create decks" ON flashcard_decks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('student', 'teacher', 'admin'))
);
CREATE POLICY "Creators can update their decks" ON flashcard_decks FOR UPDATE USING (
  created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Creators can delete their decks" ON flashcard_decks FOR DELETE USING (
  created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- ============================================
-- 14. FLASHCARDS
-- ============================================
CREATE TABLE flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flashcards viewable by all" ON flashcards FOR SELECT USING (true);
CREATE POLICY "Deck creators can manage flashcards" ON flashcards FOR ALL USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- ============================================
-- 15. FLASHCARD PROGRESS
-- ============================================
CREATE TABLE flashcard_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE NOT NULL,
  mastery_level INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  UNIQUE(student_id, flashcard_id)
);

ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own flashcard progress" ON flashcard_progress FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students can update own progress" ON flashcard_progress FOR ALL USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ============================================
-- 16. STUDY NOTES
-- ============================================
CREATE TABLE study_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#4169E1',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own notes" ON study_notes FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students can manage own notes" ON study_notes FOR ALL USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ============================================
-- 17. STUDY TIMER SESSIONS
-- ============================================
CREATE TABLE study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  duration_seconds INTEGER NOT NULL,
  session_type TEXT DEFAULT 'pomodoro',
  completed BOOLEAN DEFAULT true,
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own sessions" ON study_sessions FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students can create own sessions" ON study_sessions FOR ALL USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ============================================
-- 18. QUIZZES
-- ============================================
CREATE TABLE quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  time_limit_seconds INTEGER,
  passing_score INTEGER DEFAULT 70,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes viewable by all" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Students/teachers can create quizzes" ON quizzes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('student', 'teacher', 'admin'))
);
CREATE POLICY "Creators can update their quizzes" ON quizzes FOR UPDATE USING (
  created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Creators can delete their quizzes" ON quizzes FOR DELETE USING (
  created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- ============================================
-- 19. QUIZ QUESTIONS
-- ============================================
CREATE TABLE quiz_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quiz questions viewable by all" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Quiz creators can manage questions" ON quiz_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_questions.quiz_id AND created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
  OR (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- ============================================
-- 20. QUIZ ATTEMPTS
-- ============================================
CREATE TABLE quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  answers JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own attempts" ON quiz_attempts FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_attempts.quiz_id AND created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Students can create own attempts" ON quiz_attempts FOR ALL USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ============================================
-- 21. BOOKMARKS
-- ============================================
CREATE TABLE bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own bookmarks" ON bookmarks FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students can manage own bookmarks" ON bookmarks FOR ALL USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ============================================
-- 22. STUDY PLANS
-- ============================================
CREATE TABLE study_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own plans" ON study_plans FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students can manage own plans" ON study_plans FOR ALL USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ============================================
-- 23. STUDY PLAN TASKS
-- ============================================
CREATE TABLE study_plan_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_plan_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own plan tasks" ON study_plan_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_plans WHERE id = study_plan_tasks.plan_id AND student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Students can manage own plan tasks" ON study_plan_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM study_plans WHERE id = study_plan_tasks.plan_id AND student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- ============================================
-- 24. ACHIEVEMENTS
-- ============================================
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🏆',
  category TEXT DEFAULT 'general',
  requirement JSONB
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements viewable by all" ON achievements FOR SELECT USING (true);

-- ============================================
-- 25. USER ACHIEVEMENTS
-- ============================================
CREATE TABLE user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (
  student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view others achievements" ON user_achievements FOR SELECT USING (true);

-- ============================================
-- 26. SEED ACHIEVEMENTS
-- ============================================
INSERT INTO achievements (name, description, icon, category, requirement) VALUES
  ('First Steps', 'Enroll in your first subject', '🎓', 'getting_started', '{"action": "enroll", "count": 1}'),
  ('Bookworm', 'Complete 10 lessons', '📚', 'lessons', '{"action": "watch_lessons", "count": 10}'),
  ('Scholar', 'Complete 50 lessons', '🎯', 'lessons', '{"action": "watch_lessons", "count": 50}'),
  ('Note Taker', 'Create your first study note', '📝', 'notes', '{"action": "create_notes", "count": 1}'),
  ('Quiz Master', 'Score 100% on any quiz', '💯', 'quizzes', '{"action": "perfect_quiz", "count": 1}'),
  ('Study Streak', 'Study for 7 consecutive days', '🔥', 'streaks', '{"action": "streak_days", "count": 7}'),
  ('Group Leader', 'Create a study group', '👥', 'social', '{"action": "create_group", "count": 1}'),
  ('Flashcard Fan', 'Review 100 flashcards', '🃏', 'flashcards', '{"action": "review_flashcards", "count": 100}'),
  ('Time Master', 'Complete 10 study timer sessions', '⏱️', 'timer', '{"action": "timer_sessions", "count": 10}'),
  ('Plan Ahead', 'Create your first study plan', '📋', 'planning', '{"action": "create_plan", "count": 1}');

-- ============================================
-- 27. IP BANS
-- ============================================
CREATE TABLE ip_bans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  banned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ip_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage IP bans" ON ip_bans FOR ALL USING (
  (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "IP bans viewable by admins" ON ip_bans FOR SELECT USING (
  (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- ============================================
-- 28. RATE LIMITS
-- ============================================
CREATE TABLE rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address, endpoint)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limits" ON rate_limits FOR SELECT USING (
  (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "System can manage rate limits" ON rate_limits FOR ALL USING (true);

-- ============================================
-- 29. SECURITY AUDIT LOGS
-- ============================================
CREATE TABLE security_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON security_logs FOR SELECT USING (
  (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "System can create security logs" ON security_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- 30. SECURITY SETTINGS
-- ============================================
CREATE TABLE security_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security settings" ON security_settings FOR ALL USING ((SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Public can read security settings" ON security_settings FOR SELECT USING (true);

-- ============================================
-- 31. SEED SECURITY SETTINGS
-- ============================================
INSERT INTO security_settings (key, value) VALUES
  ('ddos_protection', '{"enabled": true, "max_requests_per_minute": 100, "block_duration_seconds": 3600}'),
  ('rate_limiting', '{"enabled": true, "login_attempts_per_hour": 5, "signup_attempts_per_hour": 3}'),
  ('bot_protection', '{"enabled": true, "honeypot_field": true, "min_load_time_seconds": 2}');

-- ============================================
-- 32. TEACHER ASSIGNMENTS (admin assigns teachers to subjects)
-- ============================================
CREATE TABLE teacher_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id)
);

ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All can view teacher assignments" ON teacher_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage assignments" ON teacher_assignments FOR ALL USING (
  (SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
