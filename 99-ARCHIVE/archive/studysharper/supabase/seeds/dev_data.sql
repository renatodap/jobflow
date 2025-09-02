-- Insert test user (will be created via Google OAuth in real app)
-- This is just for development seeding
INSERT INTO users (id, email, full_name, google_id, preferences, timezone) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'test@example.com', 'Test Student', 'google123', 
 '{"dark_mode": true, "notifications": true, "study_reminders": true}', 'America/New_York');

-- Insert test school
INSERT INTO schools (id, user_id, name, type) VALUES 
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'University of Technology', 'university');

-- Insert test term
INSERT INTO terms (id, school_id, name, start_date, end_date, active) VALUES 
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fall 2024', '2024-08-25', '2024-12-15', true);

-- Insert test courses
INSERT INTO courses (id, term_id, name, code, credits, color, syllabus_data) VALUES 
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Data Structures and Algorithms', 'CS 201', 4, '#3B82F6', 
 '{"instructor": "Dr. Smith", "office_hours": "MW 2-4pm", "textbook": "Introduction to Algorithms"}'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Calculus II', 'MATH 152', 3, '#10B981', 
 '{"instructor": "Prof. Johnson", "office_hours": "TTh 1-3pm", "textbook": "Calculus: Early Transcendentals"}'),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Physics I', 'PHYS 101', 4, '#F59E0B', 
 '{"instructor": "Dr. Lee", "office_hours": "MWF 10-11am", "textbook": "University Physics with Modern Physics"}');

-- Insert test subjects
INSERT INTO subjects (id, course_id, name, description, order_index) VALUES 
-- CS 201 subjects
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Arrays and Linked Lists', 'Basic data structures and operations', 1),
('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stacks and Queues', 'LIFO and FIFO data structures', 2),
('12eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Trees and Graphs', 'Hierarchical and network data structures', 3),
('13eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sorting Algorithms', 'Bubble, merge, quick, heap sort', 4),
-- MATH 152 subjects
('14eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Integration Techniques', 'Advanced integration methods', 1),
('15eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Series and Sequences', 'Infinite series convergence and tests', 2),
('16eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Parametric Equations', 'Curves defined by parameters', 3),
-- PHYS 101 subjects
('17eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kinematics', 'Motion in one and two dimensions', 1),
('18eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Forces and Newton\'s Laws', 'Dynamics and force analysis', 2),
('19eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Energy and Momentum', 'Conservation laws', 3);

-- Insert test assessments
INSERT INTO assessments (id, course_id, title, type, due_date, weight, points_possible) VALUES 
-- CS 201 assessments
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Midterm Exam', 'exam', '2024-10-15', 25.00, 100),
('21eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Final Exam', 'exam', '2024-12-10', 35.00, 150),
('22eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Programming Assignment 1', 'assignment', '2024-09-20', 15.00, 50),
('23eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Programming Assignment 2', 'assignment', '2024-11-01', 15.00, 50),
-- MATH 152 assessments
('24eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Quiz 1: Integration', 'quiz', '2024-09-15', 10.00, 25),
('25eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Midterm Exam', 'exam', '2024-10-20', 30.00, 100),
('26eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Final Exam', 'exam', '2024-12-12', 40.00, 150),
-- PHYS 101 assessments
('27eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lab Report 1', 'assignment', '2024-09-25', 15.00, 30),
('28eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Midterm Exam', 'exam', '2024-10-25', 30.00, 100),
('29eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Final Exam', 'exam', '2024-12-13', 35.00, 150);

-- Insert test tasks
INSERT INTO tasks (id, course_id, assessment_id, title, description, due_date, priority, estimated_minutes, status) VALUES 
-- CS 201 tasks
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '22eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Implement Linked List', 'Create a doubly linked list with insert, delete, and search operations', '2024-09-18', 4, 180, 'pending'),
('31eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Review Arrays and Pointers', 'Study chapter 3-4, practice pointer arithmetic', '2024-10-13', 3, 120, 'pending'),
('32eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '23eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Implement Binary Search Tree', 'BST with insert, delete, search, and traversal methods', '2024-10-30', 5, 240, 'pending'),
-- MATH 152 tasks
('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '24eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Practice Integration by Parts', 'Complete exercises 7.1-7.3 from textbook', '2024-09-13', 3, 90, 'pending'),
('34eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '25eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Study Series Convergence Tests', 'Review ratio test, root test, comparison test', '2024-10-18', 4, 150, 'pending'),
-- PHYS 101 tasks
('35eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '27eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Complete Kinematics Lab', 'Analyze motion data and write lab report', '2024-09-23', 3, 120, 'pending'),
('36eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '28eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Practice Force Problems', 'Solve problems from chapter 4-5', '2024-10-23', 3, 100, 'pending');

-- Insert sample notes
INSERT INTO notes (id, user_id, subject_id, title, content, format) VALUES 
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Array vs Linked List Comparison', 
 '# Arrays vs Linked Lists\n\n## Arrays\n- **Pros**: Fast random access O(1), cache-friendly, less memory overhead\n- **Cons**: Fixed size, expensive insertion/deletion O(n)\n\n## Linked Lists\n- **Pros**: Dynamic size, cheap insertion/deletion O(1)\n- **Cons**: No random access O(n), extra memory for pointers, not cache-friendly\n\n## When to Use\n- Use arrays when you need frequent random access\n- Use linked lists when you need frequent insertion/deletion', 
 'markdown'),
('41eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '14eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Integration by Parts Formula', 
 '# Integration by Parts\n\n## Formula\n∫ u dv = uv - ∫ v du\n\n## LIATE Rule (choose u)\n1. **L**ogarithmic functions\n2. **I**nverse trig functions\n3. **A**lgebraic functions\n4. **T**rig functions\n5. **E**xponential functions\n\n## Example\n∫ x ln(x) dx\n- u = ln(x), dv = x dx\n- du = 1/x dx, v = x²/2\n- Result: (x²/2)ln(x) - ∫ (x²/2)(1/x) dx = (x²/2)ln(x) - x²/4 + C', 
 'markdown'),
('42eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '17eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Kinematic Equations Summary', 
 '# Kinematic Equations\n\n## For Constant Acceleration\n\n1. **v = v₀ + at**\n   - Final velocity = initial velocity + acceleration × time\n\n2. **x = x₀ + v₀t + ½at²**\n   - Position equation with initial velocity and acceleration\n\n3. **v² = v₀² + 2a(x - x₀)**\n   - Velocity squared equation (useful when time is unknown)\n\n4. **x = x₀ + ½(v₀ + v)t**\n   - Average velocity approach\n\n## Problem-Solving Strategy\n1. Identify known quantities\n2. Choose appropriate equation\n3. Solve for unknown\n4. Check units and reasonableness', 
 'markdown');

-- Insert sample decks for spaced repetition
INSERT INTO decks (id, user_id, subject_id, name, description) VALUES 
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Data Structures Basics', 'Fundamental concepts and complexity analysis'),
('51eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '14eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Integration Techniques', 'Methods for evaluating integrals'),
('52eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '17eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'Physics Formulas', 'Key equations and concepts');

-- Insert sample cards
INSERT INTO cards (id, deck_id, front, back) VALUES 
-- Data Structures cards
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'What is the time complexity of accessing an element in an array by index?', 
 'O(1) - Constant time. Arrays provide direct access to elements using their index.'),
('61eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'What is the time complexity of inserting an element at the beginning of a linked list?', 
 'O(1) - Constant time. Just create a new node and update the head pointer.'),
('62eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'What data structure follows LIFO (Last In, First Out) principle?', 
 'Stack - Elements are added and removed from the same end (top of stack).'),
-- Integration cards
('63eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '51eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'What is the integration by parts formula?', 
 '∫ u dv = uv - ∫ v du\n\nUsed when the integral is a product of two functions.'),
('64eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '51eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'What does LIATE stand for in integration by parts?', 
 'L - Logarithmic\nI - Inverse trig\nA - Algebraic\nT - Trigonometric\nE - Exponential\n\nOrder of priority for choosing u.'),
-- Physics cards
('65eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '52eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'What is the kinematic equation relating velocity, acceleration, and time?', 
 'v = v₀ + at\n\nFinal velocity = initial velocity + (acceleration × time)'),
('66eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '52eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 'What is Newton\'s Second Law?', 
 'F = ma\n\nForce equals mass times acceleration. Net force causes acceleration.');

-- Insert initial review data for spaced repetition (just created, need first review)
INSERT INTO reviews (id, card_id, user_id, reviewed_at, rating, interval_days, ease_factor, repetitions, next_review, algorithm) VALUES 
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 0, 1, 2.50, 0, NOW(), 'sm2'),
('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '61eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 0, 1, 2.50, 0, NOW(), 'sm2'),
('72eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '62eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 0, 1, 2.50, 0, NOW(), 'sm2'),
('73eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '63eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 0, 1, 2.50, 0, NOW(), 'sm2'),
('74eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '64eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 0, 1, 2.50, 0, NOW(), 'sm2'),
('75eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '65eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 0, 1, 2.50, 0, NOW(), 'sm2'),
('76eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '66eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 0, 1, 2.50, 0, NOW(), 'sm2');

-- Insert sample metrics
INSERT INTO metrics (user_id, metric_type, value, dimensions) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'study_minutes', 45.0, '{"subject_id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "date": "2024-08-10"}'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'study_minutes', 60.0, '{"subject_id": "14eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "date": "2024-08-10"}'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'focus_score', 4.2, '{"date": "2024-08-10"}'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'retention_rate', 0.85, '{"subject_id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "week": "2024-08-05"}');

-- Insert sample events
INSERT INTO events (user_id, event_type, properties) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'study_session_start', '{"subject_id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "duration_planned": 45}'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'card_reviewed', '{"card_id": "60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "rating": 4, "time_taken": 8.5}'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'note_created', '{"note_id": "40eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "word_count": 156}'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'study_plan_generated', '{"plan_id": "generated-plan-1", "ai_confidence": 0.92, "blocks_count": 14}');