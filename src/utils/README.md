# Utils

This folder contains utility functions and helpers that are used across the application.

## Structure

- `dateUtils.ts` - Date formatting and manipulation utilities
- `stringUtils.ts` - String manipulation utilities
- `formatUtils.ts` - Formatting utilities (currency, numbers, etc.)
- `validationUtils.ts` - Additional validation helpers

## Usage

```typescript
import { formatDate, formatCurrency } from "@/utils/dateUtils";
import { capitalize, truncate } from "@/utils/stringUtils";
```

## Guidelines

- Use camelCase for file and function names
- Keep utilities pure and testable
- Group related utilities in feature-specific files
- Avoid side effects in utility functions
