# Pull Request Checklist

Copy this checklist into your PR description and check off items as completed:

```markdown
## PR Checklist

### Content Quality
- [ ] MDX posts follow the template format in `/prompts/blog_builder_mdx.md`
- [ ] Similarity ≤25% per single source (validated with similarity-guard)
- [ ] No direct quotes used anywhere
- [ ] Sources listed as "Sources consulted" at post end

### Technical Validation  
- [ ] All internal links verified (return 200 OK)
- [ ] Cover images present and correct size:
  - [ ] Blog: 1200×630px at `/public/images/blog/[slug].jpg`
  - [ ] Instagram: 1080×1350px if applicable
- [ ] No secrets, API keys, or `.env` values in diff
- [ ] Build completes successfully (`npm run build`)
- [ ] TypeScript has no errors (`npm run typecheck`)

### Content Validation
- [ ] Frontmatter includes all required fields
- [ ] Post type (T1-T5) correctly assigned
- [ ] Tags include relevant categories
- [ ] Reading time accurately estimated
- [ ] Date and slug follow format: `blog/yyyy/mm/slug`

### Style & Brand
- [ ] Uses brand colors from palette only
- [ ] Icons from Iconoir library only
- [ ] No emojis in body text
- [ ] Follows voice guidelines (minimal, decisive, practical)

### Documentation
- [ ] README updated if new features added
- [ ] RUNBOOK updated if new procedures added
- [ ] Comments added for complex logic
- [ ] Migration notes if breaking changes

### Testing
- [ ] Manually tested in development
- [ ] Verified mobile responsive
- [ ] Checked in Chrome, Firefox, Safari
- [ ] Accessibility: keyboard navigable
- [ ] No console errors

### Final Checks
- [ ] No placeholder content (lorem ipsum, "TODO", etc.)
- [ ] No test data that looks real
- [ ] Commit message follows convention: `feat|fix|docs|chore: description`
- [ ] Branch name descriptive
- [ ] Ready for production

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature with breaking changes)
- [ ] Documentation update
- [ ] Content addition
- [ ] Configuration change

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Additional Notes
[Any additional context for reviewers]
```

## Automated Checks

The CI pipeline automatically validates:
- Code compilation
- Linting (if configured)
- Frontmatter structure
- Build success
- Placeholder content detection

## Review Priority

**High Priority:**
- Production-affecting changes
- API integrations
- Payment/billing related
- Security updates

**Medium Priority:**
- New features
- Content updates
- UI improvements
- Performance optimizations

**Low Priority:**
- Documentation
- Refactoring
- Test additions
- Development tooling