# Entity Relationship Diagram

## Purpose
Define the complete data model for StudySharper with relationships and constraints.

## Scope
All entities, relationships, and key database constraints for multi-tenant system.

## Core ERD

```mermaid
erDiagram
    User ||--o{ School : "attends"
    User ||--o{ StudySession : "tracks"
    User ||--o{ Note : "creates"
    User ||--o{ Deck : "owns"
    User ||--o{ Event : "logs"
    
    School ||--o{ Term : "has"
    Term ||--o{ Course : "contains"
    Course ||--o{ Subject : "covers"
    Course ||--o{ Assessment : "includes"
    Course ||--o{ Task : "assigns"
    
    Subject ||--o{ Note : "categorizes"
    Subject ||--o{ Deck : "organizes"
    
    Assessment ||--o{ Task : "breaks_into"
    Task ||--o{ TaskDependency : "depends_on"
    Task ||--o{ StudyBlock : "scheduled_as"
    
    StudyBlock ||--o{ StudySession : "executed_as"
    
    Note ||--o{ NoteEmbedding : "embedded_as"
    Note ||--o{ Resource : "references"
    
    Deck ||--o{ Card : "contains"
    Card ||--o{ Review : "reviewed_in"
    
    User {
        uuid id PK
        string email UK
        string full_name
        string google_id UK
        timestamp created_at
        timestamp last_seen
        jsonb preferences
        string timezone
    }
    
    School {
        uuid id PK
        uuid user_id FK
        string name
        string type
        timestamp created_at
    }
    
    Term {
        uuid id PK
        uuid school_id FK
        string name
        date start_date
        date end_date
        boolean active
    }
    
    Course {
        uuid id PK
        uuid term_id FK
        string name
        string code
        integer credits
        string color
        jsonb syllabus_data
    }
    
    Subject {
        uuid id PK
        uuid course_id FK
        string name
        string description
        integer order_index
    }
    
    Assessment {
        uuid id PK
        uuid course_id FK
        string title
        string type
        date due_date
        decimal weight
        decimal points_possible
        decimal points_earned
        string status
    }
    
    Task {
        uuid id PK
        uuid course_id FK
        uuid assessment_id FK
        string title
        text description
        date due_date
        integer priority
        integer estimated_minutes
        string status
        timestamp completed_at
    }
    
    TaskDependency {
        uuid id PK
        uuid task_id FK
        uuid depends_on_task_id FK
        string dependency_type
    }
    
    StudyPlan {
        uuid id PK
        uuid user_id FK
        string name
        date start_date
        date end_date
        jsonb ai_config
        timestamp generated_at
    }
    
    StudyBlock {
        uuid id PK
        uuid study_plan_id FK
        uuid task_id FK
        uuid subject_id FK
        datetime scheduled_start
        integer duration_minutes
        string study_method
        integer cognitive_load
        jsonb ai_reasoning
    }
    
    StudySession {
        uuid id PK
        uuid user_id FK
        uuid study_block_id FK
        datetime started_at
        datetime ended_at
        integer actual_minutes
        integer focus_rating
        text notes
        jsonb metadata
    }
    
    Note {
        uuid id PK
        uuid user_id FK
        uuid subject_id FK
        string title
        text content
        string format
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    NoteEmbedding {
        uuid id PK
        uuid note_id FK
        text chunk_text
        vector embedding
        jsonb metadata
    }
    
    Resource {
        uuid id PK
        uuid user_id FK
        string title
        string url
        string file_path
        string resource_type
        jsonb metadata
    }
    
    Deck {
        uuid id PK
        uuid user_id FK
        uuid subject_id FK
        string name
        string description
        timestamp created_at
    }
    
    Card {
        uuid id PK
        uuid deck_id FK
        text front
        text back
        jsonb metadata
        timestamp created_at
    }
    
    Review {
        uuid id PK
        uuid card_id FK
        uuid user_id FK
        timestamp reviewed_at
        integer rating
        integer interval_days
        decimal ease_factor
        integer repetitions
        datetime next_review
        string algorithm
    }
    
    Metric {
        uuid id PK
        uuid user_id FK
        string metric_type
        decimal value
        jsonb dimensions
        timestamp recorded_at
    }
    
    Event {
        uuid id PK
        uuid user_id FK
        string event_type
        jsonb properties
        timestamp occurred_at
    }
```

## Key Relationships

### User-Centric Multi-tenancy
- All major entities belong to a user via direct FK or through school/course hierarchy
- RLS policies enforce user isolation at database level

### Academic Hierarchy  
- School → Term → Course → Subject/Assessment
- Flexible enough for various educational systems

### Task Management
- Tasks can be standalone or linked to assessments
- Dependency graph supports prerequisite modeling
- Study blocks are AI-generated scheduling of tasks

### Spaced Repetition
- Cards grouped in decks by subject
- Reviews track SRS algorithm state (SM-2 initially, FSRS later)
- Separate from notes but can be generated from them

### AI Integration
- Note embeddings for RAG and semantic search
- Study plans store AI reasoning for explainability
- Metrics and events feed recommendation engine

## Acceptance Criteria
- [ ] All entities have appropriate indexes
- [ ] Foreign key constraints properly defined
- [ ] RLS policies cover all user data
- [ ] Supports 10,000+ users without performance degradation
- [ ] Migration scripts handle schema evolution

## Open Questions
None - ERD covers all requirements.

## Done means...
Complete data model implemented in Supabase with all constraints, indexes, and RLS policies.