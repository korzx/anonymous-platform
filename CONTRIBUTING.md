# 🤝 Contribution Guidelines

Thank you for your interest in contributing to the Anonymous Platform! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome diverse perspectives
- Focus on the code, not the person
- Help maintain a safe community for everyone

## How to Contribute

### 1. Report Issues

Found a bug or have a suggestion? Open an issue:
- **Bug Report**: Describe the issue, steps to reproduce, and expected behavior
- **Feature Request**: Explain the feature and why it would be useful
- **Security Issue**: **DO NOT** open a public issue. Email security details privately

### 2. Submit Code

#### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier OK)
- Understand the [Architecture](docs/ARCHITECTURE.md)

#### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/anonymous-platform.git
cd anonymous-platform

# Install dependencies
npm install

# Create .env.local from .env.example
cp .env.example .env.local
# Fill in your Supabase credentials

# Run development server
npm run dev
```

#### Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the code style**:
   - Use TypeScript (strict mode)
   - Follow existing naming conventions
   - Add comments for complex logic
   - Keep functions small and focused

3. **Test your changes**:
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

4. **Security First**:
   - Never commit `.env` files
   - Check [SECURITY.md](docs/SECURITY.md) for security principles
   - Review encryption and data handling
   - Test with sensitive data

5. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add feature description"
   ```
   
   Format: `type: description`
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation
   - `refactor`: Code restructure
   - `perf`: Performance improvement
   - `test`: Tests

6. **Push and create a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### 3. Pull Request Process

- **Title**: Clear and descriptive (e.g., "Fix encryption key rotation on daily reset")
- **Description**: 
  - What changed and why
  - Any breaking changes
  - Testing performed
  - Screenshots/logs if relevant
- **Checks**: Ensure all tests pass
- **Review**: Address feedback respectfully

## Development Guidelines

### Privacy & Security

- **No personal data collection** - Maintain zero-tracking principle
- **Encryption**: All sensitive data must be encrypted
- **No logging of sensitive data**: Never log IPs, emails, or user identifiers
- **Rotating hashes**: Use salted, rotating hashes for any identifier

### Code Quality

```bash
# Type checking (required)
npm run type-check

# Linting (required)
npm run lint

# Build test (required)
npm run build
```

### Performance

- Minimize bundle size
- Avoid unnecessary re-renders
- Use server-side rendering where appropriate
- Cache appropriately

## Documentation

- Update [README.md](README.md) for user-facing changes
- Update [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system changes
- Update [API.md](docs/API.md) for API changes
- Add JSDoc comments to functions

## Testing

While not currently automated, test your changes:

1. **Manual Testing**:
   - Test on desktop and mobile
   - Test all affected features
   - Test error cases

2. **Security Testing**:
   - Verify no data leakage
   - Test rate limiting
   - Test encryption/decryption

3. **Performance Testing**:
   - Check bundle size: `npm run build`
   - Monitor load times

## Getting Help

- **Questions?** Open a discussion or issue
- **Need guidance?** Review existing code and documentation
- **Stuck?** Comment on your PR for help

## Project Priorities

1. **Privacy & Security** - Never compromise anonymity
2. **Performance** - Keep the platform fast and responsive
3. **User Experience** - Intuitive and accessible
4. **Code Quality** - Maintainable and well-documented

## Community

- Discussions: Use GitHub Discussions
- Issues: Use GitHub Issues
- Pull Requests: Review and discuss on PRs

---

Thank you for making the Anonymous Platform better! 🎉
