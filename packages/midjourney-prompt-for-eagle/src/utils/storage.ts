export async function setStorage(key: string, value: any) {
  if (typeof chrome?.storage === "undefined") return;
  const serialize = JSON.stringify(value);
  return await chrome.storage.sync.set({ [key]: serialize });
}

export async function getStorage<T>(key: string): Promise<T | null> {
  if (typeof chrome?.storage === "undefined") return null;
  const result = await chrome.storage.sync.get(key);
  if (!result || typeof result !== "object") return null;
  const serialize = result[key];
  try {
    return JSON.parse(serialize);
  } catch {
    return serialize;
  }
}

export async function setSessionStorage(key: string, value: any) {
  if (typeof sessionStorage === "undefined") return;
  const serialize = JSON.stringify(value);
  sessionStorage.setItem(key, serialize);
}

export async function getSessionStorage(key: string) {
  if (typeof sessionStorage === "undefined") return null;
  const serialize = sessionStorage.getItem(key);
  if (!serialize) return null;
  try {
    return JSON.parse(serialize);
  } catch {
    return serialize;
  }
}
