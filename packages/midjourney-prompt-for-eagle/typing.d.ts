/// <reference types="chrome" />
/// <reference types="vite/client" />

declare module "*.vue" {
  import { defineComponent, FunctionalComponent } from "vue";
  const component: ReturnType<typeof defineComponent> | FunctionalComponent;
  export default component;
}

declare interface Window {
  traverseBody: () => void;
}
