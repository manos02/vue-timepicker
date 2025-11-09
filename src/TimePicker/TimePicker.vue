<template>
  <div class="vtp">
    <!-- Input / trigger -->
    <button
      class="vtp-input"
      :class="{ 'vtp-input--error': lastErrorCode }"
      type="button"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>{{ display }}</span>
      <span class="vtp-input__icon">🕘</span>
    </button>

    <!-- Columns -->
    <div>
      <TimeSelection
        v-model:open="open"
        v-model:initTime="firstInit"
        :format="props.format"
        :hour-step="props.hourStep"
        :minute-step="props.minuteStep"
        :second-step="props.secondStep"
      />

      <!-- render second selector only for range mode -->
      <!-- <TimeSelection
        v-if="props.range"
        v-model:open="open"
        v-model:initTime="secondInit"
        :format="props.format"
        :hour-step="props.hourStep"
        :minute-step="props.minuteStep"
        :second-step="props.secondStep"
      /> -->
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

const open = ref(false);

const init = computed<InternalFormat | [InternalFormat, InternalFormat]>({
  get() {
    return parseFromModel(
      Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue,
      props.format
    );
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

// const initTemp =

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

</script>

<style src="../style.css"></style>
