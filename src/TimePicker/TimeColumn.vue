<template>
  <div class="vtp-dd">
        
    <!-- Menu -->
    <div
      ref="menu"
      class="vtp-dd__menu"
      role="listbox"
      tabindex="-1"
    >
    <div
      v-for="(item, i) in items"
      :key="item.key"
      class="vtp-item"
      :class="{ 'is-active': i === activeIndex, 'is-disabled': item.disabled, 'is-focused': i === focusIndex }"
      role="option"
      :tabindex="item.disabled ? -1  : 0"
      @click="!item.disabled && setActive(i)"
      @mousemove="!item.disabled && (focusIndex = i)"
    >
  {{ item.text }}
</div>
    </div>
  </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'

const props = defineProps<{
  items: Array<{ key: string | number; value: any; text: string; disabled?: boolean }>
  activeIndex: number
}>()

const emit = defineEmits<{
  (e: 'update:activeIndex', index: number): void
  (e: 'select', v: any): void
}>()

function setActive(i: number) {
  emit('update:activeIndex', i)
  emit('select', props.items[i]?.value)
}

const focusIndex = ref<number>(props.activeIndex ?? 0)
</script>

<style src="../style.css"></style>