# PWA Setup Complete ✅

Project ini sudah dikonfigurasi sebagai PWA (Progressive Web App) dan bisa di-install.

## Cara Install

### Desktop (Chrome, Edge, Brave)

1. Buka aplikasi di browser: `http://localhost:3000` (dev) atau URL production
2. Lihat icon install (+) di address bar
3. Klik icon untuk install aplikasi

### Mobile (Android/iOS)

1. Buka aplikasi di browser mobile
2. Android Chrome: Tap menu (⋮) → "Add to Home screen" atau "Install app"
3. iOS Safari: Tap Share button → "Add to Home Screen"

## Fitur PWA Yang Sudah Aktif

- ✅ Service Worker untuk offline support
- ✅ Web App Manifest dengan icons dan metadata
- ✅ Installable sebagai aplikasi standalone
- ✅ Cache untuk navigation dan assets
- ✅ Auto-reload saat online kembali
- ✅ Optimized untuk mobile dan desktop

## File-File PWA

- `/public/manifest.json` - Konfigurasi PWA (nama, icons, dll)
- `/public/sw.js` - Service worker (auto-generated)
- `/public/workbox-*.js` - Workbox library (auto-generated)
- `/next.config.ts` - Konfigurasi next-pwa

## Build & Deploy

```bash
# Development (PWA disabled)
bun dev

# Production build dengan PWA
bun build

# Start production server
bun start
```

## Catatan Penting

- PWA hanya aktif di **production mode** (tidak di development)
- Service worker akan cache assets dan pages untuk offline access
- Icon PWA ada di `/public/icon/` (android-chrome-\*.png)
- Untuk update service worker, user perlu reload page 2x

## Kustomisasi

Edit `/public/manifest.json` untuk mengubah:

- Nama aplikasi
- Warna theme
- Icons
- Display mode
- Orientasi

Edit `/next.config.ts` untuk mengubah behavior caching dan PWA settings.
