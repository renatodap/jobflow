# 📦 AUTOMATIC ARCHIVE & CLEANUP POLICY
*Keeping Your Codebase Fresh, Real, and Revenue-Focused*

**ENFORCEMENT**: This policy runs automatically with every Claude Code interaction

---

## 🗂️ ARCHIVE RULES (Applied to EVERY Directory)

### What Gets Archived

#### Immediate Archive (Same Day)
- Files with "old", "backup", "copy", "temp", "test" in name
- Duplicate files (keep newest)
- Empty directories
- Broken symlinks
- .tmp, .bak, .swp files

#### 7-Day Archive
- Unused components (not imported anywhere)
- Outdated documentation (superseded versions)
- Failed experiment code
- Deprecated API implementations
- Old todo lists (completed items > 7 days)

#### 30-Day Archive
- Inactive feature branches
- Unused dependencies in package.json
- Stale configuration files
- Old deployment artifacts
- Previous version migrations

### Archive Structure
```
/archive/
├── 2025-08-18/
│   ├── README.md (why archived)
│   ├── source-location.txt
│   └── [archived files]
├── 2025-08-17/
└── 2025-08-16/
```

---

## 🚫 NO FAKE DATA POLICY

### STRICTLY PROHIBITED
1. **Sample Users**: No "John Doe", "test@example.com", "User123"
2. **Placeholder Content**: No "Lorem ipsum", "Coming soon", "TBD"
3. **Fake Metrics**: No made-up statistics, false testimonials, inflated numbers
4. **Mock Data**: No hardcoded fake API responses
5. **Dummy Files**: No placeholder images, empty functions "for later"

### REQUIRED INSTEAD
1. **Real Users**: Actual user emails, real testimonials
2. **Genuine Content**: Actual product descriptions, real features
3. **True Metrics**: Only measured data, verified results
4. **Live Data**: Real API calls, actual database queries
5. **Working Code**: Every file must serve a purpose

### Exception Handling
```javascript
// ❌ WRONG - Fake data
const users = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" }
];

// ✅ RIGHT - Real data or clear test markers
const TEST_USERS = process.env.NODE_ENV === 'test' ? [
  { name: "TEST_USER_1", email: "test1@automation-testing.local" }
] : await getUsersFromDatabase();
```

---

## 🧹 CLEANUP AUTOMATION SCRIPTS

### Daily Cleanup (Runs Automatically)
```bash
# Remove common junk
find . -name "*.tmp" -delete
find . -name "*.swp" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# Archive old logs
find . -name "*.log" -mtime +7 -exec mv {} archive/$(date +%Y-%m-%d)/ \;

# Remove empty directories
find . -type d -empty -delete
```

### Weekly Cleanup
```bash
# Find unused imports
# Archive components not imported in 7 days
# Remove commented code blocks > 50 lines
# Archive old build artifacts
```

### Before Each Commit
```bash
# Check for fake data patterns
grep -r "lorem\|ipsum\|john doe\|example\.com\|test@test" --exclude-dir=node_modules

# Verify no placeholder content
grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.md"

# Ensure documentation is current
find . -name "*.md" -mtime +30 -print
```

---

## 📊 PRUNING METRICS

### Track These Daily
1. **Files Archived**: Target > 5/day (stay clean)
2. **Fake Data Removed**: Target = 0 (never allow)
3. **Docs Updated**: 100% current within 7 days
4. **Empty Dirs Removed**: All
5. **Duplicate Files**: Zero tolerance

### Health Score
```
Health Score = (Real Data % × 40) + (Current Docs % × 30) + (Clean Dirs % × 30)

Target: > 95%
Current: Calculate daily
```

---

## 🔄 AUTOMATED RULES BY DIRECTORY

### `/automation-empire/`
- Archive failed experiments after 3 days
- Remove non-converting products after 30 days
- Keep only top 3 versions of workflows
- Delete test automations immediately

### `/feelsharper/` `/studysharper/` (Product Dirs)
- Archive old components after 14 days unused
- Remove commented routes immediately
- Clean build artifacts daily
- Archive old migrations after successful deploy

### `/archive/`
- Compress after 30 days
- Delete after 90 days (with backup)
- Maintain index of archived items
- Keep archive under 1GB total

### Root Directory
- Keep only active documentation
- Archive old plans after completion
- Remove duplicate configurations
- Clean temporary files hourly

---

## 🎯 SMART PRUNING STRATEGIES

### 1. Revenue-Based Retention
```
if (generates_revenue) {
  keep_forever();
} else if (supports_revenue_feature) {
  keep_90_days();
} else {
  archive_after_7_days();
}
```

### 2. Usage-Based Archival
- Track file access patterns
- Archive files not accessed in 14 days
- Keep frequently accessed files optimized
- Move rarely used to cold storage

### 3. Documentation Freshness
- Auto-update timestamps
- Flag stale documentation
- Archive superseded versions
- Keep only current + one previous version

### 4. Dependency Pruning
- Remove unused npm packages weekly
- Clean Python virtual envs monthly
- Archive old Docker images
- Remove unused API keys

### 5. Smart Test Data
```javascript
// Clearly marked test data that self-cleans
const TEST_DATA = {
  _isTest: true,
  _expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  _autoDelete: true,
  data: { /* test content */ }
};
```

---

## 🚨 ENFORCEMENT MECHANISMS

### Pre-Execution Checks
1. Scan for fake data patterns
2. Check documentation age
3. Identify duplicate files
4. Flag large unused assets
5. Verify all TODOs have deadlines

### Post-Execution Cleanup
1. Archive replaced files
2. Update documentation
3. Remove temporary files
4. Compress old logs
5. Update archive index

### Continuous Monitoring
```javascript
// Auto-cleanup watcher
const cleanup = {
  interval: 3600000, // hourly
  actions: [
    'remove_temp_files',
    'archive_old_docs',
    'compress_logs',
    'validate_no_fake_data',
    'update_metrics'
  ]
};
```

---

## 📋 CLEANUP CHECKLIST (Every Session)

### Start of Session
- [ ] Check archive size (keep < 1GB)
- [ ] Scan for fake data
- [ ] Identify stale documentation
- [ ] List unused files
- [ ] Review old TODOs

### During Work
- [ ] Archive before replacing
- [ ] No placeholder content
- [ ] Update related docs
- [ ] Remove debugging code
- [ ] Clean as you go

### End of Session
- [ ] Run cleanup script
- [ ] Update archive index
- [ ] Verify no temp files
- [ ] Check health score
- [ ] Commit only clean code

---

## 🔧 IMPLEMENTATION TOOLS

### VSCode Settings
```json
{
  "files.exclude": {
    "**/.DS_Store": true,
    "**/Thumbs.db": true,
    "**/*.tmp": true,
    "**/*.swp": true,
    "**/node_modules": true,
    "**/.git": true,
    "**/archive": false
  },
  "files.autoSave": "onFocusChange",
  "files.trimTrailingWhitespace": true
}
```

### Git Hooks
```bash
# .git/hooks/pre-commit
#!/bin/sh
# Prevent commits with fake data
if grep -r "lorem\|example\.com\|test@test" --exclude-dir=node_modules .; then
  echo "Error: Fake data detected!"
  exit 1
fi
```

### GitHub Actions
```yaml
name: Cleanup
on:
  schedule:
    - cron: '0 0 * * *' # Daily
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Archive old files
        run: ./scripts/archive.sh
      - name: Remove fake data
        run: ./scripts/validate-real-data.sh
```

---

## 📈 SUCCESS METRICS

### Daily Targets
- Zero fake data incidents
- < 10 files older than 30 days
- < 5 unused components
- Zero duplicate files
- All docs < 7 days old

### Weekly Targets
- Archive size < 100MB growth
- 100% real data in production
- All TODOs addressed or archived
- No broken references
- Clean dependency tree

---

## 🏆 BENEFITS OF STRICT PRUNING

1. **Faster Development**: Find files instantly
2. **Reduced Confusion**: No outdated examples
3. **Better Performance**: Smaller repo, faster builds
4. **Professional Image**: Clean, real, production-ready
5. **Revenue Focus**: Only code that makes money

---

**Remember**: A clean codebase is a profitable codebase. Every fake file is a lie to yourself. Every old document is confusion waiting to happen. Stay real, stay clean, stay profitable.

*Policy Enforcement: AUTOMATIC*
*Archive Location: /archive/[date]/*
*Review Schedule: Weekly*
*Last Updated: 2025-08-18*