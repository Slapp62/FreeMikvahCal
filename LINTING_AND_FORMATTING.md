# Linting and Formatting Guide

This project uses ESLint for code linting and Prettier for code formatting, configured with industry-standard rules.

## Available Commands

### Frontend (`/frontend`)

```bash
# Linting
npm run lint          # Check for linting errors (allows warnings)
npm run lint:strict   # Check for linting errors (no warnings allowed)
npm run lint:fix      # Auto-fix linting errors

# Formatting
npm run format        # Check code formatting
npm run format:fix    # Auto-fix code formatting

# Type Checking
npm run typecheck     # Check TypeScript types

# Combined Check
npm run check         # Run typecheck + lint + format
```

### Backend (`/backend`)

```bash
# Linting
npm run lint          # Check for linting errors (no warnings allowed)
npm run lint:fix      # Auto-fix linting errors

# Formatting
npm run format        # Check code formatting
npm run format:fix    # Auto-fix code formatting

# Combined Check
npm run check         # Run lint + format
```

## Configuration Files

### Frontend
- **ESLint**: `eslint.config.js`
  - TypeScript support with `typescript-eslint`
  - React Hooks rules with `eslint-plugin-react-hooks`
  - Prettier integration with `eslint-config-prettier`
  - Industry standard rules for code quality

- **Prettier**: `.prettierrc`
  - Single quotes
  - 2 space indentation
  - Semicolons required
  - 100 character line width
  - Trailing commas (ES5 style)

### Backend
- **ESLint**: `eslint.config.js`
  - Node.js environment configured
  - CommonJS module system
  - Prettier integration
  - Best practices for server-side code

- **Prettier**: `.prettierrc`
  - Same configuration as frontend for consistency

## Pre-Commit Hooks (Optional)

You can set up Husky to run linting and formatting automatically before commits:

```bash
# In project root
npm install --save-dev husky lint-staged
npx husky init

# Add to .husky/pre-commit
npm run lint:fix --workspace=frontend
npm run lint:fix --workspace=backend
npm run format:fix --workspace=frontend
npm run format:fix --workspace=backend
```

## Editor Integration

### VS Code

Install these extensions:
- ESLint
- Prettier - Code formatter

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "./frontend",
    "./backend"
  ]
}
```

### WebStorm / IntelliJ

1. Go to Preferences → Languages & Frameworks → JavaScript → Prettier
2. Enable "On save"
3. Go to Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
4. Enable "Automatic ESLint configuration"
5. Enable "Run eslint --fix on save"

## Common Issues and Solutions

### "Cannot find module 'eslint-config-prettier'"

```bash
cd frontend  # or backend
npm install
```

### Prettier and ESLint conflicts

The configurations are already set up to work together. Prettier handles formatting, ESLint handles code quality. If you see conflicts, run:

```bash
npm run format:fix
npm run lint:fix
```

### Too many warnings

The frontend uses `npm run lint` which allows warnings. Use `npm run lint:strict` for stricter checking before commits.

## Rules Explained

### ESLint Rules

**Frontend:**
- `@typescript-eslint/no-unused-vars`: Errors on unused variables (except those prefixed with `_`)
- `@typescript-eslint/no-explicit-any`: Warns when using `any` type
- `react-hooks/rules-of-hooks`: Enforces Rules of Hooks
- `react-hooks/exhaustive-deps`: Warns about missing dependencies in hooks
- `no-console`: Warns on console statements (except `console.warn` and `console.error`)

**Backend:**
- `no-unused-vars`: Errors on unused variables (except those prefixed with `_`)
- `prefer-const`: Enforces using `const` when variables are not reassigned
- `no-var`: Disallows `var` (use `let` or `const`)
- `eqeqeq`: Requires `===` and `!==` instead of `==` and `!=`
- `no-else-return`: Disallows unnecessary `else` after `return`

### Prettier Rules

- **printWidth**: 100 characters
- **tabWidth**: 2 spaces
- **semi**: Always use semicolons
- **singleQuote**: Use single quotes
- **trailingComma**: ES5 trailing commas
- **arrowParens**: Always include parentheses around arrow function parameters
- **endOfLine**: LF (Linux/Mac style)

## Before Deployment

Always run the check command before deploying:

```bash
# Frontend
cd frontend
npm run check

# Backend
cd backend
npm run check
```

This ensures all code passes TypeScript, linting, and formatting checks.
