<template>
  <div w-300px px-2>
    <h3>Midjourney Prompt For Eagle</h3>
    <div overflow-auto>
      <div flex flex-col mb-4>
        <label text-xs text-gray-500 py-2 select-none>Prompt 存储位置</label>
        <Select
          :options="optios"
          :titles="titles"
          :model-value="promptPosition"
          :onchange="handleChange"
        ></Select>
      </div>
      <div flex flex-col mb-2>
        <div flex justify-between items-center text-xs select-none>
          <label text-gray-500 py-2
            >自动添加标签
            <span text-lightBlue cursor-pointer @click="reset"
              >重置</span
            ></label
          >
          <span text-gray-300>支持正则和字符串匹配</span>
        </div>
        <List :list="tagRules" @add="addTag" @delete="deleteTag" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, unref } from "vue";
import Select from "./components/Select.vue";
import { getStorage, setStorage } from "./utils/storage";
import List from "./components/List.vue";
import {
  defaultTagRules,
  defaultPromptPosition,
  promptPositionKey,
  tagRulesKey,
} from "./utils/constant";

const optios = ["title", "description"];
const titles = ["保存到标题", "保存到描述"];

const promptPosition = ref<"title" | "description">(defaultPromptPosition);

onBeforeMount(async () => {
  const promotPos = await getStorage<"title" | "description">(
    promptPositionKey
  );
  if (promotPos) {
    promptPosition.value = promotPos;
  }
});

const handleChange = (evt: InputEvent) => {
  const target = evt.target as HTMLInputElement;
  const value = target?.value as "title" | "description";
  promptPosition.value = value;
  setStorage(promptPositionKey, value);
};

const tagRules = ref<string[]>(defaultTagRules);

onBeforeMount(async () => {
  const _tagRules = await getStorage<string[]>("tagRules");
  if (_tagRules) {
    tagRules.value = _tagRules;
  }
});

const reset = () => {
  tagRules.value = defaultTagRules;
  setStorage(tagRulesKey, defaultTagRules);
};

const addTag = (tag: string) => {
  if (tag) {
    updateTagRules([...tagRules.value, tag]);
  }
};

const deleteTag = (idx: number) => {
  const newList = [...tagRules.value];
  newList.splice(idx, 1);
  updateTagRules(newList);
};

function updateTagRules(list: string[]) {
  if (list && Array.isArray(tagRules.value)) {
    tagRules.value = list;
    setStorage(tagRulesKey, unref(tagRules.value));
  }
}
</script>
