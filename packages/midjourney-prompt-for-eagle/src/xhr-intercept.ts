import { JobInfo } from "./types";
import { promptPositionKey, tagRulesKey } from "./utils/constant";
import { getSessionStorage } from "./utils/storage";

const originalFetch = window.fetch;

const jobsUrls = [
  "https://www.midjourney.com/api/app/job-status",
  "https://www.midjourney.com/api/app/recent-jobs",
  "https://www.midjourney.com/api/pg/thomas-jobs",
];

const idRegex = /(?<id>[^/]*-[^/]*-[^/]*-[^/]*-[^/]*)/;
const urlRegex = /(http|https):\/\/([\w.]+\/?)\S*/;

const shortMap = {
  ar: "aspect",
  q: "quality",
  r: "repeat",
  s: "stylize",
  v: "version",
};

const promptMap: Map<string, JobInfo> = new Map();

let fetchingCount = 0;
const tasks: (() => void)[] = [];

// 重写 XMLHttpRequest
class OverXMLHttpRequest extends window.XMLHttpRequest {
  constructor() {
    super();
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        // 请求完成
        if (isJobsUrl(this.responseURL)) {
          try {
            const data = JSON.parse(this.responseText);
            responseTask(this.responseURL, data);
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
    responseTask(response.url, data);
  }
  return response; // 返回原始的 response
};

function responseTask(url: string, data: any) {
  fetchingCount++;
  requestIdleCallback(() => {
    handleResponseData({
      url,
      data,
    });
    fetchingCount--;
    if (fetchingCount === 0) {
      tasks.forEach((task) => task());
      tasks.length = 0;
    }
  });
}

function isJobsUrl(url: string) {
  return jobsUrls.some((jobUrl) => {
    return new RegExp(`${jobUrl}.*`).test(url);
  });
}

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

  const config = {
    childList: true,
    subtree: true,
  };
  // 开始观察 body 元素
  observer.observe(document.body, config);
}

function traverseNode(node: Node) {
  if (node.nodeType === node.ELEMENT_NODE) {
    // 如果节点是 img 元素
    if (isImageNode(node)) {
      addAttributesOnImg(node);
    }
    if (isAnchorNode(node)) {
      addAttributesOnAnchor(node);
    }
    node.childNodes.forEach((childNode) => {
      traverseNode(childNode);
    });
  }
}

window.traverseBody = () => {
  traverseNode(document.body);
};

function handleReadystatechange() {
  if (document.readyState === "complete") {
    observeBody();
    document.removeEventListener("readystatechange", handleReadystatechange);
  }
}

if (document.readyState === "complete") {
  observeBody();
} else {
  document.addEventListener("readystatechange", handleReadystatechange);
}

function addAttributesOnAnchor(node: HTMLAnchorElement) {
  if (fetchingCount) {
    tasks.push(() => addAttributesOnAnchor(node));
    return;
  }
  const styleStr = node.getAttribute("style") || "";
  const id = getIdFromSrc(styleStr);

  if (!id) return;
  addAttributes(node, id);
}

function addAttributesOnImg(node: HTMLImageElement) {
  if (fetchingCount) {
    tasks.push(() => addAttributesOnImg(node));
    return;
  }
  const id = getIdFromSrc(node.src);
  if (!id) return;
  addAttributes(node, id);
}

async function addAttributes(node: HTMLElement, id: string) {
  const job = promptMap.get(id);
  if (job) {
    const annotation = getAnnotation(job);
    const tag = await genTag(job);
    const promptPosition: "title" | "description" =
      (await getSessionStorage(promptPositionKey)) || "description";

    if (promptPosition === "title") {
      node.setAttribute("eagle-title", id);
      node.setAttribute("eagle-annotation", annotation);
    } else {
      node.setAttribute("eagle-title", annotation);
      node.setAttribute("eagle-annotation", id);
    }
    if (tag) {
      node.setAttribute("eagle-tags", tag);
    }
  }
}

async function genTag(job: JobInfo) {
  const { full_command = "" } = job;
  const tags: string[] = [];

  const tagRules: string[] = (await getSessionStorage(tagRulesKey)) || [];

  if (!tagRules.length) return "";

  tagRules.forEach((ruleStr) => {
    let rule = new RegExp(ruleStr);
    if (/^\/.*\/$/.test(ruleStr)) {
      rule = new RegExp(ruleStr.slice(1, -1));
    }

    const match = full_command.match(rule)?.[0];
    if (match) {
      tags.push(match.trim().replace(/^--/, ""));
    }
  });

  if (urlRegex.test(full_command)) {
    tags.push("垫图");
  }

  return tags.join(",");
}

function getAnnotation(job: JobInfo) {
  return job.full_command;
}

function getIdFromSrc(src: string) {
  const { groups } = src.match(idRegex) || {};
  return groups?.id;
}

function isImageNode(node: Node): node is HTMLImageElement {
  return node.nodeName.toLowerCase() === "img";
}

function isAnchorNode(node: Node): node is HTMLAnchorElement {
  return node.nodeName.toLowerCase() === "a";
}
