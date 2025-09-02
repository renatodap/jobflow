# 🧠 PROMPT OPTIMIZATION FRAMEWORK
*Automatic Prompt Enhancement for Maximum Claude Code Output*

**CRITICAL**: This file governs ALL interactions with Claude Code. Every prompt should be filtered through these rules.

---

## 🎯 PROMPT REWRITING RULES (Apply to EVERY Request)

### 1. CLARITY ENHANCEMENT
**Before**: "fix the bug in feelsharper"
**After**: "In the /feelsharper directory, identify and fix TypeScript type errors preventing build, focusing on auth flow and payment integration. Run npm run typecheck to verify fixes."

### 2. SPECIFICITY INJECTION
**Before**: "create a dashboard"
**After**: "Create a React dashboard component in /automation-empire/monitoring/ that displays: real-time MRR, active users, automation success rate, and recent logs. Use existing Tailwind classes for styling."

### 3. CONTEXT PROVISION
**Before**: "add payment processing"
**After**: "Integrate Stripe payment processing in /feelsharper using the existing Supabase auth. Add subscription tiers: Basic ($29/mo), Pro ($49/mo). Reference the working implementation pattern from /studysharper if it exists."

### 4. OUTPUT SPECIFICATION
**Before**: "analyze the codebase"
**After**: "Analyze the codebase structure, identify: 1) Revenue-generating opportunities, 2) Quick-win improvements, 3) Technical debt. Output a prioritized action list with time estimates."

---

## 🔄 AUTOMATIC PROMPT ENHANCEMENT PATTERNS

### Pattern 1: Add File Paths
- **Detect**: Any mention of a project/feature
- **Enhance**: Add specific directory paths
- **Example**: "feelsharper" → "/feelsharper directory"

### Pattern 2: Include Verification Steps
- **Detect**: Any build/deploy request
- **Enhance**: Add testing commands
- **Example**: "deploy X" → "deploy X, verify with [specific test], check [metric]"

### Pattern 3: Specify Success Criteria
- **Detect**: Any creation request
- **Enhance**: Add measurable outcomes
- **Example**: "create automation" → "create automation that processes X items/minute with <1% error rate"

### Pattern 4: Add Revenue Context
- **Detect**: Any feature work
- **Enhance**: Connect to revenue impact
- **Example**: "add feature X" → "add feature X to increase conversion by Y%, targeting $Z revenue"

---

## 🚫 ANTI-PATTERNS TO AVOID

### Never Allow:
1. **Vague Requests**: "make it better" → Require specific metrics
2. **No Success Criteria**: "build X" → Must include "X that achieves Y"
3. **Missing Context**: "fix the error" → Which file, what error, what's expected behavior
4. **Open-Ended Tasks**: "improve performance" → Specific metrics and thresholds needed
5. **Fake Data Creation**: "add sample data" → Use real scenarios or clearly marked test data

---

## 📊 PROMPT SCORING SYSTEM

Rate every prompt before execution:

### Clarity Score (1-5)
- 5: Exact files, lines, and expected outcomes specified
- 4: Clear directory and feature specified
- 3: General area and goal clear
- 2: Somewhat vague but workable
- 1: Needs complete rewrite

### Context Score (1-5)
- 5: Includes history, dependencies, and related systems
- 4: Good context with some assumptions needed
- 3: Basic context provided
- 2: Minimal context
- 1: No context given

### Output Score (1-5)
- 5: Exact format, structure, and validation specified
- 4: Clear deliverables defined
- 3: General output expectations
- 2: Vague output needs
- 1: No output specification

**Minimum Acceptable Score: 12/15**

---

## 🎮 PROMPT TEMPLATES (Use These)

### Revenue Feature Template
```
Task: [Specific feature name]
Location: [Exact directory path]
Revenue Impact: [$ amount or % increase]
Success Metrics: [Measurable outcomes]
Dependencies: [Required systems/APIs]
Verification: [How to test success]
Deadline: [Time constraint]
```

### Bug Fix Template
```
Issue: [Exact error message]
File: [Path and line numbers if known]
Current Behavior: [What happens now]
Expected Behavior: [What should happen]
Reproduction Steps: [How to trigger]
Testing: [Commands to verify fix]
Impact: [Users/revenue affected]
```

### Automation Creation Template
```
Automation Name: [Descriptive name]
Trigger: [What starts it]
Input: [Data sources]
Processing: [Step-by-step logic]
Output: [Deliverables]
Error Handling: [Failure scenarios]
Monitoring: [Success metrics]
Revenue Model: [How it generates money]
```

### Analysis Request Template
```
Scope: [Specific directories/features]
Focus Areas: [Numbered list]
Exclude: [What to ignore]
Output Format: [Table/list/report]
Prioritization: [Ranking criteria]
Actionable: [Yes/No with next steps]
Time Estimate: [For recommendations]
```

---

## 🤖 AUTOMATIC ENHANCEMENTS (Apply Always)

### 1. Directory Specification
- Add full paths to any file/folder mentions
- Include file extensions
- Specify relative paths from Projects/

### 2. Command Inclusion
- Add verification commands
- Include rollback procedures
- Specify test commands

### 3. Success Validation
- Add "verify by checking..."
- Include expected outputs
- Specify acceptance criteria

### 4. Time Boundaries
- Add execution time limits
- Specify deadline if urgent
- Include time estimates for tasks

### 5. Revenue Connection
- Link to revenue impact
- Specify cost savings
- Include ROI calculations

---

## 🔍 PROMPT ANALYSIS CHECKLIST

Before executing ANY prompt, verify:

- [ ] **Specific Location**: Exact files/directories specified?
- [ ] **Clear Outcome**: Success criteria defined?
- [ ] **Verification Method**: How to test completion?
- [ ] **Revenue Impact**: Connection to business goals?
- [ ] **No Fake Data**: Only real, production-ready content?
- [ ] **Time Bound**: Deadline or urgency specified?
- [ ] **Dependencies Clear**: Required systems identified?
- [ ] **Rollback Plan**: Can changes be undone?
- [ ] **Documentation**: Will changes be documented?
- [ ] **Archive Old**: Will outdated content be archived?

---

## 💡 SMART STRATEGIES

### 1. Parallel Execution
Transform: "Do A then B then C"
Into: "Execute A, B, C in parallel where possible"

### 2. Batch Operations
Transform: "Update file X"
Into: "Update file X and any similar patterns in directory Y"

### 3. Preemptive Validation
Transform: "Create feature X"
Into: "Validate prerequisites for X, create X, verify X works"

### 4. Documentation Generation
Transform: "Build Y"
Into: "Build Y with inline documentation and update README"

### 5. Revenue Prioritization
Transform: "Fix bugs"
Into: "Fix revenue-impacting bugs first, sorted by user impact"

---

## 📈 OPTIMIZATION METRICS

Track these for every Claude Code session:

1. **Prompt Iterations**: Target < 2 (get it right first time)
2. **Task Completion Rate**: Target > 90%
3. **Revenue Impact**: Every task should connect to revenue
4. **Documentation Updates**: 100% of changes documented
5. **Archive Rate**: Old docs moved to /archive within 7 days

---

## 🚨 ENFORCEMENT RULES

### MANDATORY for every prompt:
1. **Check MASTER_PLAN.md** - Align with strategy
2. **Update TODO.md** - Track progress
3. **Update REVENUE.md** - If revenue-related
4. **Archive old files** - Move to /archive/[date]/
5. **No fake data** - Only real, valuable content

### REJECT prompts that:
1. Don't specify location
2. Create fake/sample data
3. Don't include success criteria
4. Ignore revenue impact
5. Don't update documentation

---

## 🎯 QUICK REWRITE EXAMPLES

### Example 1
❌ **Bad**: "Make a login page"
✅ **Good**: "Create a React login component in /feelsharper/app/auth/login/page.tsx using Supabase auth, matching existing design system, with email/password and Google OAuth, tracking login success rate for conversion optimization"

### Example 2
❌ **Bad**: "Fix the deployment"
✅ **Good**: "Debug Vercel deployment failure for /feelsharper, check build logs for TypeScript errors, fix type issues, verify with 'npm run build', deploy to production, confirm live at feelsharper.com"

### Example 3
❌ **Bad**: "Add analytics"
✅ **Good**: "Integrate PostHog analytics in /automation-empire tracking: page views, conversion events, user journeys. Add revenue attribution tracking. Verify data flow in PostHog dashboard."

---

## 🔄 CONTINUOUS IMPROVEMENT

This framework updates based on:
1. **Success patterns**: What works gets codified
2. **Failure analysis**: What fails gets prevented
3. **Revenue results**: What makes money gets prioritized
4. **Time tracking**: What's slow gets optimized

---

**Remember**: Every prompt is an opportunity to maximize value. Unclear requests waste time and create debt. Clear, optimized prompts build wealth.

*Last Updated: 2025-08-18*
*Next Review: Weekly*
*Enforcement: MANDATORY*