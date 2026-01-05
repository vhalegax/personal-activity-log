# Types

This folder contains TypeScript type definitions and interfaces.

## Structure

- `auth.types.ts` - Authentication-related types
- `cart.types.ts` - Shopping cart types
- `product.types.ts` - Product types
- `common.types.ts` - Shared/common types

## Usage

```typescript
import type { User, AuthState } from "@/types/auth.types";
import type { Product, CartItem } from "@/types/product.types";
```

## Guidelines

- Use PascalCase for type names
- Name files with `.types.ts` suffix
- Group related types in feature-specific files
- Export types using `type` keyword for better tree-shaking
