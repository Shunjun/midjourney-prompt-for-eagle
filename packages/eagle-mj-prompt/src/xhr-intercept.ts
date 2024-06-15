import { JobInfo } from "./types";

const originalFetch = window.fetch;

// 重写 XMLHttpRequest
class OverXMLHttpRequest extends window.XMLHttpRequest {
  constructor() {
    super();
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        // 请求完成
        if (isJobsUrl(this.responseURL)) {
          try {
            const json = JSON.parse(this.responseText);
            handleResponseData({
              url: this.responseURL,
              data: json,
            });
          } catch (err) {
            // noop
          }
        }
      }
    });
  }
}
window.XMLHttpRequest = OverXMLHttpRequest;

// 重写 fetch
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const cloneResponse = response.clone();
  if (isJobsUrl(cloneResponse.url)) {
    const data = await cloneResponse.json(); // 假设返回的是 JSON 数据
    requestIdleCallback(() => {
      handleResponseData({
        url: response.url,
        data,
      });
    });
  }
  return response; // 返回原始的 response
};

const jobsUrls = [
  "https://www.midjourney.com/api/app/job-status",
  "https://www.midjourney.com/api/app/recent-jobs",
  "https://www.midjourney.com/api/pg/thomas-jobs",
];

function isJobsUrl(url: string) {
  return jobsUrls.some((jobUrl) => {
    return new RegExp(`${jobUrl}.*`).test(url);
  });
}

const promptMap: Map<string, JobInfo> = new Map();

function handleResponseData(params: { url: string; data: any }) {
  const { url, data } = params || {};
  if (!url || !data) return;
  const path = new URL(url).pathname;
  switch (path) {
    case "/api/app/job-status":
      // 处理 job-status 接口返回的数据
      getPromptsFromJobStatus(data);
      break;
    case "/api/app/recent-jobs":
      // 处理 recent-jobs 接口返回的数据
      getPromptsFromRecentJobs(data);
      break;
    case "/api/pg/thomas-jobs":
      getPromptsFromThomasJobs(data);
      break;
  }
}

function getPromptsFromJobStatus(data: JobInfo[]) {
  if (Array.isArray(data)) {
    getPrompts(data);
  }
}

function getPromptsFromRecentJobs(data: { jobs: JobInfo[] }) {
  if (data && Array.isArray(data.jobs)) {
    getPrompts(data.jobs);
  }
}

function getPromptsFromThomasJobs(data: { data: JobInfo[] }) {
  if (data && Array.isArray(data.data)) {
    getPrompts(data.data);
  }
}

function getPrompts(jobList: any[]) {
  jobList.forEach((job) => {
    if (!job.id) return;
    promptMap.set(job.id, job);
    if (job.parent_id) {
      promptMap.set(job.parent_id, job);
    }
  });
}

const config = {
  childList: true,
  subtree: true,
};

function observeBody() {
  // 创建一个观察器实例
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      // 如果是子节点变化
      if (mutation.type === "childList") {
        // 遍历添加的节点
        mutation.addedNodes.forEach((node) => {
          traverseNode(node);
        });
      }
    }
  });

  // 开始观察 body 元素
  observer.observe(document.body, config);
  document.removeEventListener("DOMContentLoaded", handleContentLoaded);
}

function traverseNode(node: Node) {
  if (node.nodeType === node.ELEMENT_NODE) {
    // 如果节点是 img 元素
    if (isImageNode(node)) {
      addAttributesOnImg(node);
    }
    if (isAnchorNode(node)) {
      console.log("A new canvas element was added.");
    }

    node.childNodes.forEach((childNode) => {
      traverseNode(childNode);
    });
  }
}

function handleContentLoaded() {
  observeBody();
}

document.addEventListener("DOMContentLoaded", handleContentLoaded);

function addAttributesOnImg(node: HTMLImageElement) {
  const id = getIdFromSrc(node.src);

  console.log(promptMap);
}

function getIdFromSrc(src: string) {
  const { groups } = src.match(/(?<id>[^/]*-[^/]*-[^/]*-[^/]*-[^/]*)/) || {};
  return groups?.id;
}

function isImageNode(node: Node): node is HTMLImageElement {
  return node.nodeName.toLowerCase() === "img";
}

function isAnchorNode(node: Node): node is HTMLAnchorElement {
  return node.nodeName.toLowerCase() === "a";
}
