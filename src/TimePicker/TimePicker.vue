<template>
  <div class="vtp">
    <!-- Input / trigger -->
    <button
      class="vtp-input"
      :class="{ 'vtp-input--error': lastErrorCode }"
      type="button"
      :aria-expanded="open"
      @click="toggleAll"
    >
      <span>{{ display }}</span>
      <span class="vtp-input__icon">🕘</span>
    </button>

    <!-- Columns -->
    <!-- <div v-if="open" class="vtp-cols"> -->
      <!-- <TimeColumn
        v-model:activeIndex="hourIdx"
        :items="hoursList"
        label="Hours"
      />
      <TimeColumn
        v-model:activeIndex="minuteIdx"
        :items="minutesList"
        label="Minutes"
        @select="onMinuteSelect"
      />
      <TimeColumn
        v-if="showSecondsUI"
        v-model:activeIndex="secondIdx"
        :items="secondsList"
        label="Seconds"
        @select="onSecondSelect"
      />
      <TimeColumn
        v-if="show12UI"
        v-model:activeIndex="ampmIdx"
        :items="ampmList"
        label="AM/PM"
        @select="onAmpmSelect"
      /> -->
      <TimeSelection
        v-model:open="open"
        v-model:initTime="init" 
        :format="props.format"
      />
    </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import TimeColumn from "./TimeColumn.vue";
import TimeSelection from "./TimeSelection.vue";
import { Item, timePickerProps, type TimePickerEmits } from "./types";
import {
  is12h,
  hasSeconds,
  formatTime,
  to24,
  isPm,
  hasK,
  parseFromModel,
} from "../helpers";

const lastErrorCode = ref<string | null>(null);
/* ================================
 * Props & emits
 * ================================ */
const props = defineProps(timePickerProps);

const emit = defineEmits<TimePickerEmits>();

const open = ref(false);

function toggleAll() {
  open.value = !open.value
}


/* ================================
 * Open/close & outside click
 * ================================ */
// const open = ref(false);
// const root = ref<HTMLElement>();
// function openMenu() {
//   open.value = true;
//   emit("open");
// }
// function close() {
//   open.value = false;
//   emit("close");
// }
// function toggle() {
//   open.value ? close() : openMenu();
// }

// function onDocMousedown(e: MouseEvent) {
//   const t = e.target as Node;
//   if (!root.value?.contains(t)) confirm();
// }
// onMounted(() => document.addEventListener("mousedown", onDocMousedown));
// onBeforeUnmount(() =>
//   document.removeEventListener("mousedown", onDocMousedown)
// );



type Canon = { h: number; m: number; s: number }  // internal canonical time


const init = computed<Canon | [Canon, Canon]>({
  get() {
    if (Array.isArray(props.modelValue)) {
      const [a, b] = props.modelValue;
      return [parseFromModel(a, props.format), parseFromModel(b, props.format)];
    } else {
      return parseFromModel(props.modelValue, props.format);
    }
  },
  set(val) {
    const toStr = (c: Canon) => formatTime("HH:mm:ss", c.h, c.m, c.s);
    if (Array.isArray(val)) {
      const [a, b] = val;
      emit("update:modelValue", [toStr(a), toStr(b)]);
    } else {
      emit("update:modelValue", toStr(val));
    }
  }
});


/* ================================
 * Display string
 * ================================ */
const display = computed(() => {
  if (!props.modelValue) return "—";
  const fmt = (c: Canon) => formatTime(props.format!, c.h, c.m, c.s);
  if (Array.isArray(init.value)) {
    const [a, b] = init.value;
    return `${fmt(a)} → ${fmt(b)}`;
  }
  return fmt(init.value);
});


watch(
  () => props.range,
  (newVal) => {
    if (newVal) { // Range selection
      if (!Array.isArray(props.modelValue)) {
        throw new RangeError(`Model value must be an array for range selection: ${props.modelValue}`);
      }
    } else { // Handle single time selection
        if (Array.isArray(props.modelValue)) {
          throw new RangeError(`Model value must be a single string for single time selection: ${props.modelValue}`);
        }
    }
  },
  { immediate: true }
)


</script>

<style src="../style.css"></style>
