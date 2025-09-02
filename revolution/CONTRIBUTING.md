# Contributing Guidelines

## Development Rules (MANDATORY)

### Commit Protocol
- **Format**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
- **Reference**: Include claude.md anchor link in commit body
- **Scope**: Single feature/component per commit
- **Tests**: All tests must pass before commit

Example:
```
feat: add email collection to landing page

Implements waitlist signup functionality as defined in
claude.md#phase-0-task-1-create-landing-page

- Email validation with regex
- Database storage via simple JSON file
- Success/error messaging
- Analytics event tracking

Refs: claude.md#P0-T1
Tests: email validation, form submission, storage
```

### Code Quality Standards
- **TypeScript**: Strict mode, zero type errors
- **Testing**: Jest + React Testing Library, minimum 80% coverage
- **Formatting**: Prettier + ESLint, auto-format on save
- **Performance**: Lighthouse score >90 for all pages
- **Security**: No secrets in code, environment variables only

### File Organization
```
src/
├── components/         # Reusable UI components
├── pages/             # Next.js pages (if using pages router)
├── app/               # Next.js app router pages
├── lib/               # Utilities and services
├── types/             # TypeScript type definitions
├── tests/             # Test files
└── public/            # Static assets
```

### Testing Strategy
- **Unit Tests**: All utility functions and components
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Critical user flows (signup, payment, page generation)
- **Performance Tests**: Lighthouse CI on every deployment

### Release Process
1. Feature development on branch
2. All tests pass locally
3. Update claude.md with results
4. Conventional commit with claude.md reference
5. Deploy to staging
6. Verify acceptance criteria
7. Deploy to production
8. Monitor for 15 minutes post-deploy

### Security Checklist
- [ ] No API keys or secrets in code
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] HTTPS enforcement
- [ ] Rate limiting on API endpoints

### Performance Requirements
- **Time-to-First-Byte**: <800ms
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Documentation Requirements
- All functions have TypeScript types
- Complex logic has inline comments
- API endpoints documented with examples
- README updated with setup instructions
- claude.md updated with all decisions and progress