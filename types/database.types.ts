export type UserRole = 'student' | 'teacher' | 'admin'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  email: string
  bio: string | null
  is_banned: boolean
  updated_at: string
  created_at: string
}

export interface Subject {
  id: string
  title: string
  description: string
  teacher_id: string
  color: string
  icon: string
  created_at: string
  // Joined fields
  teacher?: Profile
  enrollment_count?: number
  lesson_count?: number
}

export interface Lesson {
  id: string
  subject_id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  order_index: number
  created_at: string
}

export interface Announcement {
  id: string
  subject_id: string | null
  author_id: string
  title: string
  body: string
  created_at: string
  // Joined
  author?: Profile
  subject?: Subject
}

export interface Class {
  id: string
  subject_id: string
  title: string
  scheduled_at: string
  meeting_link: string
  description: string
  created_at: string
  // Joined
  subject?: Subject
}

export interface Enrollment {
  id: string
  student_id: string
  subject_id: string
  enrolled_at: string
  // Joined
  subject?: Subject
  student?: Profile
}

export interface Progress {
  id: string
  student_id: string
  lesson_id: string
  watched: boolean
  watched_at: string | null
}

export interface Grade {
  id: string
  student_id: string
  subject_id: string
  assignment_title: string
  score: number
  max_score: number
  feedback: string | null
  graded_by: string
  created_at: string
  // Joined
  grader?: Profile
  subject?: Subject
  student?: Profile
}

export interface StudyGroup {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  created_by: string
  subject_id: string | null
  is_public: boolean
  max_members: number
  created_at: string
  // Joined
  creator?: Profile
  member_count?: number
  subject?: Subject
}

export interface StudyGroupMember {
  id: string
  group_id: string
  student_id: string
  role: string
  joined_at: string
  // Joined
  group?: StudyGroup
  student?: Profile
}

export interface ChatMessage {
  id: string
  group_id: string
  sender_id: string
  content: string | null
  attachment_url: string | null
  attachment_type: string | null
  reply_to: string | null
  created_at: string
  // Joined
  sender?: Profile
}

export interface FlashcardDeck {
  id: string
  title: string
  description: string | null
  subject_id: string | null
  created_by: string
  is_public: boolean
  created_at: string
  // Joined
  creator?: Profile
  card_count?: number
  subject?: Subject
}

export interface Flashcard {
  id: string
  deck_id: string
  front: string
  back: string
  order_index: number
  created_at: string
}

export interface FlashcardProgress {
  id: string
  student_id: string
  flashcard_id: string
  mastery_level: number
  last_reviewed: string | null
  next_review: string | null
  review_count: number
}

export interface StudyNote {
  id: string
  student_id: string
  subject_id: string | null
  lesson_id: string | null
  title: string
  content: string
  tags: string[]
  color: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  // Joined
  subject?: Subject
}

export interface StudySession {
  id: string
  student_id: string
  subject_id: string | null
  duration_seconds: number
  session_type: string
  completed: boolean
  notes: string | null
  started_at: string
  created_at: string
  // Joined
  subject?: Subject
}

export interface Quiz {
  id: string
  title: string
  description: string | null
  subject_id: string | null
  created_by: string
  time_limit_seconds: number | null
  passing_score: number
  is_public: boolean
  created_at: string
  // Joined
  creator?: Profile
  question_count?: number
  subject?: Subject
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  question_type: string
  options: Record<string, unknown>[] | null
  correct_answer: string
  explanation: string | null
  points: number
  order_index: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  score: number
  total_points: number
  answers: Record<string, unknown> | null
  started_at: string
  completed_at: string | null
  created_at: string
  // Joined
  quiz?: Quiz
}

export interface Bookmark {
  id: string
  student_id: string
  lesson_id: string | null
  subject_id: string | null
  title: string
  url: string | null
  notes: string | null
  created_at: string
  // Joined
  lesson?: Lesson
  subject?: Subject
}

export interface StudyPlan {
  id: string
  student_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  goals: string[]
  created_at: string
}

export interface StudyPlanTask {
  id: string
  plan_id: string
  subject_id: string | null
  title: string
  description: string | null
  due_date: string | null
  is_completed: boolean
  priority: string
  order_index: number
  created_at: string
  // Joined
  subject?: Subject
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: Record<string, unknown> | null
}

export interface UserAchievement {
  id: string
  student_id: string
  achievement_id: string
  unlocked_at: string
  // Joined
  achievement?: Achievement
}

export interface IPBan {
  id: string
  ip_address: string
  reason: string | null
  banned_by: string | null
  expires_at: string | null
  created_at: string
}

export interface RateLimit {
  id: string
  ip_address: string
  endpoint: string
  request_count: number
  window_start: string
}

export interface SecurityLog {
  id: string
  action: string
  ip_address: string | null
  user_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  // Joined
  user?: Profile
}

export interface SecuritySetting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface TeacherAssignment {
  id: string
  teacher_id: string
  subject_id: string
  assigned_by: string | null
  is_primary: boolean
  assigned_at: string
  // Joined
  teacher?: Profile
  subject?: Subject
}

export interface ProfileWithStats extends Profile {
  login_count?: number
  last_login?: string
}
