// .github/CONTRIBUTING.md
# Contributing to Bridge to Brilliance

Thank you for your interest in contributing! This guide will help you understand our development workflow and standards.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` from `.env.local.example`
4. Run development server: `npm run dev`

## Code Style

### TypeScript
- Strict mode enabled
- Use explicit types > type inference where applicable
- Interfaces for objects, types for unions/primitives

### File Naming
- Components: `PascalCase.tsx`
- Pages: `kebab-case.tsx`
- Services: `camelCase.service.ts`
- Hooks: `useHook.ts`
- Utils: `camelCase.ts`

### Folder Structure
```
feature/
├── components/      # Feature-specific components
├── types/          # Feature types
├── hooks/          # Feature hooks
└── utils/          # Feature utilities
```

## Commit Messages

Follow conventional commits:
```
feat: add user authentication
fix: resolve login redirect bug
docs: update API documentation
refactor: reorganize auth service
test: add auth service tests
style: format code with prettier
```

## Pull Request Process

1. Create feature branch: `git checkout -b feature/description`
2. Make changes following code style guidelines
3. Write/update tests
4. Update documentation
5. Run linter: `npm run lint`
6. Push and create PR with description
7. Ensure CI passes

## Testing

```bash
# Run tests (when test framework is added)
npm test

# Watch mode
npm test -- --watch
```

## Performance Considerations

- Minimize bundle size (check `npm run analyze`)
- Use React.memo for expensive components
- Implement pagination for large lists
- Optimize images
- Avoid unnecessary re-renders

## Security Guidelines

- Never commit secrets to Git
- Always validate user input
- Use parameterized queries
- Implement proper CORS policies
- Keep dependencies updated
- Follow OWASP guidelines

## Documentation

- Update README.md for major changes
- Document complex functions
- Add JSDoc comments
- Keep ARCHITECTURE.md current

## Need Help?

- Check existing documentation
- Review similar implementations
- Ask in discussions or PRs
- Check error logs carefully

Thank you for contributing! 🚀
