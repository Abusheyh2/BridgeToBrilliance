export type UserRole = 'student' | 'teacher' | 'admin'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
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
