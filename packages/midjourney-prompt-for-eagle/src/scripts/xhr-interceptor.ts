import { JobInfo } from "./types";

const originalFetch = window.fetch;
const originalXMLHttpRequest = window.XMLHttpRequest;

const jobsUrls = [
  "https://www.midjourney.com/api/app/job-status",
  "https://www.midjourney.com/api/app/recent-jobs",
  "https://www.midjourney.com/api/pg/thomas-jobs",
];

export const promptMap: Map<string, JobInfo> = new Map();
export let fetchingCount = 0;
export const tasks: (() => void)[] = [];

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

export function mountInspector() {
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
  return () => {
    window.XMLHttpRequest = originalXMLHttpRequest;
    window.fetch = originalFetch;
  };
}

export function task(cb: () => void) {
  if (fetchingCount) {
    tasks.push(cb);
  } else {
    cb();
  }
}

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
