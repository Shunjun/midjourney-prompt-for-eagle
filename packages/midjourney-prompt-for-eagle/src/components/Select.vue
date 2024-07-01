<template>
  <div flex="~ wrap gap-1" of-hidden text-xs>
    <label
      v-for="(i, idx) of options"
      :key="i"
      relative
      hover:bg-lightBlue-300
      hover:text-white
      cursor-pointer
      px-2
      py-1
      rounded-full
      :class="[i === value ? 'bg-lightBlue text-white' : '']"
      :title="titles?.[idx]"
    >
      <div
        :class="[
          i === value ? '' : 'op40',
          titles?.[idx] ? '' : 'capitalize',
          classes?.[idx] || '',
        ]"
      >
        {{ titles?.[idx] ?? i }}
      </div>
      <input
        v-model="value"
        type="radio"
        :value="i"
        :title="titles?.[idx]"
        absolute
        inset-0
        op-0.1
        cursor-pointer
      />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: readonly string[] | number[];
  titles?: string[];
  classes?: string[];
}>();

const value = defineModel<string | number>("modelValue", {
  type: [String, Number],
});
</script>
