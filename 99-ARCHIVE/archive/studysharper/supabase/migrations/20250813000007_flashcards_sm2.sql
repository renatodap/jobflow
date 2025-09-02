-- Spaced Repetition Flashcards with SM-2 Algorithm

-- Flashcard decks
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    card_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{
        "new_cards_per_day": 20,
        "review_cards_per_day": 100,
        "learning_steps": [1, 10],
        "graduating_interval": 1,
        "easy_interval": 4,
        "starting_ease": 2.5,
        "easy_bonus": 1.3,
        "interval_modifier": 1.0,
        "hard_interval": 1.2,
        "new_interval": 0.0,
        "minimum_interval": 1,
        "leech_threshold": 8,
        "leech_action": "suspend"
    }',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual flashcards
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL, -- Question or prompt
    back TEXT NOT NULL, -- Answer
    type TEXT DEFAULT 'basic' CHECK (type IN ('basic', 'cloze', 'image', 'audio')),
    tags TEXT[] DEFAULT '{}',
    source_chunk_id UUID REFERENCES content_chunks(id) ON DELETE SET NULL,
    media_url TEXT, -- For image/audio cards
    notes TEXT, -- Additional notes or explanations
    is_suspended BOOLEAN DEFAULT FALSE,
    is_leech BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SM-2 Algorithm state for each card per user
CREATE TABLE IF NOT EXISTS flashcard_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    
    -- SM-2 Algorithm parameters
    ease_factor DECIMAL(3,2) DEFAULT 2.50, -- Difficulty rating (1.3 to 2.5+)
    interval INT DEFAULT 0, -- Days until next review
    repetitions INT DEFAULT 0, -- Number of successful repetitions
    
    -- Review scheduling
    due_date DATE DEFAULT CURRENT_DATE,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    
    -- Learning state
    state TEXT DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning')),
    step INT DEFAULT 0, -- Current step in learning/relearning
    
    -- Statistics
    total_reviews INT DEFAULT 0,
    correct_reviews INT DEFAULT 0,
    lapses INT DEFAULT 0, -- Times card was forgotten
    average_time INT DEFAULT 0, -- Average response time in seconds
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, card_id)
);

-- Review history log
CREATE TABLE IF NOT EXISTS review_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    review_id UUID REFERENCES flashcard_reviews(id) ON DELETE CASCADE,
    
    -- Review data
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 4), -- 1=Again, 2=Hard, 3=Good, 4=Easy
    time_taken INT NOT NULL, -- Time to answer in seconds
    
    -- State before review
    previous_ease DECIMAL(3,2),
    previous_interval INT,
    previous_due DATE,
    
    -- State after review
    new_ease DECIMAL(3,2),
    new_interval INT,
    new_due DATE,
    
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study statistics aggregation
CREATE TABLE IF NOT EXISTS study_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Daily statistics
    cards_studied INT DEFAULT 0,
    cards_new INT DEFAULT 0,
    cards_learning INT DEFAULT 0,
    cards_review INT DEFAULT 0,
    cards_relearning INT DEFAULT 0,
    
    time_studied INT DEFAULT 0, -- Total time in seconds
    sessions_count INT DEFAULT 0,
    
    -- Performance metrics
    retention_rate DECIMAL(5,2), -- Percentage
    average_ease DECIMAL(3,2),
    average_interval DECIMAL(10,2),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_subject_id ON flashcard_decks(subject_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_source_chunk_id ON flashcards(source_chunk_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_card ON flashcard_reviews(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_due_date ON flashcard_reviews(user_id, due_date, state);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id ON review_logs(user_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_statistics_user_date ON study_statistics(user_id, date DESC);

-- Enable RLS
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own flashcard decks" ON flashcard_decks;
CREATE POLICY "Users can manage own flashcard decks" ON flashcard_decks
    FOR ALL USING (auth.uid() = user_id OR is_public = TRUE);

DROP POLICY IF EXISTS "Users can view flashcards in accessible decks" ON flashcards;
CREATE POLICY "Users can view flashcards in accessible decks" ON flashcards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM flashcard_decks 
            WHERE flashcard_decks.id = flashcards.deck_id 
            AND (flashcard_decks.user_id = auth.uid() OR flashcard_decks.is_public = TRUE)
        )
    );

DROP POLICY IF EXISTS "Users can manage flashcards in own decks" ON flashcards;
CREATE POLICY "Users can manage flashcards in own decks" ON flashcards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM flashcard_decks 
            WHERE flashcard_decks.id = flashcards.deck_id 
            AND flashcard_decks.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage own reviews" ON flashcard_reviews;
CREATE POLICY "Users can manage own reviews" ON flashcard_reviews
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own review logs" ON review_logs;
CREATE POLICY "Users can manage own review logs" ON review_logs
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own statistics" ON study_statistics;
CREATE POLICY "Users can manage own statistics" ON study_statistics
    FOR ALL USING (auth.uid() = user_id);

-- SM-2 Algorithm Implementation
CREATE OR REPLACE FUNCTION calculate_sm2_interval(
    p_rating INT, -- 1-4 (Again, Hard, Good, Easy)
    p_repetitions INT,
    p_ease_factor DECIMAL,
    p_interval INT
)
RETURNS TABLE (
    new_repetitions INT,
    new_ease_factor DECIMAL,
    new_interval INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_repetitions INT;
    v_new_ease_factor DECIMAL;
    v_new_interval INT;
BEGIN
    -- Reset if failed (rating = 1)
    IF p_rating = 1 THEN
        v_new_repetitions := 0;
        v_new_interval := 1;
        v_new_ease_factor := GREATEST(1.3, p_ease_factor - 0.2);
    ELSE
        -- Successful review
        v_new_repetitions := p_repetitions + 1;
        
        -- Adjust ease factor based on rating
        v_new_ease_factor := p_ease_factor;
        
        IF p_rating = 2 THEN -- Hard
            v_new_ease_factor := GREATEST(1.3, p_ease_factor - 0.15);
        ELSIF p_rating = 3 THEN -- Good
            v_new_ease_factor := p_ease_factor;
        ELSIF p_rating = 4 THEN -- Easy
            v_new_ease_factor := p_ease_factor + 0.1;
        END IF;
        
        -- Calculate new interval
        IF v_new_repetitions = 1 THEN
            v_new_interval := 1;
        ELSIF v_new_repetitions = 2 THEN
            v_new_interval := 6;
        ELSE
            v_new_interval := ROUND(p_interval * v_new_ease_factor);
        END IF;
        
        -- Apply rating modifiers
        IF p_rating = 2 THEN -- Hard
            v_new_interval := GREATEST(1, ROUND(v_new_interval * 1.2));
        ELSIF p_rating = 4 THEN -- Easy
            v_new_interval := ROUND(v_new_interval * 1.3);
        END IF;
    END IF;
    
    -- Ensure minimum interval
    v_new_interval := GREATEST(1, v_new_interval);
    
    RETURN QUERY SELECT v_new_repetitions, v_new_ease_factor, v_new_interval;
END;
$$;

-- Function to get due cards for review
CREATE OR REPLACE FUNCTION get_due_cards(
    p_user_id UUID,
    p_limit INT DEFAULT 100
)
RETURNS TABLE (
    card_id UUID,
    deck_id UUID,
    front TEXT,
    back TEXT,
    card_type TEXT,
    state TEXT,
    ease_factor DECIMAL,
    interval INT,
    repetitions INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fc.id as card_id,
        fc.deck_id,
        fc.front,
        fc.back,
        fc.type as card_type,
        fr.state,
        fr.ease_factor,
        fr.interval,
        fr.repetitions
    FROM flashcards fc
    JOIN flashcard_reviews fr ON fr.card_id = fc.id
    JOIN flashcard_decks fd ON fd.id = fc.deck_id
    WHERE 
        fr.user_id = p_user_id
        AND fr.due_date <= CURRENT_DATE
        AND fc.is_suspended = FALSE
        AND (fd.user_id = p_user_id OR fd.is_public = TRUE)
    ORDER BY 
        CASE fr.state
            WHEN 'learning' THEN 1
            WHEN 'relearning' THEN 2
            WHEN 'review' THEN 3
            WHEN 'new' THEN 4
        END,
        fr.due_date
    LIMIT p_limit;
END;
$$;

-- Function to process a card review
CREATE OR REPLACE FUNCTION process_card_review(
    p_user_id UUID,
    p_card_id UUID,
    p_rating INT,
    p_time_taken INT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_review flashcard_reviews%ROWTYPE;
    v_new_repetitions INT;
    v_new_ease_factor DECIMAL;
    v_new_interval INT;
    v_new_due_date DATE;
    v_new_state TEXT;
BEGIN
    -- Get current review state
    SELECT * INTO v_review
    FROM flashcard_reviews
    WHERE user_id = p_user_id AND card_id = p_card_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Review not found for card';
    END IF;
    
    -- Calculate new SM-2 values
    SELECT * INTO v_new_repetitions, v_new_ease_factor, v_new_interval
    FROM calculate_sm2_interval(p_rating, v_review.repetitions, v_review.ease_factor, v_review.interval);
    
    -- Determine new state
    IF p_rating = 1 THEN
        v_new_state := CASE 
            WHEN v_review.state IN ('review', 'relearning') THEN 'relearning'
            ELSE 'learning'
        END;
    ELSIF v_new_repetitions = 1 THEN
        v_new_state := 'learning';
    ELSIF v_new_repetitions = 2 THEN
        v_new_state := 'learning';
    ELSE
        v_new_state := 'review';
    END IF;
    
    -- Calculate new due date
    v_new_due_date := CURRENT_DATE + v_new_interval;
    
    -- Log the review
    INSERT INTO review_logs (
        user_id, card_id, review_id, rating, time_taken,
        previous_ease, previous_interval, previous_due,
        new_ease, new_interval, new_due
    ) VALUES (
        p_user_id, p_card_id, v_review.id, p_rating, p_time_taken,
        v_review.ease_factor, v_review.interval, v_review.due_date,
        v_new_ease_factor, v_new_interval, v_new_due_date
    );
    
    -- Update review state
    UPDATE flashcard_reviews
    SET 
        ease_factor = v_new_ease_factor,
        interval = v_new_interval,
        repetitions = v_new_repetitions,
        due_date = v_new_due_date,
        last_reviewed = NOW(),
        next_review = v_new_due_date::timestamp,
        state = v_new_state,
        total_reviews = total_reviews + 1,
        correct_reviews = correct_reviews + CASE WHEN p_rating > 1 THEN 1 ELSE 0 END,
        lapses = lapses + CASE WHEN p_rating = 1 THEN 1 ELSE 0 END,
        average_time = CASE 
            WHEN total_reviews = 0 THEN p_time_taken
            ELSE ((average_time * total_reviews) + p_time_taken) / (total_reviews + 1)
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id AND card_id = p_card_id;
    
    -- Update daily statistics
    INSERT INTO study_statistics (user_id, date, cards_studied, time_studied)
    VALUES (p_user_id, CURRENT_DATE, 1, p_time_taken)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
        cards_studied = study_statistics.cards_studied + 1,
        time_studied = study_statistics.time_studied + p_time_taken;
    
    RETURN jsonb_build_object(
        'success', true,
        'new_interval', v_new_interval,
        'new_ease_factor', v_new_ease_factor,
        'new_due_date', v_new_due_date,
        'new_state', v_new_state
    );
END;
$$;

-- Function to auto-generate flashcards from content chunks
CREATE OR REPLACE FUNCTION generate_flashcards_from_content(
    p_source_id UUID,
    p_deck_id UUID,
    p_user_id UUID,
    p_max_cards INT DEFAULT 50
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cards_created INT := 0;
    v_chunk RECORD;
BEGIN
    -- This is a placeholder for AI-based card generation
    -- In production, this would call an AI service to generate Q&A pairs
    
    FOR v_chunk IN 
        SELECT id, chunk_text, page_number
        FROM content_chunks
        WHERE source_id = p_source_id
        LIMIT p_max_cards
    LOOP
        -- Simple extraction (would be AI-powered in production)
        INSERT INTO flashcards (deck_id, front, back, source_chunk_id)
        VALUES (
            p_deck_id,
            'Summarize this concept: ' || LEFT(v_chunk.chunk_text, 200),
            v_chunk.chunk_text,
            v_chunk.id
        );
        
        -- Create review record for the user
        INSERT INTO flashcard_reviews (user_id, card_id)
        VALUES (p_user_id, lastval());
        
        v_cards_created := v_cards_created + 1;
    END LOOP;
    
    -- Update deck card count
    UPDATE flashcard_decks 
    SET card_count = card_count + v_cards_created
    WHERE id = p_deck_id;
    
    RETURN v_cards_created;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_flashcard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_flashcard_decks_updated_at ON flashcard_decks;
CREATE TRIGGER update_flashcard_decks_updated_at 
    BEFORE UPDATE ON flashcard_decks
    FOR EACH ROW EXECUTE FUNCTION update_flashcard_updated_at();

DROP TRIGGER IF EXISTS update_flashcards_updated_at ON flashcards;
CREATE TRIGGER update_flashcards_updated_at 
    BEFORE UPDATE ON flashcards
    FOR EACH ROW EXECUTE FUNCTION update_flashcard_updated_at();

DROP TRIGGER IF EXISTS update_flashcard_reviews_updated_at ON flashcard_reviews;
CREATE TRIGGER update_flashcard_reviews_updated_at 
    BEFORE UPDATE ON flashcard_reviews
    FOR EACH ROW EXECUTE FUNCTION update_flashcard_updated_at();

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_sm2_interval TO authenticated;
GRANT EXECUTE ON FUNCTION get_due_cards TO authenticated;
GRANT EXECUTE ON FUNCTION process_card_review TO authenticated;
GRANT EXECUTE ON FUNCTION generate_flashcards_from_content TO authenticated;