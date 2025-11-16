<template>
  <div class="timepicker-shell">
    <!-- Input / trigger -->

    <template v-if="!props.range">
      <div
        class="timepicker-shell__input"
        :class="{ 'timepicker-shell__input--error': lastErrorCode }"
      >
        <input
          type="text"
          class="timepicker-field"
          v-model="firstInputValue"
          :placeholder="resolvedFormat"
          :style="{ width: fieldWidth }"
          @focus="openFirst = true"
          @keydown.enter.prevent="commitTypedTime('first')"
          @blur="commitTypedTime('first')"
        />
      </div>
    </template>

    <template v-else>
      <div
        class="timepicker-shell__input"
        :class="{ 'timepicker-shell__input--error': lastErrorCode }"
      >
        <input
          type="text"
          class="timepicker-field"
          v-model="firstInputValue"
          :placeholder="resolvedFormat"
          :style="{ width: fieldWidth }"
          @focus="openFirst = true"
          @keydown.enter.prevent="commitTypedTime('first')"
          @blur="commitTypedTime('first')"
        />
        <span>-</span>
        <input
          type="text"
          class="timepicker-field"
          v-model="secondInputValue"
          :placeholder="resolvedFormat"
          :style="{ width: fieldWidth }"
          @focus="openSecond = true"
          @keydown.enter.prevent="commitTypedTime('second')"
          @blur="commitTypedTime('second')"
        />
      </div>
    </template>

    <!-- Columns -->
    <div>
      <TimeSelection
        v-model:open="openFirst"
        v-model:initTime="firstInit"
        :format="props.format"
        :hour-step="props.hourStep"
        :minute-step="props.minuteStep"
        :second-step="props.secondStep"
      />

      <!-- render second selector only for range mode -->
      <TimeSelection
        v-if="props.range"
        v-model:open="openSecond"
        v-model:initTime="secondInit"
        :format="props.format"
        :hour-step="props.hourStep"
        :minute-step="props.minuteStep"
        :second-step="props.secondStep"
      />
    </div>
  </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import TimeColumn from "./TimeColumn.vue";
import TimeSelection from "./TimeSelection.vue";
import {
  InternalFormat,
  Item,
  timePickerProps,
  type TimePickerEmits,
} from "./types";
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

const openFirst = ref(false);
const openSecond = ref(false);

const init = computed<InternalFormat | [InternalFormat, InternalFormat]>({
  get() {
    if (Array.isArray(props.modelValue)) {
      const [a, b] = props.modelValue;
      return [parseFromModel(a, props.format), parseFromModel(b, props.format)];
    } else {
      return parseFromModel(props.modelValue, props.format);
    }
  },
  set(v) {
    if (Array.isArray(v)) {
      emit("update:modelValue", [
        formatTime("HH:mm:ss", v[0]),
        formatTime("HH:mm:ss", v[1]),
      ]);
    } else {
      emit("update:modelValue", formatTime("HH:mm:ss", v));
    }
  },
});

const firstInit = computed<InternalFormat>({
  get() {
    if (Array.isArray(init.value)) return init.value[0];
    return init.value;
  },
  set(v) {
    if (Array.isArray(init.value)) {
      init.value = [v, init.value[1]];
    } else {
      // convert single -> range
      init.value = v;
    }
  },
});

const secondInit = computed<InternalFormat>({
  get() {
    if (Array.isArray(init.value)) return init.value[1];
    return init.value;
  },
  set(v) {
    if (Array.isArray(init.value)) init.value = [init.value[0], v];
  },
});

// Display the selected time(s) in the input
const display = computed(() => {
  if (!props.modelValue) return "—";
  const fmt = (c: InternalFormat) => formatTime(props.format!, c);
  if (props.range) {
    return `${fmt(firstInit.value)} → ${fmt(secondInit.value)}`;
  }
  return fmt(firstInit.value);
});

watch(
  () => props.range,
  (newVal) => {
    if (newVal) {
      // Range selection
      if (!Array.isArray(props.modelValue)) {
        throw new RangeError(
          `Model value must be an array for range selection: ${props.modelValue}`
        );
      }
    } else {
      // Handle single time selection
      if (Array.isArray(props.modelValue)) {
        throw new RangeError(
          `Model value must be a single string for single time selection: ${props.modelValue}`
        );
      }
    }
  },
  { immediate: true }
);

const resolvedFormat = computed(() => props.format ?? "HH:mm:ss");
const fieldWidth = computed(() => {
  const length = Math.min(10, Math.max(4, resolvedFormat.value.length));
  return `${length}ch`;
});
const firstInputValue = ref("");
const secondInputValue = ref("");

watch(
  () => [firstInit.value, resolvedFormat.value],
  ([val]) => {
    firstInputValue.value = formatTime(resolvedFormat.value, val);
  },
  { immediate: true }
);

watch(
  () => [secondInit.value, resolvedFormat.value, props.range],
  ([val, , isRange]) => {
    if (!isRange) {
      secondInputValue.value = "";
      return;
    }
    secondInputValue.value = formatTime(resolvedFormat.value, val);
  },
  { immediate: true }
);

const parseTypedValue = (value: string): InternalFormat | null => {
  if (!value.trim()) return null;
  try {
    return parseFromModel(value.trim(), resolvedFormat.value);
  } catch {
    return null;
  }
};

const commitTypedTime = (target: "first" | "second") => {
  const buffer = target === "first" ? firstInputValue : secondInputValue;
  const parsed = parseTypedValue(buffer.value);
  if (!parsed) {
    lastErrorCode.value = "invalid-time";
    return;
  }
  lastErrorCode.value = null;

  if (target === "first") {
    firstInit.value = parsed;
    buffer.value = formatTime(resolvedFormat.value, firstInit.value);
  } else if (props.range) {
    secondInit.value = parsed;
    buffer.value = formatTime(resolvedFormat.value, secondInit.value);
  }
};
</script>

<style src="../styles/timepicker.css"></style>
