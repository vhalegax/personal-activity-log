# Config

This folder contains configuration files for environment variables, constants, and app settings.

## Structure

- `env.ts` - Environment variables validation and configuration
- `constants.ts` - App-wide constants and configuration values

## Usage

```typescript
import { APP_NAME, API_BASE_URL } from "@/config/constants";
import { env } from "@/config/env";
```

## Guidelines

- Use `env.ts` for runtime environment validation
- Store constants that don't change at runtime in `constants.ts`
- Never commit sensitive environment variables
