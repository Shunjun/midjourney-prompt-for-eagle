import { promptPositionKey, tagRulesKey } from "../utils/constant";
import { getSessionStorage } from "../utils/storage";
import { JobInfo } from "./types";
import { promptMap, task } from "./xhr-interceptor";

const idRegex = /(?<id>[^/]*-[^/]*-[^/]*-[^/]*-[^/]*)/;
const urlRegex = /(http|https):\/\/([\w.]+\/?)\S*/;

export function startObserve() {
  window.traverseBody = () => {
    traverseNode(document.body);
  };

  function handleReadystatechange() {
    if (document.readyState === "complete") {
      observeBody();
      window.traverseBody();
      document.removeEventListener("readystatechange", handleReadystatechange);
    }
  }

  if (document.readyState === "complete") {
    observeBody();
    window.traverseBody();
  } else {
    document.addEventListener("readystatechange", handleReadystatechange);
  }
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

function addAttributesOnAnchor(node: HTMLAnchorElement) {
  task(() => {
    const styleStr = node.getAttribute("style") || "";
    const id = getIdFromSrc(styleStr);

    if (!id) return;
    addAttributes(node, id);
  });
}

function addAttributesOnImg(node: HTMLImageElement) {
  task(() => {
    const id = getIdFromSrc(node.src);
    if (!id) return;
    addAttributes(node, id);
  });
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
