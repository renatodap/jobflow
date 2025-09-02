# JobFlow Dashboard

AI-powered job application automation dashboard - Apply to jobs in 2 minutes!

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

## 🎯 Features

### ✅ Implemented (MVP)
- **Dashboard Home** - View today's top jobs with scores
- **Job List Display** - Browse all discovered jobs
- **Quick Stats** - Track applications, response rates
- **Job Cards** - Rich display with salary, location, posting date
- **Action Buttons** - Quick Apply, Generate Kit, Find Contacts

### 🚧 In Progress
- **Application Kit Generation** - AI-powered resume/cover letter creation
- **Outreach Center** - LinkedIn contact finder and message templates
- **Application Tracker** - Kanban board for tracking status
- **Profile Management** - Update your information and preferences

## 📁 Project Structure

```
jobflow-dashboard/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Dashboard home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Base UI components
│   ├── jobs/              # Job-related components
│   └── dashboard/         # Dashboard components
├── lib/
│   └── utils.ts           # Utility functions
├── public/                # Static assets
└── data/                  # Local data storage
```

## 🔗 Integration Points

### Python Backend (Port 8000)
The dashboard connects to your existing Python services:
- `enhanced_job_finder.py` - Job discovery
- `cold_outreach_generator.py` - Message generation
- `ai_content_generator.py` - Resume/cover letter AI

### Data Sources
Currently reads from:
- `../data/tracking/jobs_master.csv` - All discovered jobs
- `../data/resumes/*.txt` - Generated resumes
- `../profile.json` - User profile data

## 🎨 UI Components

### Job Cards
- Score badge (color-coded by match quality)
- Company and title
- Salary range
- Location and posting date
- Quick action buttons

### Quick Stats
- Total jobs found
- Applied today count
- Response rate percentage
- Top match score

### Action Buttons
- **Quick Apply** - Opens job URL in new tab
- **Generate Kit** - Creates tailored application materials
- **Find Contacts** - Searches for LinkedIn connections

## 🛠️ Development

### Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # TypeScript checking
```

### Environment Variables
Create `.env.local`:
```env
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Success Metrics

- **Application Time**: Reduce from 30 min → 2 min per job
- **Daily Applications**: Increase from 0-2 → 10-20 per day
- **Response Rate**: Improve from <5% → >20%
- **Interview Rate**: Boost from <2% → >10%

## 🚀 Next Steps

1. **Connect to Python API** - Wire up job search and AI generation
2. **Add Application Tracking** - Build status pipeline
3. **Implement Outreach** - LinkedIn contact finder
4. **Deploy to Vercel** - Make it accessible anywhere
5. **Add Authentication** - Secure for personal use

## 💡 Usage Tips

1. **Generate kits for all score 100 jobs first** - These are your best matches
2. **Apply within 24 hours** - Fresh postings get more attention
3. **Send LinkedIn messages immediately** - Strike while iron is hot
4. **Follow up at 3, 7, and 14 days** - Persistence pays off

## 🐛 Known Issues

- Mock data currently - needs Python API connection
- No persistence yet - data resets on refresh
- Multiple ports in use - server runs on 3005 instead of 3000

## 📝 License

Private - For personal use only

---

Built with ❤️ for fast, systematic job applications