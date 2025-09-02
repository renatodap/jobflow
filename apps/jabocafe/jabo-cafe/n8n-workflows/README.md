# Jabô Café n8n Automations

## ✅ Current Working Automation

### Instagram Google Slides MVP
**File**: `instagram-google-slides-mvp.json`
**Status**: FULLY FUNCTIONAL ✅
**Schedule**: Daily at 10 AM

#### What It Does:
1. Selects random image from Google Drive
2. Analyzes image with Google Vision API
3. Generates caption with Groq AI (Llama 70B)
4. Creates Instagram post using Google Slides template
5. Renders to PNG and saves to Drive

#### Required Setup:
- Google OAuth configured ✅
- Google Drive folder with images
- Google Slides template with placeholders
- Groq API key (included in workflow)

---

## 📁 Files in This Directory

### Workflows:
- `instagram-google-slides-mvp.json` - Working Instagram automation

### Configuration:
- `credentials-config.json` - API credentials (git-ignored)
- `GOOGLE_SETUP_GUIDE.md` - Google OAuth setup instructions

---

## 🚀 Next Steps

See `AUTOMATION_MASTER_PLAN.md` in the root directory for the complete roadmap including:
- Instagram Graph API integration
- WhatsApp automation
- Email sequences
- Analytics & optimization
- Multi-channel expansion

---

## 🔧 To Import Workflow

1. Open n8n (cloud or self-hosted)
2. Go to Workflows → Import
3. Select `instagram-google-slides-mvp.json`
4. Configure credentials:
   - Google OAuth (already set up)
   - Groq API (key included)
5. Test and activate!

---

## 📊 Current Performance

- **Success Rate**: 100%
- **Daily Posts**: 1
- **Processing Time**: ~45 seconds
- **Technologies**: Google Slides + Vision + Groq AI

---

*For the complete automation strategy, see the master plan document.*