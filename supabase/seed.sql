-- ============================================
-- BridgeToBrilliance Seed Data (Automated)
-- Run this AFTER migration.sql and AFTER creating users
-- ============================================

-- ============================================
-- 1. Create these users in Supabase Auth FIRST:
-- admin@btb.org (role: admin)
-- teacher1@btb.org (role: teacher)
-- teacher2@btb.org (role: teacher)
-- student1@btb.org (role: student)
-- student2@btb.org (role: student)
-- student3@btb.org (role: student)
-- ============================================

DO $$
DECLARE
    admin_id UUID;
    t1_id UUID;
    t2_id UUID;
    s1_id UUID;
    s2_id UUID;
    s3_id UUID;
    
    math_id UUID;
    sci_id UUID;
    eng_id UUID;
BEGIN
    -- Get user IDs based on email (requires auth.users to be populated)
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@btb.org' LIMIT 1;
    SELECT id INTO t1_id FROM auth.users WHERE email = 'teacher1@btb.org' LIMIT 1;
    SELECT id INTO t2_id FROM auth.users WHERE email = 'teacher2@btb.org' LIMIT 1;
    SELECT id INTO s1_id FROM auth.users WHERE email = 'student1@btb.org' LIMIT 1;
    SELECT id INTO s2_id FROM auth.users WHERE email = 'student2@btb.org' LIMIT 1;
    SELECT id INTO s3_id FROM auth.users WHERE email = 'student3@btb.org' LIMIT 1;

    -- Update roles and names if they weren't set correctly during signup
    IF admin_id IS NOT NULL THEN
        UPDATE profiles SET role = 'admin', full_name = 'Admin User' WHERE id = admin_id;
    END IF;
    IF t1_id IS NOT NULL THEN
        UPDATE profiles SET role = 'teacher', full_name = 'Math/Sci Teacher' WHERE id = t1_id;
    END IF;
    IF t2_id IS NOT NULL THEN
        UPDATE profiles SET role = 'teacher', full_name = 'English Teacher' WHERE id = t2_id;
    END IF;
    IF s1_id IS NOT NULL THEN
        UPDATE profiles SET role = 'student', full_name = 'Alice Student' WHERE id = s1_id;
    END IF;
    IF s2_id IS NOT NULL THEN
        UPDATE profiles SET role = 'student', full_name = 'Bob Student' WHERE id = s2_id;
    END IF;
    IF s3_id IS NOT NULL THEN
        UPDATE profiles SET role = 'student', full_name = 'Charlie Student' WHERE id = s3_id;
    END IF;

    -- Only proceed if we have our teachers
    IF t1_id IS NULL OR t2_id IS NULL THEN
        RAISE NOTICE 'Skipping sample data insertion because teacher1@btb.org or teacher2@btb.org are not found. Create auth users first!';
    ELSE
        -- 1. Insert Subjects
        INSERT INTO subjects (title, description, teacher_id, color, icon) 
        VALUES ('Mathematics', 'Algebra, Geometry, and Calculus fundamentals.', t1_id, '#4169E1', '📐')
        RETURNING id INTO math_id;

        INSERT INTO subjects (title, description, teacher_id, color, icon) 
        VALUES ('Science', 'Understanding the natural world through experiments.', t1_id, '#28a745', '🔬')
        RETURNING id INTO sci_id;

        INSERT INTO subjects (title, description, teacher_id, color, icon) 
        VALUES ('English Literature', 'Exploring classic and modern literature.', t2_id, '#FFB300', '📖')
        RETURNING id INTO eng_id;

        -- 2. Insert Lessons
        INSERT INTO lessons (subject_id, title, description, video_url, thumbnail_url, order_index) VALUES
        (math_id, 'Introduction to Algebra', 'Learn the basics of algebraic expressions.', 'https://res.cloudinary.com/demo/video/upload/dog.mp4', '', 0),
        (math_id, 'Linear Equations', 'Solving linear equations step by step.', 'https://res.cloudinary.com/demo/video/upload/dog.mp4', '', 1),
        (sci_id, 'Newton''s Laws of Motion', 'The three fundamental laws of physics.', 'https://res.cloudinary.com/demo/video/upload/dog.mp4', '', 0),
        (eng_id, 'Shakespeare: An Introduction', 'Exploring the works of William Shakespeare.', 'https://res.cloudinary.com/demo/video/upload/dog.mp4', '', 0);

        -- 3. Insert Announcements
        IF admin_id IS NOT NULL THEN
            INSERT INTO announcements (subject_id, author_id, title, body) VALUES
            (NULL, admin_id, 'Welcome to BridgeToBrilliance!', 'We are excited to launch our platform. Explore subjects, watch lessons, and track your progress!');
        END IF;

        INSERT INTO announcements (subject_id, author_id, title, body) VALUES
        (math_id, t1_id, 'New Math Lessons Available', 'I have uploaded new algebra and geometry lessons. Check them out!'),
        (eng_id, t2_id, 'Essay Submissions Due Friday', 'Please submit your literary analysis essays by end of day Friday.');

        -- 4. Insert Classes
        INSERT INTO classes (subject_id, title, scheduled_at, meeting_link, description) VALUES
        (math_id, 'Algebra Review Session', NOW() + INTERVAL '2 days', 'https://meet.google.com/abc-defg-hij', 'Review session for upcoming algebra test.'),
        (sci_id, 'Lab Experiment: Gravity', NOW() + INTERVAL '3 days', 'https://meet.google.com/klm-nopq-rst', 'Virtual lab experiment on gravitational forces.');

        -- 5. Insert Enrollments (if students exist)
        IF s1_id IS NOT NULL THEN
            INSERT INTO enrollments (student_id, subject_id) VALUES
            (s1_id, math_id), (s1_id, sci_id), (s1_id, eng_id);
            
            INSERT INTO grades (student_id, subject_id, assignment_title, score, max_score, feedback, graded_by) VALUES
            (s1_id, math_id, 'Algebra Quiz 1', 85, 100, 'Good work!', t1_id),
            (s1_id, sci_id, 'Physics Lab Report', 92, 100, 'Excellent analysis', t1_id);
        END IF;

        IF s2_id IS NOT NULL THEN
            INSERT INTO enrollments (student_id, subject_id) VALUES
            (s2_id, math_id), (s2_id, eng_id);
            
            INSERT INTO grades (student_id, subject_id, assignment_title, score, max_score, feedback, graded_by) VALUES
            (s2_id, math_id, 'Algebra Quiz 1', 78, 100, 'Need to practice factoring.', t1_id);
        END IF;

        IF s3_id IS NOT NULL THEN
            INSERT INTO enrollments (student_id, subject_id) VALUES
            (s3_id, sci_id);
        END IF;

        RAISE NOTICE 'Sample data successfully inserted!';
    END IF;
END $$;
