<template>
  <div w-5 h-5 v-html="iconRaw" :style="style"></div>
</template>

<script setup lang="ts">
import { computed, defineProps, unref } from "vue";

const props = withDefaults(
  defineProps<{
    color?: string;
    iconRaw?: string;
    size?: number;
  }>(),
  {
    color: "#999",
    size: 20,
  }
);

const iconRaw = computed(() => {
  const raw = unref(props.iconRaw) || "";
  return raw.replaceAll(/stroke=".*?"/g, "");
});

const style = computed(() => {
  const color = unref(props.color);
  const size = unref(props.size);
  return {
    stroke: color,
    width: `${size}px`,
    height: `${size}px`,
  };
});
</script>
