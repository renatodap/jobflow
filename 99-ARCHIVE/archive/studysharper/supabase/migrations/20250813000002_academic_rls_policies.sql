-- Enable RLS on all academic structure tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY; 
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Schools RLS Policies
CREATE POLICY "Users can view own schools" ON schools
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schools" ON schools
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schools" ON schools
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schools" ON schools
    FOR DELETE USING (auth.uid() = user_id);

-- Terms RLS Policies (through school ownership)
CREATE POLICY "Users can view own terms" ON terms
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM schools WHERE schools.id = terms.school_id
        )
    );

CREATE POLICY "Users can insert terms for own schools" ON terms
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM schools WHERE schools.id = terms.school_id
        )
    );

CREATE POLICY "Users can update own terms" ON terms
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM schools WHERE schools.id = terms.school_id
        )
    );

CREATE POLICY "Users can delete own terms" ON terms
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM schools WHERE schools.id = terms.school_id
        )
    );

-- Courses RLS Policies (through term → school ownership)
CREATE POLICY "Users can view own courses" ON courses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            WHERE t.id = courses.term_id
        )
    );

CREATE POLICY "Users can insert courses for own terms" ON courses
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            WHERE t.id = courses.term_id
        )
    );

CREATE POLICY "Users can update own courses" ON courses
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            WHERE t.id = courses.term_id
        )
    );

CREATE POLICY "Users can delete own courses" ON courses
    FOR DELETE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            WHERE t.id = courses.term_id
        )
    );

-- Subjects RLS Policies (through course → term → school ownership)
CREATE POLICY "Users can view own subjects" ON subjects
    FOR SELECT USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = subjects.course_id
        )
    );

CREATE POLICY "Users can insert subjects for own courses" ON subjects
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = subjects.course_id
        )
    );

CREATE POLICY "Users can update own subjects" ON subjects
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = subjects.course_id
        )
    );

CREATE POLICY "Users can delete own subjects" ON subjects
    FOR DELETE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = subjects.course_id
        )
    );

-- Assessments RLS Policies (through course → term → school ownership)
CREATE POLICY "Users can view own assessments" ON assessments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = assessments.course_id
        )
    );

CREATE POLICY "Users can insert assessments for own courses" ON assessments
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = assessments.course_id
        )
    );

CREATE POLICY "Users can update own assessments" ON assessments
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = assessments.course_id
        )
    );

CREATE POLICY "Users can delete own assessments" ON assessments
    FOR DELETE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = assessments.course_id
        )
    );

-- Tasks RLS Policies (through course → term → school ownership)
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = tasks.course_id
        )
    );

CREATE POLICY "Users can insert tasks for own courses" ON tasks
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = tasks.course_id
        )
    );

CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = tasks.course_id
        )
    );

CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (
        auth.uid() IN (
            SELECT s.user_id FROM schools s
            JOIN terms t ON t.school_id = s.id
            JOIN courses c ON c.term_id = t.id
            WHERE c.id = tasks.course_id
        )
    );