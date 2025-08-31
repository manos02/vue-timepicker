<template>
  <div class="vtp" ref="root">
    <!-- Input / trigger -->
    <button
      class="vtp-input"
      type="button"
      :aria-expanded="open"
      @click="toggle"
    >
      <span>{{ display }}</span>
      <span class="vtp-input__icon">🕘</span>
    </button>

    <!-- Columns -->
    <div v-if="open" class="vtp-cols">
      <TimeColumn
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import TimeColumn from "./TimeColumn.vue";
import {
  is12h,
  parseFromModel,
  hasSeconds,
  formatTime,
  to24,
  isPm,
  hasK,
} from "../helpers";

type Item = {
  key: number | string;
  value: number | string;
  text: string;
  disabled?: boolean;
};

/* ================================
 * Props & emits
 * ================================ */
const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    format?: string;
  }>(),
  {
    modelValue: null,
    hourStep: 1,
    minuteStep: 1,
    secondStep: 1,
    format: "HH:mm",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string | null): void;
  (e: "open"): void;
  (e: "close"): void;
}>();

/* ================================
 * Open/close & outside click
 * ================================ */
const open = ref(false);
const root = ref<HTMLElement>();
function openMenu() {
  open.value = true;
  emit("open");
}
function close() {
  open.value = false;
  emit("close");
}
function toggle() {
  open.value ? close() : openMenu();
}

function onDocMousedown(e: MouseEvent) {
  const t = e.target as Node;
  if (!root.value?.contains(t)) confirm();
}
onMounted(() => document.addEventListener("mousedown", onDocMousedown));
onBeforeUnmount(() =>
  document.removeEventListener("mousedown", onDocMousedown)
);

const init = computed(() => parseFromModel(props.modelValue, props.format));
const show12UI = is12h(props.format);
const showSecondsUI = hasSeconds(props.format);
const isKFormat = hasK(props.format);

// AM/PM: 0 = AM, 1 = PM
const ampmIdx = ref(isPm(props.format) ? 1 : 0);

const hourIdx = ref(Math.floor(init.value.h / props.hourStep) || 0);
const minuteIdx = ref(Math.floor(init.value.m / props.minuteStep) || 0);
const secondIdx = ref(Math.floor(init.value.s / props.secondStep) || 0);



function makeList(max: number, step: number): Item[] {
  const arr: Item[] = [];
  for (let i = 0; i < max; i += Math.max(1, step)) {
    arr.push({ key: i, value: i, text: String(i).padStart(2, "0") });
  }
  return arr;
}

function make12HourList(isPm: boolean, step: number): Item[] {
  const s = Math.max(1, step);
  const arr: Item[] = [];
  for (let i = 0; i < 12; i += s) {
    const h12 = i === 0 ? 12 : i; // label: 12,1..11
    const h24 = isPm ? (i === 0 ? 12 : i + 12) : i; // value: 12..23 or 0..11
    arr.push({ key: h24, value: h24, text: String(h12).padStart(2, "0") });
  }
  return arr;
}

function makeKHourList(step: number): Item[] {
  const s = Math.max(1, step);
  const arr: Item[] = [];
  for (let i = 0; i < 24; i += s) {
    const kFormat = i === 0 ? 24 : i; // label: 24,1..23
    arr.push({ key: i, value: i, text: String(kFormat).padStart(2, "0") });
  }
  return arr;
}


const hoursList = computed<Item[]>(() => {
  if (!show12UI) {
    if (isKFormat) return makeKHourList(props.hourStep);
    return makeList(24, props.hourStep);
  }
  const isPmNow = ampmIdx.value === 1;
  return make12HourList(isPmNow, props.hourStep);
});

const minutesList = computed<Item[]>(() => makeList(60, props.minuteStep));
const secondsList = computed<Item[]>(() => makeList(60, props.secondStep));
const ampmList = computed<Item[]>(() => [
  { key: "AM", value: "AM", text: "AM" },
  { key: "PM", value: "PM", text: "PM" },
]);

/* ================================
 * Selected values (internal 24h)
 * ================================ */
const ampmVal = computed(() => (ampmIdx.value === 1 ? "PM" : "AM"));

const hourVal = computed(() => {
  const hour = Number(hoursList.value[hourIdx.value]?.value ?? 0);
  if (show12UI) { // convert am/pm
    return ampmVal.value === "PM" ? to24(hour, true) : to24(hour, false);
  }
  if (isKFormat && hour === 24) return 0; // convert k format
  return hour;
});

const minuteVal = computed(() =>
  Number(minutesList.value[minuteIdx.value]?.value ?? 0)
);
const secondVal = computed(() =>
  Number(secondsList.value[secondIdx.value]?.value ?? 0)
);

/* ================================
 * Display string
 * ================================ */
const display = computed(() =>
  formatTime(props.format!, hourVal.value, minuteVal.value, secondVal.value)
);

/* ================================
 * Handlers
 * ================================ */
function onMinuteSelect(_: number) {
  // If there are no seconds and no AM/PM column, confirm immediately
  if (!showSecondsUI && !show12UI) confirm();
}
function onSecondSelect(_: number) {
  // If there’s no AM/PM column, we can confirm now
  if (!show12UI) confirm();
}
function onAmpmSelect(_: string) {
  confirm();
}

function confirm() {
  emit("update:modelValue", display.value);
  close();
}
</script>

<style src="../style.css"></style>
