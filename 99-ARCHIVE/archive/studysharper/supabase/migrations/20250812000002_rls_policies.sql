-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users: Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Schools: Users can only access their own schools
CREATE POLICY "Users can view own schools" ON schools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schools" ON schools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schools" ON schools FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schools" ON schools FOR DELETE USING (auth.uid() = user_id);

-- Terms: Users can only access terms from their schools
CREATE POLICY "Users can view own terms" ON terms FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM schools 
        WHERE schools.id = terms.school_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert terms in own schools" ON terms FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM schools 
        WHERE schools.id = terms.school_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update terms in own schools" ON terms FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM schools 
        WHERE schools.id = terms.school_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete terms in own schools" ON terms FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM schools 
        WHERE schools.id = terms.school_id 
        AND schools.user_id = auth.uid()
    )
);

-- Courses: Users can only access courses from their terms
CREATE POLICY "Users can view own courses" ON courses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM terms 
        JOIN schools ON schools.id = terms.school_id
        WHERE terms.id = courses.term_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert courses in own terms" ON courses FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM terms 
        JOIN schools ON schools.id = terms.school_id
        WHERE terms.id = courses.term_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own courses" ON courses FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM terms 
        JOIN schools ON schools.id = terms.school_id
        WHERE terms.id = courses.term_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own courses" ON courses FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM terms 
        JOIN schools ON schools.id = terms.school_id
        WHERE terms.id = courses.term_id 
        AND schools.user_id = auth.uid()
    )
);

-- Subjects: Users can only access subjects from their courses
CREATE POLICY "Users can view own subjects" ON subjects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = subjects.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert subjects in own courses" ON subjects FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = subjects.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own subjects" ON subjects FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = subjects.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own subjects" ON subjects FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = subjects.course_id 
        AND schools.user_id = auth.uid()
    )
);

-- Assessments: Users can only access assessments from their courses
CREATE POLICY "Users can view own assessments" ON assessments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = assessments.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert assessments in own courses" ON assessments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = assessments.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own assessments" ON assessments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = assessments.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own assessments" ON assessments FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = assessments.course_id 
        AND schools.user_id = auth.uid()
    )
);

-- Tasks: Users can only access tasks from their courses
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = tasks.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert tasks in own courses" ON tasks FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = tasks.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = tasks.course_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM courses 
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE courses.id = tasks.course_id 
        AND schools.user_id = auth.uid()
    )
);

-- Task Dependencies: Users can only access dependencies for their tasks
CREATE POLICY "Users can view own task dependencies" ON task_dependencies FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM tasks 
        JOIN courses ON courses.id = tasks.course_id
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE tasks.id = task_dependencies.task_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert task dependencies for own tasks" ON task_dependencies FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks 
        JOIN courses ON courses.id = tasks.course_id
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE tasks.id = task_dependencies.task_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own task dependencies" ON task_dependencies FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM tasks 
        JOIN courses ON courses.id = tasks.course_id
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE tasks.id = task_dependencies.task_id 
        AND schools.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own task dependencies" ON task_dependencies FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM tasks 
        JOIN courses ON courses.id = tasks.course_id
        JOIN terms ON terms.id = courses.term_id
        JOIN schools ON schools.id = terms.school_id
        WHERE tasks.id = task_dependencies.task_id 
        AND schools.user_id = auth.uid()
    )
);

-- Study Plans: Users can only access their own study plans
CREATE POLICY "Users can view own study plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study plans" ON study_plans FOR DELETE USING (auth.uid() = user_id);

-- Study Blocks: Users can only access blocks from their study plans
CREATE POLICY "Users can view own study blocks" ON study_blocks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM study_plans 
        WHERE study_plans.id = study_blocks.study_plan_id 
        AND study_plans.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert study blocks in own plans" ON study_blocks FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM study_plans 
        WHERE study_plans.id = study_blocks.study_plan_id 
        AND study_plans.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own study blocks" ON study_blocks FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM study_plans 
        WHERE study_plans.id = study_blocks.study_plan_id 
        AND study_plans.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own study blocks" ON study_blocks FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM study_plans 
        WHERE study_plans.id = study_blocks.study_plan_id 
        AND study_plans.user_id = auth.uid()
    )
);

-- Study Sessions: Users can only access their own study sessions
CREATE POLICY "Users can view own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study sessions" ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Notes: Users can only access their own notes
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Note Embeddings: Users can only access embeddings from their notes
CREATE POLICY "Users can view own note embeddings" ON note_embeddings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM notes 
        WHERE notes.id = note_embeddings.note_id 
        AND notes.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert note embeddings for own notes" ON note_embeddings FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM notes 
        WHERE notes.id = note_embeddings.note_id 
        AND notes.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own note embeddings" ON note_embeddings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM notes 
        WHERE notes.id = note_embeddings.note_id 
        AND notes.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own note embeddings" ON note_embeddings FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM notes 
        WHERE notes.id = note_embeddings.note_id 
        AND notes.user_id = auth.uid()
    )
);

-- Resources: Users can only access their own resources
CREATE POLICY "Users can view own resources" ON resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON resources FOR DELETE USING (auth.uid() = user_id);

-- Decks: Users can only access their own decks
CREATE POLICY "Users can view own decks" ON decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decks" ON decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON decks FOR DELETE USING (auth.uid() = user_id);

-- Cards: Users can only access cards from their decks
CREATE POLICY "Users can view own cards" ON cards FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = cards.deck_id 
        AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert cards in own decks" ON cards FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = cards.deck_id 
        AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own cards" ON cards FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = cards.deck_id 
        AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own cards" ON cards FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM decks 
        WHERE decks.id = cards.deck_id 
        AND decks.user_id = auth.uid()
    )
);

-- Reviews: Users can only access their own reviews
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Metrics: Users can only access their own metrics
CREATE POLICY "Users can view own metrics" ON metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metrics" ON metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own metrics" ON metrics FOR DELETE USING (auth.uid() = user_id);

-- Events: Users can only access their own events
CREATE POLICY "Users can view own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = user_id);