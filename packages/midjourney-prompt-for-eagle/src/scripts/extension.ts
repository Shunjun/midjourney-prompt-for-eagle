import { storageKeys } from "../utils/constant";
import { getStorage, setSessionStorage } from "../utils/storage";

async function syncStorage() {
  return Promise.all(
    storageKeys.map(async (key) => {
      const value = await getStorage(key);
      setSessionStorage(key, value);
    })
  );
}

function init() {
  syncStorage();
  chrome?.storage?.onChanged.addListener(() => {
    syncStorage();
  });
}

init();
