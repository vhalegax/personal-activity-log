# API Client

This folder contains API client modules for making HTTP requests to backend services.

## Structure

- `auth-api.ts` - Authentication API calls (login, logout, register)
- `cart-api.ts` - Shopping cart API calls
- `products-api.ts` - Product-related API calls
- `orders-api.ts` - Order management API calls

## Usage

```typescript
import { authApi } from "@/api-client/auth-api";

const result = await authApi.login(email, password);
```

## Guidelines

- Use hyphen-separated filenames (kebab-case) for API client files (e.g., `auth-api.ts`)
- Export API functions as named exports
- Handle errors consistently
- Use TypeScript interfaces for request/response types
