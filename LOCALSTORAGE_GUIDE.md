# localStorage Implementation Guide

## Penjelasan

Data saat ini disimpan di **localStorage** sebagai temporary storage sebelum Supabase di-connect.
Ini memastikan data tidak hilang saat page di-refresh.

## File Utilities

### `src/lib/storage.ts`

Berisi fungsi-fungsi untuk manage localStorage:

- `getStoredData()` - Get semua data
- `saveStoredData(data)` - Save data
- `getStoredValue(key)` - Get specific value
- `updateStoredValue(key, value)` - Update specific value
- `clearStoredData()` - Clear semua

### `src/hooks/use-local-storage.ts`

Custom hook untuk localStorage yang lebih ergonomis:

```tsx
const [tasks, setTasks] = useLocalStorage('tasks', []);
```

## Penggunaan di MvpApp.tsx

### 1. Initial Load (useEffect)

```tsx
useEffect(() => {
  const e = localStorage.getItem('mvp_email') || '';
  if (e) {
    setEmail(e);
    // Load cached data first
    const cached = getStoredData();
    if (cached.user) setUser(cached.user);
    if (cached.projects) setProjects(cached.projects);
    if (cached.tasks) setTasks(cached.tasks);
    if (cached.activeTaskId) setActiveTaskId(cached.activeTaskId);

    // Then fetch fresh data
    fetchLogin(e);
  }
}, []);
```

### 2. Setelah API Call

Semua data dari API disimpan ke localStorage:

```tsx
saveStoredData({
  projects: pJson.projects || [],
  tasks: tJson.tasks || [],
  timeLogs: tlJson.timeLogs || [],
  activeTaskId: activeId,
});
```

### 3. Saat Sign Out

```tsx
async function handleSignOut() {
  clearStoredData(); // Hapus localStorage
  localStorage.removeItem('mvp_email');
  setUser(null);
  // ... reset state lainnya
}
```

## Data yang Disimpan

Struktur di localStorage (key: `app_data`):

```json
{
  "user": { "id": "...", "email": "..." },
  "projects": [...],
  "tasks": [...],
  "timeLogs": [...],
  "activeTaskId": "..."
}
```

## Transisi ke Supabase

Nanti saat Supabase sudah connected:

1. Ganti fetch API dengan Supabase queries
2. Hapus `storage.ts` dan `use-local-storage.ts`
3. Update MvpApp untuk pakai Supabase client
4. localStorage tetap bisa dipakai untuk UI state (seperti cache)

## Catatan Penting

- Data di localStorage hanya persisten untuk user yang login
- Saat logout, semua data dihapus
- Data diperbarui setiap kali ada action (create, update, delete)
