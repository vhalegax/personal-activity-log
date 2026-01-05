/**
 * localStorage wrapper utilities untuk persisent data
 * TODO: Ganti dengan Supabase saat sudah connected
 */

export interface StorageData {
  user: { id: string; email: string } | null;
  projects: Array<{ id: string; name: string }>;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    project_id?: string | null;
    requester?: string | null;
    pic?: string | null;
    status: string;
    type: string;
  }>;
  timeLogs: Array<any>;
  activeTaskId: string | null;
}

const STORAGE_KEY = 'app_data';

/**
 * Get all stored data from localStorage
 */
export function getStoredData(): Partial<StorageData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {};
  }
}

/**
 * Save data to localStorage
 */
export function saveStoredData(data: Partial<StorageData>) {
  try {
    const current = getStoredData();
    const merged = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Get specific data from storage
 */
export function getStoredValue<K extends keyof StorageData>(key: K): StorageData[K] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored) as StorageData;
    return data[key] ?? null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Update specific data in storage
 */
export function updateStoredValue<K extends keyof StorageData>(key: K, value: StorageData[K]) {
  try {
    const current = getStoredData();
    const updated = { ...current, [key]: value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Clear all stored data
 */
export function clearStoredData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
