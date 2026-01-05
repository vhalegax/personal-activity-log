# Stores

This folder contains state management stores using Zustand, Pinia, or similar libraries.

## Structure

- `auth.store.ts` - Authentication state management
- `cart.store.ts` - Shopping cart state
- `product.store.ts` - Product-related state

## Usage

```typescript
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

const { user, login } = useAuthStore();
const { items, addItem } = useCartStore();
```

## Guidelines

- Use Zustand for global state management
- Name files with `.store.ts` suffix
- Export store hooks with `use` prefix
- Keep stores focused on specific domains
