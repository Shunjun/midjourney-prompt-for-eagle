chrome.scripting.registerContentScripts([
  {
    id: "XHRInterceptor",
    matches: ["https://www.midjourney.com/*"],
    js: ["xhr-intercept.js"],
    runAt: "document_start",
    world: "MAIN",
  },
]);

// chrome.webNavigation.onCompleted.addListener(runScript);
// chrome.webNavigation.onHistoryStateUpdated.addListener(runScript);

// function runScript(details) {
//   try {
//     chrome.scripting.unregisterContentScripts();
//     const { tabId, url } = details;
//     const Url = new URL(url);
//     if (Url.host === "www.midjourney.com" && Url.pathname.startsWith("/jobs")) {
//       chrome.scripting.executeScript({
//         target: { tabId },
//         files: ["scripts/content.js"],
//       });
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }

// chrome.webNavigation.onCompleted.addListener(injectXHRIntercept);

// function injectXHRIntercept(details) {
//   try {
//     chrome.scripting.unregisterContentScripts();
//     const { tabId, url } = details;
//     const Url = new URL(url);
//     if (Url.host === "www.midjourney.com") {
//       console.log("intercept");
//       // chrome.scripting.registerContentScripts({
//       //   id: "XHRInterceptor",
//       //   match: ["https://www.midjourney.com/*"],
//       //   js: ["scripts/xhr-intercept.js"],
//       // });
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }

// function XHRInterceptor() {
//   try {
//     chrome.scripting.executeScript({
//       id: "XHRInterceptor",
//       target: { tabId },
//       files: ["scripts/xhr-intercept.js"],
//     });
//   } catch (err) {
//     console.error(err);
//   }
// }

// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     console.log(111);
//     return { cancel: details.url.indexOf("://www.evil.com/") != -1 };
//   },
//   { urls: ["<all_urls>"] },
//   ["blocking"]
// );

// chrome.webRequest.onCompleted.addListener(
//   function (details) {
//     console.log(details);
//   },
//   {
//     urls: ["https://www.midjourney.com/api/app/recent-jobs*"],
//     types: ["xmlhttprequest"],
//   }
// );
