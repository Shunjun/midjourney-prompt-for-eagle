export const defaultPromptPosition = "description";

export const defaultTagRules = [
  "/--(ar|aspect) (\\d*):(\\d*)/",
  "/--chaos \\d*/",
  "/--quality \\.?\\d*/",
  "/--style random-\\d*/",
  "/--(r|repeat) \\d*/",
  "/--style (?!random)\\S*/",
  "/--stylize \\d*/",
  "/--niji \\d/",
  "/--(v|version) \\S*/",
  "--tile",
  "--video",
];

// 用来标记用于通信的 script 标签的 id
export const scriptId = "midjourney-prompt-for-eagle-event-bus";

export const promptPositionKey = "promptPosition";
export const tagRulesKey = "tagRules";
export const storageKeys = [promptPositionKey, tagRulesKey];
