import { createMemo, createUniqueId, Index, mergeProps } from "solid-js";
import * as tagsInput from "@zag-js/tags-input";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { TAGS_INPUT_TEXT, pageDir, type TagsInputText } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";
import { IconClose } from "./glyphs.tsx";

export type { TagsInputText } from "@glimstone/core";

// A field that turns what is typed into tags, such as the labels of a backup
// or the addresses a notice goes to. Enter or a comma adds a tag, and the tags
// stand in the field as pills, each with its own remove mark. Inside a
// FieldRow the row names it.

export interface TagsInputProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** How many tags it takes at most. */
  max?: number;
  /** Takes the same tag twice. */
  allowDuplicates?: boolean;
  disabled?: boolean;
  text?: Partial<TagsInputText>;
}

export function TagsInput(raw: TagsInputProps) {
  const props = mergeProps({ allowDuplicates: false, disabled: false }, raw);
  const name = useFieldName(() => props.label);
  const words = () => ({ ...TAGS_INPUT_TEXT, ...props.text });
  const id = createUniqueId();
  const service = useMachine(tagsInput.machine, () => ({
    id,
    dir: pageDir(),
    value: props.value,
    max: props.max,
    allowDuplicates: props.allowDuplicates,
    disabled: props.disabled,
    placeholder: props.placeholder,
    editable: false,
    blurBehavior: "add" as const,
    addOnPaste: true,
    onValueChange: (d: { value: string[] }) => props.onChange(d.value),
    translations: {
      deleteTagTriggerLabel: words().remove,
      tagAdded: words().added,
      tagSelected: words().selected,
      tagDeleted: words().removed,
    },
  }));
  const api = createMemo(() => tagsInput.connect(service, normalizeProps));
  return (
    <div data-glim="TagsInput" {...api().getRootProps()} class="glim-tags">
      <label {...api().getLabelProps()} class={props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div {...api().getControlProps()} class="glim-tags-control">
        <Index each={api().value}>
          {(tag, index) => {
            const item = () => ({ index, value: tag() });
            return (
              <span {...api().getItemProps(item())} class="glim-tag-item">
                <span {...api().getItemPreviewProps(item())} class="glim-tag">
                  <span {...api().getItemTextProps(item())} class="glim-tag-text">
                    {tag()}
                  </span>
                  <button {...api().getItemDeleteTriggerProps(item())} class="glim-tag-remove">
                    <IconClose />
                  </button>
                </span>
                <input {...api().getItemInputProps(item())} class="glim-tag-edit" />
              </span>
            );
          }}
        </Index>
        <input {...api().getInputProps()} class="glim-tags-input" />
      </div>
      <input {...api().getHiddenInputProps()} />
    </div>
  );
}
