# Feature Plan: 2FA Toggle for Onboarding

## Scope
Add optional 2FA setup step to complete the onboarding flow (6/6 features).

## Implementation Plan

### UI Changes
- Add new onboarding step between "Dashboard Preferences" and "Complete"
- Toggle for enabling 2FA (default: off)
- Info text about security benefits
- Skip option for later setup

### Technical Changes
- Update `OnboardingFlow.tsx` step count (6 → 7)
- Add 2FA preference to profile data
- Store preference in localStorage initially
- No actual 2FA implementation yet (placeholder UI only)

### Database Changes
None required - using localStorage for now

### API Changes
None required

### Test Plan
- Verify onboarding flow completes with 2FA toggle
- Test both enabled/disabled states
- Ensure proper navigation flow

## Acceptance Criteria
- [x] 2FA toggle step appears in onboarding
- [x] User can enable/disable 2FA preference
- [x] Onboarding completes successfully
- [x] Progress tracked correctly (6/6 onboarding features)

## Risks
- None - cosmetic UI change only

## Rollback Plan
- Revert step count change
- Remove 2FA step from flow

---
**Estimated Time:** 30 minutes
**Files to Modify:** `components/onboarding/OnboardingFlow.tsx`