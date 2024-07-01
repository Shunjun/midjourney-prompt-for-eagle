export async function setStorage(key: string, value: any) {
  if (typeof chrome?.storage === "undefined") return;
  const serialize = JSON.stringify(value);
  return await chrome.storage.sync.set({ [key]: serialize });
}

export async function getStorage<T>(key: string): Promise<T | null> {
  if (typeof chrome?.storage === "undefined") return null;
  const result = await chrome.storage.sync.get(key);
  if (!result || typeof result !== "object") return null;
  try {
    const serialize = result[key];
    return JSON.parse(serialize);
  } catch {
    return null;
  }
}

export async function setSessionStorage(key: string, value: any) {
  if (typeof sessionStorage === "undefined") return;
  const serialize = JSON.stringify(value);
  sessionStorage.setItem(key, serialize);
}
