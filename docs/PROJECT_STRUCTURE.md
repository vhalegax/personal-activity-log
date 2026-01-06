# My Next.js Shadcn Starter - Project Structure Standards

This document outlines the standard folder structure for this project. All files should be organized under the `src/` directory to maintain consistency and scalability. This structure is designed for a Next.js application with App Router, focusing on e-commerce/wedding stationery features.

## Folder Structure

```
src/
├── global.d.ts                    # Global type definitions
├── api-client/                    # API client modules
│   ├── auth-api.ts                # Authentication API calls
│   ├── cart-api.ts                # Shopping cart API calls
│   ├── categories-api.ts          # Product categories API calls
│   ├── orders-api.ts              # Order management API calls
│   └── ...
├── app/                           # Next.js App Router structure
│   ├── (auth)/                    # Authenticated routes group
│   ├── (public)/                  # Public routes group
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   └── ...
├── assets/                        # Static assets
│   ├── fonts/                     # Font files and @font-face declarations
│   └── styles/                    # Global SCSS files
├── components/                    # React components
│   ├── ui/                        # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── index.ts               # Barrel exports
│   ├── Auth/                      # Auth-related components
│   │   ├── AuthSignInForm.tsx
│   │   └── AuthSignUpForm.tsx
│   ├── Order/                     # Order-related components
│   │   ├── OrderSummary.tsx
│   │   └── OrderCheckoutForm.tsx
│   ├── Category/                  # Category-related components
│   │   ├── CategoryFilter.tsx
│   │   └── CategoryList.tsx
│   └── ...
├── config/                        # Configuration files
│   ├── env.ts                     # Environment variables validation
│   ├── constants.ts               # App constants
│   └── ...
├── data/                          # Static data
│   ├── countries.ts               # Country list data
│   ├── meta-defaults.ts           # Default meta tags
│   ├── json-ld.ts                 # JSON-LD structured data
│   └── wedding-data.ts            # Wedding-specific static data
├── hooks/                         # Custom React hooks
│   ├── use-breakpoint.ts          # Responsive breakpoint hook
│   ├── use-media-query.ts         # Media query hook
│   ├── use-cart.ts                # Cart state hook
│   └── ...
├── lib/                           # Utility libraries
│   ├── utils.ts                   # General utilities (cn, formatters)
│   ├── error-handler.ts           # Error handling utilities
│   ├── logger.ts                  # Logging utilities
│   └── ...
├── schemas/                       # Validation schemas
│   ├── cart.schema.ts             # Cart validation schema
│   ├── wedding-stationery.schema.ts # Wedding stationery validation
│   └── ...
├── stores/                        # State management
│   ├── cart.store.ts              # Cart state (Zustand/Pinia)
│   ├── category.store.ts          # Category state
│   ├── coupon.store.ts            # Coupon state
│   ├── product.store.ts           # Product state
│   └── ...
├── types/                         # TypeScript type definitions
│   ├── auth.types.ts              # Authentication types
│   ├── cart.types.ts              # Cart-related types
│   ├── product.types.ts           # Product types
│   └── ...
└── utils/                         # Additional utilities
    ├── date-utils.ts              # Date formatting utilities
    ├── string-utils.ts            # String manipulation utilities
    └── ...
```

## Guidelines

### Naming & Identifiers (Global best-practices)

- **Folders**: Use PascalCase for feature/domain folders only under `components/` (e.g., `Auth/`, `Order/`). For non-`components/` folders (top-level or technical folders), use kebab-case (e.g., `api-client/`, `hooks/`, `config/`). `components/ui/` is a shared/technical UI folder — follow the `components/ui` rules.
- **UI components** (`components/ui/`): Use kebab-case file names: `button.tsx`, `input-otp.tsx`.
- **Feature components** (`components/Auth/`, etc.): Use PascalCase file names with a feature prefix: `AuthSignInForm.tsx`, `OrderSummary.tsx`.
- **Hooks — file naming**: Use kebab-case with `use-` prefix for filenames (e.g., `use-breakpoint.ts`, `use-cart.ts`).
- **Hooks — function naming**: Export hook functions in camelCase with `use` prefix (e.g., `useBreakpoint`, `useCart`).
- **Types**: Use PascalCase and store in `.types.ts` files (e.g., `auth.types.ts`, `order.types.ts`).
- **Schemas**: Use PascalCase with `.schema.ts` suffix (e.g., `CartSchema`).
- **Stores**: Use camelCase filenames with `.store.ts` suffix (e.g., `cart.store.ts`) and export hooks like `useCartStore`.
- **Utilities**: Use camelCase filenames (e.g., `dateUtils.ts`, `stringUtils.ts`).
- **API clients**: Use kebab-case filenames (e.g., `auth-api.ts`, `cart-api.ts`).
- **Config/Data**: Use camelCase or kebab-case as appropriate (e.g., `env.ts`, `constants.ts`, `countries.ts`).
- **Environment variables**: Use UPPER_SNAKE_CASE (e.g., `NEXT_PUBLIC_API_URL`) and validate/map them in `env.ts`.
- **Tailwind / utility usage**: Prefer semantic utility usage rather than hard-coded values to preserve theming and dark mode.
- **JS/TS variables & functions**: Use camelCase for variables and function names (e.g., `userName`, `fetchProducts`).
- **Constants**: Use UPPER_SNAKE_CASE for primitive constants (e.g., `API_TIMEOUT`) and PascalCase for exported configuration objects (e.g., `ThemeConfig`).
- **Barrel exports & file naming for new files**: Follow these rules for new files and prefer barrel exports (`index.ts`) for shared modules.

### AI-generated Code Formatting / Spacing

- When code is generated by AI or a bot, it must be reviewed and adjusted for human readability.
- Preferred spacing: add a single blank line between logical blocks such as:
  - top-level imports and the first statement
  - variable/constant declaration blocks and following logic
  - separate `if`/`else`/`switch` blocks
  - function declarations and their caller/consumer blocks
  - return statements and trailing logic
- Use `npm run format:ai` to format API and component files produced by AI (runs Prettier on `src/app/api` and `src/components`).
- After `npm run format:ai`, manually verify blank-line placement; Prettier will normalize whitespace but you may add one extra blank line between logical blocks when helpful for a human reader.
- If you want to apply human-friendly spacing project-wide, run `npm run format`.

### Repository Rules (Do not change existing structure)

- **Do not rename, move, or restructure existing files or folders** unless you are explicitly instructed to do so. This repository may contain historical or legacy structure that must remain stable.
- The standards in this document apply to new files and folders created after this guideline is adopted. When adding new items, follow the naming and organization rules here.
- If you need to change existing structure for a specific reason, open a discussion / request and get explicit approval before making structural changes.
- Note: "Do not change existing folder/file structure unless explicitly requested. These standards apply only to new files/folders."

Use barrel exports (`index.ts`) for clean imports

- Prefer absolute imports with `@/` alias
- Import types from `types/` folder
- Import utilities from `lib/` or `utils/`

### Component Organization

- Feature-based folders (auth/, cart/, product/)
- Shared UI components in `ui/` subfolder
- Each component folder should have its own `index.ts` for exports

### State Management

- Use Zustand or Pinia for global state
- Keep stores in `stores/` folder
- Use custom hooks in `hooks/` for state access

### API Client

- Centralized API calls in `api-client/`
- Use consistent error handling
- Implement proper TypeScript types

### Validation

- Use Zod schemas in `schemas/`
- Validate at API boundaries and form submissions
- Export schemas for reuse

### Assets and Styles

- Font files and declarations in `assets/fonts/`
- Global styles in `assets/styles/`
- Component-specific styles co-located with components

## Examples

### Importing Components

```typescript
// Good: Barrel import
// Good: Feature-specific import
import { AuthSignInForm } from '@/components/Auth';
import { OrderCheckoutForm } from '@/components/Order';
import { Button, Input, Card } from '@/components/ui';
```

### Using Types

```typescript
import type { CartSchema } from '@/schemas';
import type { User, Order } from '@/types';
```

### API Client Usage

```typescript
import { getProducts, addToCart } from '@/api-client';
```

### State Management

```typescript
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useCartStore } from '@/stores/cart.store';
```

## Migration Notes

When adding new features:

1. Create feature folder in `components/` with PascalCase name (e.g., `Auth/`) and use PascalCase file names with feature prefix (e.g., `AuthLoginForm.tsx`)
2. Add corresponding types in `types/`
3. Add API calls in `api-client/`
4. Add validation schemas in `schemas/`
5. Add state management in `stores/`
6. Update this document if needed

This structure ensures maintainability, scalability, and consistent code organization across the project.

## Shadcn / Theming / Demo

- CSS variables used by shadcn components are defined in `src/assets/styles/globals.css`. Examples:
  - `--color-background`, `--color-foreground`, `--color-primary`, `--color-accent`, `--chart-1`, etc.

### Theming (shadcn conventions)

- Prefer CSS variables for theming: set `tailwind.cssVariables: true` in `components.json` (this exposes variables for use in Tailwind utilities).
- Use the background/foreground convention: define `--<name>` and `--<name>-foreground` (e.g., `--primary`, `--primary-foreground`) and use `bg-<name> text-<name>-foreground`.
- Define color variables under `:root` and override them in the `.dark` selector to support dark mode.
- To add custom colors, define `--mycolor` and `--mycolor-foreground` and expose them via `@theme inline { --color-mycolor: var(--mycolor); --color-mycolor-foreground: var(--mycolor-foreground); }` so `bg-mycolor` / `text-mycolor-foreground` work.
- Prefer semantic utilities or mapped theme tokens (via `tailwind.config.ts`) instead of hard-coded color classes to keep theming consistent.
- Keep `components.json` aliases (e.g., `ui`, `hooks`, `components`) properly configured so generated shadcn components import correctly (see `components.json` in repo).

- Demo route:
  - Demo dashboard page: `src/app/demo/page.tsx`.
  - Demo component: `src/components/Demo/DemoDashboard.tsx`.

- Barrel exports:
  - `components/ui/index.ts` is the single barrel for shared UI components (shadcn/base components).
  - Feature components should be imported directly from their folder when appropriate (e.g. `@/components/Demo/DemoDashboard`).

- When replacing hardcoded colors, prefer the shadcn CSS variables so dark mode and theming remain consistent.
