# Data

This folder contains static data, constants, and configuration that doesn't change at runtime.

## Structure

- `countries.ts` - Country list and related data
- `meta-defaults.ts` - Default meta tags for SEO
- `json-ld.ts` - JSON-LD structured data templates
- `constants.ts` - Static data constants

## Usage

```typescript
import { countries } from "@/data/countries";
import { defaultMeta } from "@/data/meta-defaults";
```

## Guidelines

- Use for data that is static and doesn't require API calls
- Include country lists, default configurations, etc.
- Keep data organized by domain/feature
