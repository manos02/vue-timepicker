import type { PropType, ExtractPropTypes } from "vue";

export const timePickerProps = {
  modelValue: { type: [String, Array] as PropType<string | [string, string] | null>, default: null },
  range: {type: Boolean, default: false },
  hourStep: { type: Number as PropType<number>, default: 1 },
  minuteStep: { type: Number as PropType<number>, default: 1 },
  secondStep: { type: Number as PropType<number>, default: 1 },
  format: {
    type: String,
    default: "HH:mm",
    validator: (fmt: string) => /^([HhKk]){1,2}(:mm(:ss)?)?$/.test(fmt),
  },
} as const;

export type TimePickerProps = ExtractPropTypes<typeof timePickerProps>;

export interface TimePickerEmits {
  (e: "update:modelValue", v: string | null): void;
  (e: "open"): void;
  (e: "close"): void;
  (e: "error", payload: { code: "BAD_TIME" | "OUT_OF_RANGE"; message: string }): void;
}

export type Item = {
  key: number | string;
  value: number | string;
  text: string;
  disabled?: boolean;
};
