chrome.webNavigation.onCompleted.addListener(runScript);
chrome.webNavigation.onHistoryStateUpdated.addListener(runScript);

function runScript(details) {
  try {
    chrome.scripting.unregisterContentScripts();
    const { tabId, url } = details;
    const Url = new URL(url);
    if (Url.host === "www.midjourney.com" && Url.pathname.startsWith("/jobs")) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["scripts/content.js"],
      });
    }
  } catch (err) {
    console.error(err);
  }
}
