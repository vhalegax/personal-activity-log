# Testing Guide

## 📋 Test Coverage

Total: **17 tests** across 4 test files

### Component Tests (9 tests)

#### 1. Signup Page Tests (3 tests)

**File:** `src/app/signup/__tests__/signup.test.tsx`

- ✅ **Validation errors** - Shows error messages for invalid form input
- ✅ **Duplicate email** - Handles server error when email already registered
- ✅ **Success flow** - Shows success message and redirects after signup

#### 2. Login Page Tests (6 tests)

**File:** `src/app/login/__tests__/login.test.tsx`

- ✅ **Render form** - All form elements display correctly
- ✅ **Required fields** - Email and password fields are required
- ✅ **Invalid credentials** - Shows error for wrong email/password
- ✅ **Success login** - Calls signIn with correct credentials
- ✅ **Loading state** - Disables form during submission
- ✅ **Signup link** - Link to signup page is present

### API Route Tests (8 tests)

#### 3. POST /api/auth (3 tests)

**File:** `src/app/api/auth/__tests__/route.test.ts`

- ✅ **Missing email** - Returns 400 error when email not provided
- ✅ **Invalid email type** - Returns 400 error when email is not a string
- ✅ **Valid email** - Creates or finds user successfully

#### 4. POST /api/auth/signup (5 tests)

**File:** `src/app/api/auth/signup/__tests__/route.test.ts`

- ✅ **Duplicate email** - Returns 400 when email already registered
- ✅ **Success signup** - Creates user in auth and database
- ✅ **Database rollback** - Deletes auth user if database insert fails
- ✅ **Auth error** - Handles Supabase auth creation errors
- ✅ **Server error** - Handles internal errors gracefully

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests once
bun run test:run

# Watch mode (auto re-run on file changes)
bun run test:watch

# With coverage report
bun run test:coverage
```

### Advanced Options

```bash
# Run specific test file
bun run test:run src/app/login/__tests__/login.test.tsx

# Run with verbose output
bun run test:run --reporter=verbose

# Run tests matching pattern
bun run test:run signup
```

---

## 📊 Coverage Report

Current coverage: **89.23%** overall

```
File                 | % Stmts | % Branch | % Funcs | % Lines
---------------------|---------|----------|---------|--------
All files            |   89.23 |    80.82 |   86.66 |   89.63
 app/api/auth        |     100 |    83.33 |     100 |     100
 app/api/auth/signup |      90 |    81.25 |     100 |   89.47
 app/login           |      90 |       90 |     100 |      90
 app/signup          |   95.65 |    81.25 |    87.5 |     100
 hooks               |   76.08 |    66.66 |   77.77 |   76.08
```

### View HTML Coverage Report

```bash
bun run test:coverage
open coverage/lcov-report/index.html
```

---

## 🧪 Test Architecture

### Test Setup

- **Test Runner:** Vitest with jsdom environment
- **Testing Library:** @testing-library/react for component tests
- **Mocking:** Vitest's built-in vi.mock() for API and Supabase

### Mock Configuration

**Global Mocks** (in `src/tests/setupTests.ts`):

- Supabase client
- Next.js navigation hooks
- Fetch API for signup endpoint

**Per-file Mocks:**

- API routes mock Supabase admin client
- Component tests mock auth context providers

### Component Test Pattern

```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>
  );
};
```

### API Test Pattern

```typescript
const request = new NextRequest('http://localhost:3000/api/auth', {
  method: 'POST',
  body: JSON.stringify({ email: 'test@example.com' }),
});

const response = await POST(request);
const data = await response.json();
```

---

## ⚠️ Important Notes

### Avoid `bun test`

**Don't use** `bun test` - it uses Bun's test runner which is not compatible with Vitest + jsdom.

**Always use** `bun run test:run` or `bunx vitest run` instead.

### Coverage in Git

The `coverage/` directory is ignored in `.gitignore` to avoid committing generated files.

### Act Warnings

You may see act() warnings in console output. These are safe to ignore as they come from AuthProvider's useEffect during test render.

---

## 🔮 Future Test Improvements

### Recommended Additions

1. **E2E Tests** with Playwright
   - Full signup → login → task creation flow
   - Test actual API routes with real database
2. **Hook Tests**
   - Isolated tests for `use-auth.tsx`
   - Test `use-create-task.ts` and `use-fetch-tasks.ts`

3. **Integration Tests**
   - Test API routes with test Supabase instance
   - Avoid complex mocking for server code

4. **Visual Regression**
   - Screenshot tests for UI components
   - Catch unexpected style changes

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)
