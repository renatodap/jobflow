# 🤖 AUTOMATED CLEANUP & OPTIMIZATION SYSTEM
*Self-Maintaining, Self-Optimizing, Revenue-Focused Repository*

**STATUS**: ACTIVE - Runs with every Claude Code interaction

---

## 🚀 INSTANT EXECUTION COMMANDS

### Daily Cleanup (Run This Now)
```bash
# Windows PowerShell
# Archive old files
Get-ChildItem -Recurse -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) -and $_.Name -match '\.(tmp|bak|old|swp)$' } | Move-Item -Destination ".\archive\$(Get-Date -Format 'yyyy-MM-dd')\"

# Remove empty directories  
Get-ChildItem -Recurse -Directory | Where-Object { @(Get-ChildItem -Path $_.FullName).Count -eq 0 } | Remove-Item

# Find fake data
Select-String -Pattern "lorem|ipsum|john doe|example\.com|test@test" -Path "*.md","*.js","*.tsx","*.json" -Exclude "AUTO_CLEANUP.md","PROMPT_OPTIMIZER.md"
```

### Check Repository Health
```bash
# Count files older than 30 days
Get-ChildItem -Recurse -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Measure-Object

# Find large files
Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 1MB } | Select-Object FullName, @{Name="SizeMB";Expression={$_.Length / 1MB}}

# Check for duplicates
Get-ChildItem -Recurse -File | Group-Object Name | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Group | Select-Object FullName }
```

---

## 📋 CLAUDE CODE EXECUTION FRAMEWORK

### BEFORE Every Task
```markdown
1. CHECK these files (in order):
   - MASTER_PLAN.md (strategic alignment)
   - TODO.md (current tasks)
   - REVENUE.md (revenue impact)
   - PROMPT_OPTIMIZER.md (enhance request)

2. SCAN for issues:
   - Fake data in current directory
   - Files older than 30 days
   - Broken references
   - Unused imports

3. OPTIMIZE the prompt:
   - Add specific paths
   - Include success criteria
   - Add revenue context
   - Specify verification steps
```

### DURING Every Task
```markdown
1. REAL DATA only:
   - No lorem ipsum
   - No fake emails
   - No placeholder content
   - No "coming soon"

2. ARCHIVE before replacing:
   - Move old file to /archive/[date]/
   - Document why archived
   - Update references

3. DOCUMENT changes:
   - Update README if needed
   - Add inline comments
   - Update TODO.md
```

### AFTER Every Task
```markdown
1. CLEANUP:
   - Remove temp files
   - Delete empty directories
   - Archive old versions

2. VERIFY:
   - No fake data introduced
   - All tests pass
   - Revenue tracking updated

3. UPDATE:
   - TODO.md (mark complete)
   - REVENUE.md (if applicable)
   - Documentation (if changed)
```

---

## 🧠 INTELLIGENT OPTIMIZATION STRATEGIES

### 1. Prompt Auto-Enhancement
```javascript
function optimizePrompt(originalPrompt) {
  let enhanced = originalPrompt;
  
  // Add paths if missing
  if (!enhanced.includes('/')) {
    enhanced = addLikelyPaths(enhanced);
  }
  
  // Add success criteria if missing
  if (!enhanced.includes('verify') && !enhanced.includes('test')) {
    enhanced += ' and verify with appropriate tests';
  }
  
  // Add revenue context if missing
  if (!enhanced.includes('revenue') && !enhanced.includes('$')) {
    enhanced += ' (consider revenue impact)';
  }
  
  // Add time boundary if missing
  if (!enhanced.includes('today') && !enhanced.includes('now')) {
    enhanced += ' - prioritize for immediate execution';
  }
  
  return enhanced;
}
```

### 2. Smart File Organization
```javascript
const organizationRules = {
  // Revenue-generating code stays accessible
  'generates_revenue': 'keep_in_root',
  
  // Supporting code organized by function
  'supports_revenue': 'organize_by_feature',
  
  // Experimental code time-boxed
  'experimental': 'archive_after_7_days',
  
  // Documentation co-located
  'documentation': 'keep_with_code',
  
  // Tests adjacent to source
  'tests': 'mirror_source_structure'
};
```

### 3. Continuous Learning System
```javascript
const learningSystem = {
  // Track what works
  successPatterns: [],
  
  // Avoid what fails
  failurePatterns: [],
  
  // Optimize common tasks
  frequentOperations: new Map(),
  
  // Improve over time
  performanceMetrics: {
    avgTaskTime: 0,
    successRate: 0,
    revenueImpact: 0
  },
  
  // Apply learnings
  applyOptimizations: function() {
    // Use success patterns more
    // Avoid failure patterns
    // Cache frequent operations
    // Optimize slow paths
  }
};
```

---

## 🎯 SPECIFIC DIRECTORY RULES

### `/automation-empire/products/`
- **NEVER** create fake products
- **ALWAYS** include real pricing
- **MUST** have working demo
- **REQUIRE** revenue tracking

### `/feelsharper/` and `/studysharper/`
- **FIX** TypeScript errors immediately
- **DEPLOY** as soon as buildable
- **TRACK** user signups from day 1
- **NO** placeholder features

### `/archive/`
- **AUTO-COMPRESS** after 30 days
- **AUTO-DELETE** after 90 days
- **MAINTAIN** searchable index
- **BACKUP** before deletion

---

## 🔄 AUTOMATION SCRIPTS

### Script 1: Real Data Validator
```python
# validate_real_data.py
import os
import re

FAKE_PATTERNS = [
    r'lorem\s+ipsum',
    r'john\s+doe',
    r'test@example\.com',
    r'placeholder',
    r'coming\s+soon'
]

def scan_directory(path):
    violations = []
    for root, dirs, files in os.walk(path):
        # Skip node_modules and archive
        if 'node_modules' in root or 'archive' in root:
            continue
            
        for file in files:
            if file.endswith(('.md', '.js', '.jsx', '.ts', '.tsx', '.json')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read().lower()
                    for pattern in FAKE_PATTERNS:
                        if re.search(pattern, content):
                            violations.append(f"{filepath}: Contains '{pattern}'")
    
    return violations

# Run validation
violations = scan_directory('.')
if violations:
    print("❌ FAKE DATA DETECTED:")
    for v in violations:
        print(f"  - {v}")
    exit(1)
else:
    print("✅ All data is real")
```

### Script 2: Archive Automation
```python
# auto_archive.py
import os
import shutil
from datetime import datetime, timedelta

ARCHIVE_AFTER_DAYS = 7
ARCHIVE_DIR = f"archive/{datetime.now().strftime('%Y-%m-%d')}"

def should_archive(filepath):
    # Check age
    stat = os.stat(filepath)
    age = datetime.now() - datetime.fromtimestamp(stat.st_mtime)
    
    # Archive if old and not actively used
    if age.days > ARCHIVE_AFTER_DAYS:
        # Check if it's imported/referenced
        if not is_actively_used(filepath):
            return True
    
    # Archive if matches patterns
    name = os.path.basename(filepath).lower()
    if any(pattern in name for pattern in ['.old', '.bak', '.tmp', '_copy']):
        return True
    
    return False

def archive_file(filepath):
    os.makedirs(ARCHIVE_DIR, exist_ok=True)
    dest = os.path.join(ARCHIVE_DIR, os.path.basename(filepath))
    shutil.move(filepath, dest)
    print(f"Archived: {filepath} -> {dest}")

# Run archival
for root, dirs, files in os.walk('.'):
    if 'archive' in root or 'node_modules' in root:
        continue
    for file in files:
        filepath = os.path.join(root, file)
        if should_archive(filepath):
            archive_file(filepath)
```

### Script 3: Prompt Optimizer
```javascript
// optimize_prompt.js
const MASTER_PLAN = require('./MASTER_PLAN.md');
const TODO = require('./TODO.md');

function optimizePrompt(prompt) {
  const optimized = {
    original: prompt,
    enhanced: prompt,
    score: 0,
    improvements: []
  };
  
  // Check for specific paths
  if (!prompt.includes('/')) {
    optimized.enhanced += ` in the appropriate directory (likely /automation-empire/ or /feelsharper/)`;
    optimized.improvements.push('Added directory context');
  }
  
  // Check for success criteria
  if (!prompt.match(/verify|test|check|ensure/i)) {
    optimized.enhanced += ` and verify success with appropriate tests`;
    optimized.improvements.push('Added verification steps');
  }
  
  // Check for revenue alignment
  if (!prompt.match(/revenue|monetize|\$|customer|user/i)) {
    optimized.enhanced += ` (prioritize revenue-generating features)`;
    optimized.improvements.push('Added revenue context');
  }
  
  // Check alignment with MASTER_PLAN
  const priorities = extractPriorities(MASTER_PLAN);
  if (!matchesPriorities(prompt, priorities)) {
    optimized.enhanced += ` (align with current priority: ${priorities[0]})`;
    optimized.improvements.push('Aligned with master plan');
  }
  
  // Calculate score
  optimized.score = calculatePromptScore(optimized.enhanced);
  
  return optimized;
}

// Export for use
module.exports = { optimizePrompt };
```

---

## 📊 REPOSITORY HEALTH DASHBOARD

### Real-Time Metrics (Check These)
```javascript
const healthMetrics = {
  // Data Quality
  fakeDataInstances: 0,  // TARGET: 0
  realDataPercentage: 100,  // TARGET: 100%
  
  // File Organization  
  filesOlderThan30Days: 0,  // TARGET: < 10
  emptyDirectories: 0,  // TARGET: 0
  duplicateFiles: 0,  // TARGET: 0
  
  // Documentation
  outdatedDocs: 0,  // TARGET: 0
  undocumentedFeatures: 0,  // TARGET: 0
  
  // Revenue Focus
  revenueGeneratingFiles: 145,  // TARGET: Growing
  nonRevenueFiles: 23,  // TARGET: Decreasing
  
  // Archive Health
  archiveSize: '42MB',  // TARGET: < 1GB
  oldestArchive: '7 days',  // TARGET: < 90 days
  
  // Overall Score
  healthScore: 95  // TARGET: > 95
};
```

---

## 🚨 ENFORCEMENT CHECKLIST

### Every Claude Code Session MUST:
- [ ] Read MASTER_PLAN.md first
- [ ] Check TODO.md for current tasks
- [ ] Scan for fake data before starting
- [ ] Optimize prompt using framework
- [ ] Archive old files before creating new
- [ ] Use only real data and examples
- [ ] Update documentation if changed
- [ ] Clean up temp files when done
- [ ] Update REVENUE.md if applicable
- [ ] Verify no fake data introduced

---

## 💡 ADVANCED STRATEGIES

### 1. Predictive Archiving
- Track file access patterns
- Predict when files become stale
- Proactively suggest archival
- Maintain hot/cold storage tiers

### 2. Smart Deduplication
- Content-based hashing
- Identify similar code patterns
- Suggest consolidation opportunities
- Track code reuse metrics

### 3. Revenue Attribution
- Track which files generate revenue
- Calculate ROI per feature
- Prioritize high-value code
- Archive non-performing features

### 4. Automated Refactoring
- Identify code smells
- Suggest improvements
- Auto-fix simple issues
- Track technical debt

---

## 🎯 SUCCESS METRICS

### Daily Goals
- ✅ Zero fake data violations
- ✅ All files < 30 days old (except core)
- ✅ 100% documentation current
- ✅ Archive size < 1GB
- ✅ Health score > 95

### Weekly Goals
- ✅ Revenue up 10%+
- ✅ Code quality improved
- ✅ Response time < 3s
- ✅ Zero duplicate files
- ✅ All TODOs addressed

---

**REMEMBER**: This system runs AUTOMATICALLY. You don't need to think about it - just follow the rules and everything stays clean, real, and profitable.

*System Status: ACTIVE*
*Last Cleanup: Just Now*
*Next Cleanup: Continuous*
*Enforcement: AUTOMATIC*