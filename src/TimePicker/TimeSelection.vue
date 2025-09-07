<template>
  <div class="vtp-cols">
    <TimeColumn
      v-model:activeIndex="hourIdx"
      :items="hoursList"
      label="Hours"
    />

    <TimeColumn
      v-model:activeIndex="minuteIdx"
      :items="minutesList"
      label="Minutes"
    />

    <TimeColumn
      v-if="showSecondsUI"
      v-model:activeIndex="secondIdx"
      :items="secondsList"
      label="Seconds"
    />

    <TimeColumn
      v-if="show12UI"
      v-model:activeIndex="ampmIdx"
      :items="ampmList"
      label="AM/PM"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import TimeColumn from "./TimeColumn.vue";
import { Item, TimePickerEmits } from "./types";
import {
  hasK,
  hasSeconds,
  is12h,
  isPm,
  parseFromModel,
  to24,
} from "../helpers";

const show12UI = computed(() => is12h(props.format));
const showSecondsUI = computed(() => hasSeconds(props.format));
const isKFormat = computed(() => hasK(props.format));

const props = withDefaults(
  defineProps<{
    initTime: { h: number; m: number; s: number };

    format: string;

    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
  }>(),
  {
    hourStep: 1,
    minuteStep: 1,
    secondStep: 1,
  }
);

// v-model updates
const emit = defineEmits<{
  (e: "update:initTime", v: { h: number; m: number; s: number }): void;
}>();

const hourIdx = ref(Math.floor(props.initTime.h / props.hourStep) || 0);
const minuteIdx = ref(Math.floor(props.initTime.m / props.minuteStep) || 0);
const secondIdx = ref(Math.floor(props.initTime.s / props.secondStep) || 0);
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

// AM/PM: 0 = AM, 1 = PM
const ampmIdx = ref(isPm(props.format) ? 1 : 0);

const hoursList = computed<Item[]>(() => {
  if (!show12UI.value) {
    if (isKFormat.value) return makeKHourList(props.hourStep);
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
  if (show12UI.value) {
    // convert am/pm
    return ampmVal.value === "PM" ? to24(hour, true) : to24(hour, false);
  }
  if (isKFormat.value && hour === 24) return 0; // convert k format
  return hour;
});

const minuteVal = computed(() =>
  Number(minutesList.value[minuteIdx.value]?.value ?? 0)
);
const secondVal = computed(() =>
  Number(secondsList.value[secondIdx.value]?.value ?? 0)
);

// if (import.meta.env.DEV) {
//   if (props.showSeconds && !props.seconds) {
//     // eslint-disable-next-line no-console
//     console.warn(
//       "[TimeColumnsGroup] showSeconds is true but `seconds` list is missing."
//     );
//   }
//   if (props.show12 && !props.ampm) {
//     // eslint-disable-next-line no-console
//     console.warn(
//       "[TimeColumnsGroup] show12 is true but `ampm` list is missing."
//     );
//   }
// }

watch([hourVal, minuteVal, secondVal], ([h, m, s]) => {
  const obj = { h, m, s }
  emit("update:initTime", obj)
}, { immediate: true })
</script>
