import type { PropType } from "vue";
import type { CustomField } from "@zaptime/core";
/** Runtime props avoid Vue 3.4's limited resolution of bundled declaration aliases. */
export const fieldProps = {
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String as PropType<CustomField["type"]>, required: true },
  required: { type: Boolean, required: true },
  mergeTag: String,
  placeholder: String,
  options: Array as PropType<string[]>,
  value: { type: [String, Number, Boolean, Array] as PropType<CustomField["value"]>, default: undefined },
} as const;
