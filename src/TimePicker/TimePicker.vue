<template>
  <div class="vtp" ref="root">
    <!-- Trigger / input -->
    <button
      class="vtp-input"
      type="button"
      :aria-expanded="open"
      @click="toggle"
    >
      <span>{{ display }}</span>
      <span class="vtp-input__icon">🕘</span>
    </button>

    
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
        v-if="showSeconds"
        v-model:activeIndex="secondIdx"
        :items="secondsList"
        label="Seconds"
        @select="onSecondSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import TimeColumn from "./TimeColumn.vue";

type Item = {
  key: number | string;
  value: number;
  text: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    showSeconds?: boolean;
  }>(),
  {
    modelValue: null,
    hourStep: 1,
    minuteStep: 4,
    secondStep: 1,
    showSeconds: true,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string | null): void;
  (e: "open"): void;
  (e: "close"): void;
}>();

// open/close 
const open = ref(false);
const root = ref<HTMLElement>();
function toggle() {
  open.value ? close() : openMenu();
}
function openMenu() {
  open.value = true;
  emit("open");
}
function close() {
  open.value = false;
  emit("close");
}

// Initial time  values 
const [initH, initM, initS] = (() => {
  if (!props.modelValue) return [0, 0, 0]; // default to 0:0:0
  const parts = props.modelValue.split(":").map((n) => Number(n) || 0); // split and convert to numbers
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
})();

// Convert to indices based on step 
const hourIdx = ref(Math.floor(initH / props.hourStep) || 0);
const minuteIdx = ref(Math.floor(initM / props.minuteStep) || 0);
const secondIdx = ref(Math.floor(initS / props.secondStep) || 0);

// Create the lists for hours, minutes, seconds based on the given step 
function makeList(max: number, step: number): Item[] {
  const arr: Item[] = [];
  for (let i = 0; i < max; i += Math.max(1, step)) {
    arr.push({ key: i, value: i, text: i.toString().padStart(2, "0") });
  }
  return arr;
}

const hoursList = computed(() => makeList(24, props.hourStep));
const minutesList = computed(() => makeList(60, props.minuteStep));
const secondsList = computed(() => makeList(60, props.secondStep));

//  Selected values 
const hourVal = computed(() => hoursList.value[hourIdx.value]?.value ?? 0);
const minuteVal = computed(() => minutesList.value[minuteIdx.value]?.value ?? 0);
const secondVal = computed(() => secondsList.value[secondIdx.value]?.value ?? 0);

// Input display 
const display = computed(() => {
  const hh = String(hourVal.value).padStart(2, "0");
  const mm = String(minuteVal.value).padStart(2, "0");
  if (!props.showSeconds) return `${hh}:${mm}`;
  const ss = String(secondVal.value).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
});


// If seconds are displayed do nothing else close and set value
function onMinuteSelect(_: number) {
  if (!props.showSeconds) confirm(); 
}
function onSecondSelect(_: number) {
  confirm(); 
}

function confirm() {
  emit("update:modelValue", display.value);
  close();
}

// Click outside to close 
function onDocMousedown(e: MouseEvent) {
  const t = e.target as Node;
  if (!root.value?.contains(t)) {
    confirm();
  }
}

onMounted(() => document.addEventListener("mousedown", onDocMousedown));
onBeforeUnmount(() =>
  document.removeEventListener("mousedown", onDocMousedown)
);


</script>

<style src="../style.css">

</style>

<!-- Time Format
format
Control display of hours, minutes, seconds, AM/PM
Minute Interval
:minute-interval
Show minute values in steps (e.g., 0, 5, 10…)
Second Interval
:second-interval
Show seconds in defined increments
Custom Column Labels
hour-label, minute-label…
Override default text above each column
Custom AM/PM Text
am-text, pm-text
Substitute AM/PM labels
Custom Icons & Buttons
Slots: icon, clearButton, dropdownButton
Insert your own UI elements
Hide Clear Button
hide-clear-button
Omit the “clear” control from the UI
Disable Time Ranges
hour-range, minute-range, second-range
Limit available selectable values -->
