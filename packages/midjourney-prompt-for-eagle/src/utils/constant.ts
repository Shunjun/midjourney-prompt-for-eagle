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
