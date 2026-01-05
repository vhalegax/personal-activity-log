# Assets

This folder contains static assets like fonts, styles, and other media files.

## Structure

- `fonts/` - Font files and @font-face declarations
- `styles/` - Global SCSS/CSS files

## Usage

```typescript
// In globals.css or component styles
@import '@/assets/styles/globals.scss';
```

## Guidelines

- Place font files in `fonts/` directory
- Use SCSS for global styles
- Component-specific styles should be co-located with components
