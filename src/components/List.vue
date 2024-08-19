<template>
  <div
    h-4
    py-2
    px-3
    bg-gray-1
    rounded-lg
    overflow-hidden
    flex
    items-center
    mb-3
  >
    <input
      border-none
      w-full
      bg-transparent
      outline-none
      placeholder="请输入"
      ref="inputRef"
      text-xs
      placeholder-color="gray-4"
    />
    <div
      w-5
      h-5
      ml-2
      cursor-pointer
      rounded
      flex
      items-center
      justify-center
      hover:bg-gray-3
      @click="onAdd"
    >
      <Icon :icon-raw="add"></Icon>
    </div>
  </div>
  <div bg-gray-1 rounded-lg p-2 min-h-20>
    <div
      v-for="(item, idx) in props.list"
      flex
      items-center
      justify-between
      mb-1
      hover:bg-gray-2
      px-2
      py-1
      rounded
    >
      <span text-xs text-gray-700 truncate>{{ item }}</span>
      <div
        h-5
        w-5
        flex
        items-center
        justify-center
        rounded
        cursor-pointer
        hover:bg-gray-3
        @click="() => emit('delete', idx)"
      >
        <Icon :size="16" :icon-raw="del"></Icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import add from "../access/svg/add.svg?raw";
import del from "../access/svg/delete.svg?raw";
import Icon from "./Icon.vue";

const inputRef = ref<HTMLInputElement | null>(null);

const props = defineProps<{
  list: string[];
}>();

const emit = defineEmits<{
  (e: "add", tag: string): void;
  (e: "delete", idx: number): void;
}>();

const onAdd = () => {
  const value = inputRef.value?.value;
  if (value) {
    emit("add", value);
    inputRef.value!.value = "";
  }
};
</script>
