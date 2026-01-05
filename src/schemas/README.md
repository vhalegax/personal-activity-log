# Schemas

This folder contains validation schemas using Zod for form validation and API data validation.

## Structure

- `auth.schema.ts` - Authentication form/validation schemas
- `cart.schema.ts` - Shopping cart validation schemas
- `order.schema.ts` - Order validation schemas

## Usage

```typescript
import { authSchema } from "@/schemas/auth.schema";
import type { AuthFormData } from "@/schemas/auth.schema";

// Validate form data
const result = authSchema.safeParse(formData);
```

## Guidelines

- Use Zod for all validation schemas
- Export both schema and inferred types
- Name files with `.schema.ts` suffix
- Keep schemas organized by feature/domain
