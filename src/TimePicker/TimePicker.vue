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
import { InternalFormat, Item, timePickerProps, type TimePickerEmits } from "./types";
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
    if (Array.isArray(props.modelValue)) {
      const [a, b] = props.modelValue;
      return [parseFromModel(a, props.format), parseFromModel(b, props.format)];
    } else {
      return parseFromModel(props.modelValue, props.format);
    }
  },
  set(val) {
    const toStr = (c: InternalFormat) => formatTime("HH:mm:ss", c);
    if (Array.isArray(val)) {
      const [a, b] = val;
      emit("update:modelValue", [toStr(a), toStr(b)]);
      
    } else {
      
      emit("update:modelValue", toStr(val));
      // console.log("val", val)
    }
  }
});

const firstInit = computed<InternalFormat>({
  get() {
    if (Array.isArray(init.value)) return init.value[0];
    return init.value as InternalFormat;
  },
  set(v) {
    if (Array.isArray(init.value)) {
      init.value = [v, init.value[1]];
    } else {
      init.value = v;
      // console.log("this is init", v, init.value)
    }
  }
});

// const secondInit = computed<InternalFormat>({
//   get() {
//     if (Array.isArray(init.value)) return init.value[1];
//     return init.value as InternalFormat;
//   },
//   set(v) {
//     if (Array.isArray(init.value)) {
//       init.value = [init.value[0], v];
//     } else {
//       // convert single -> range
//       init.value = [init.value as InternalFormat, v];
//     }
//   }
// });


// Display the selected time(s) in the input
const display = computed(() => {
  if (!props.modelValue) return "—";
  const fmt = (c: InternalFormat) => formatTime(props.format!, c);
  if (props.range) {
    // const [a, b] = init.value;
    return `${fmt(firstInit.value)} → ${fmt(secondInit.value)}`;
  }
  return fmt(firstInit.value);
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

watch(firstInit, (val) => (console.log(val)))


</script>

<style src="../style.css"></style>
