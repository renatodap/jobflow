# StudySharper Feature Roadmap

Based on docs/05-product/feature-inventory.md - prioritized for autonomous implementation.

## MUST HAVE (MVP Core - Launch Blockers)

### 🔐 Authentication & User Management
- [x] Google OAuth Integration - One-click sign-in with Google accounts
- [x] User Profile Creation - Basic profile with timezone, study preferences
- [ ] Account Management - View/edit profile, delete account, data export

### 🏫 Academic Structure Setup
- [x] School/Institution Management - Add multiple schools/institutions ✅
- [x] Term/Semester Management - Create academic terms with start/end dates ✅
- [x] Course Creation - Add courses with name, code, credits, syllabus ✅
- [x] Subject Organization - Break courses into study subjects/topics ✅

### 📄 Content Ingestion
- [x] PDF Upload & Processing - Extract text from course materials, syllabi ✅
- [ ] Manual Note Entry - Rich text editor for typed notes
- [x] Content Chunking - Intelligent splitting for embeddings (512 token max) ✅
- [x] Metadata Extraction - Auto-tag content by course, date, type ✅

### 🧠 Core AI Features
- [ ] RAG Pipeline - Question answering from uploaded content
- [ ] AI Study Coach - Generate personalized 7-day study plans
- [ ] Content Embeddings - Semantic search across user's materials
- [ ] Provider Abstraction - OpenRouter primary, Ollama fallback

### 📅 Study Planning
- [ ] Study Plan Generation - AI-created weekly schedules
- [ ] Calendar View - Visual timeline of study blocks
- [ ] Task Management - Create, edit, complete study tasks
- [ ] Deadline Tracking - Assignment and exam deadline awareness

### 📊 Basic Analytics
- [ ] Study Session Tracking - Time spent, focus rating, completion
- [ ] Performance Metrics - Track retention improvement over time
- [ ] Progress Dashboard - Visual progress on courses and subjects

## SHOULD HAVE (Enhanced MVP)

### 🃏 Spaced Repetition System
- [ ] Card Generation - Auto-create flashcards from notes
- [ ] SM-2 Algorithm - Research-proven spaced repetition scheduling
- [ ] Review Queue - Daily cards due for review
- [ ] Performance Tracking - Difficulty ratings, retention curves

### 🤖 Advanced AI Capabilities
- [ ] AI Tutor Chat - Conversational Q&A about study materials
- [ ] Quiz Generation - AI-created practice questions from content
- [ ] Study Method Recommendations - Suggest techniques per topic
- [ ] Plan Optimization - Continuous improvement based on performance

### 📱 Enhanced UX
- [ ] Mobile Responsive Design - Full functionality on mobile devices
- [ ] Keyboard Shortcuts - Power user productivity features
- [x] Dark Mode - Theme switching for different environments
- [ ] Notification System - Study reminders and deadline alerts

### 🔗 Basic Integrations
- [ ] Google Calendar Sync - Import existing calendar events
- [ ] URL Import - Add web resources and articles
- [ ] Export Functionality - Download study plans, notes as PDF