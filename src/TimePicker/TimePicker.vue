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

    <!-- Columns only  -->
    <div v-if="open" class="vtp-cols ">
      <TimeColumn
        v-model:activeIndex="hourIdx"
        :items="hoursList"
        label="Hours"
        @select="onHourSelect"
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
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import TimeColumn from './TimeColumn.vue'

type Item = { key: number | string; value: number; text: string; disabled?: boolean }

const props = withDefaults(defineProps<{
  modelValue?: string | null
  step?: number          // minute step
  showSeconds?: boolean, 
}>(), {
  modelValue: null,
  step: 1,
  showSeconds: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
  (e: 'open'): void
  (e: 'close'): void
}>()

/** open/close */
const open = ref(false)
const root = ref<HTMLElement | null>(null)
function toggle() { open.value ? close() : openMenu() }
function openMenu() { open.value = true; emit('open') }
function close() { open.value = false; emit('close') }

/** parse initial value -> indices */
const [initH, initM, initS] = (() => {
  if (!props.modelValue) return [0, 0, 0]
  const parts = props.modelValue.split(':').map((n) => Number(n) || 0)
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
})()

/** active indices (0..23, 0..59, 0..59) */
const hourIdx = ref(initH)
const minuteIdx = ref(Math.floor(initM / props.step) || 0) // snap to step
const secondIdx = ref(initS)

/** lists */
const hoursList = computed<Item[]>(() =>
  Array.from({ length: 24 }, (_, h) => ({ key: h, value: h, text: h.toString().padStart(2, '0') }))
)

const minutesList = computed<Item[]>(() => {
  const step = Math.max(1, props.step)
  const arr: Item[] = []
  for (let m = 0; m < 60; m += step) arr.push({ key: m, value: m, text: m.toString().padStart(2, '0') })
  return arr
})

const secondsList = computed<Item[]>(() =>
  Array.from({ length: 60 }, (_, s) => ({ key: s, value: s, text: s.toString().padStart(2, '0') }))
)

/** computed selected values */
const hourVal   = computed(() => hoursList.value[hourIdx.value]?.value ?? 0)
const minuteVal = computed(() => minutesList.value[minuteIdx.value]?.value ?? 0)
const secondVal = computed(() => secondsList.value[secondIdx.value]?.value ?? 0)

/** input display */
const display = computed(() => {
  const hh = String(hourVal.value).padStart(2, '0')
  const mm = String(minuteVal.value).padStart(2, '0')
  if (!props.showSeconds) return `${hh}:${mm}`
  const ss = String(secondVal.value).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
})

/** selection handlers: advance focus to next column */
function onHourSelect(_: number) {
  // optionally move keyboard focus to minutes (visual already updates)
}
function onMinuteSelect(_: number) {
  if (!props.showSeconds) confirm()   // close & set value when minutes chosen
}
function onSecondSelect(_: number) {
  confirm()                           // last step → close
}

/** confirm writes back to v-model */
function confirm() {
  emit('update:modelValue', display.value)
  close()
}

/** click-outside to close */
function onDocMousedown(e: MouseEvent) {
  const t = e.target as Node
  if (!root.value?.contains(t)) close()
}
onMounted(() => document.addEventListener('mousedown', onDocMousedown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMousedown))
</script>

<style scoped>
.vtp { position: relative; display: inline-block; }

/* input look */
.vtp-input {
  display: inline-flex; align-items: center; gap: .5rem;
  min-width: 140px;
  padding: .5rem .75rem; border: 1px solid #cbd5e1;
  border-radius: .5rem; background: #fff; cursor: pointer;
}
.vtp-input:focus-visible { outline: 2px solid #3b82f6; }


.vtp-cols {
  display: flex;
  gap: 3.7rem;        /* space between columns */
}

.vtp-cols--overlay {
  position: absolute;
  z-index: 30;
  top: 100%;
  left: 0;
  margin-top: .25rem;

  display: grid;
  grid-auto-flow: column;
  gap: .5rem;

  background: transparent;
  padding: 0;
  border: 0;
  box-shadow: none;
}


.vtp-input__icon {
  margin-left: auto;      /* push icon to the far right */
}

/* footer */
.vtp-actions { display:flex; justify-content:flex-start; padding-top:.25rem; }
.vtp-ok {
  appearance: none; border: 0; background: #2563eb; color:#fff;
  padding: .35rem .6rem; border-radius: .5rem; cursor: pointer;
}
</style>