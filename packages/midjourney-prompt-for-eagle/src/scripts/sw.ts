import { setStorage } from "../utils/storage";
import {
  promptPositionKey,
  tagRulesKey,
  defaultPromptPosition,
  defaultTagRules,
} from "../utils/constant";

async function getCurrentTabs() {
  return await chrome.tabs.query({ active: true, currentWindow: true });
}

const targetUrl = /https\:\/\/www.midjourney.com\/.*/;

chrome.runtime.onInstalled.addListener(() => {
  setStorage(promptPositionKey, defaultPromptPosition);
  setStorage(tagRulesKey, defaultTagRules);
});

chrome.storage.onChanged.addListener(async () => {
  const tabs = await getCurrentTabs();

  if (!tabs.length) return;
  tabs.forEach((tab) => {
    if (
      tab.id &&
      tab.url &&
      targetUrl.test(tab.url) &&
      tab.status === "complete"
    ) {
      emit(tab.id, "traverseBody");
    }
  });
});

async function emit(tabId: number, funcName: string) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (funcName: string) => {
      new Function(`
          window["${funcName}"]?.();
       `)();
    },
    args: [funcName],
    world: "MAIN",
  });
}
