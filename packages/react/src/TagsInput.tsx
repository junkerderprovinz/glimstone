import { useId } from "react";
import * as tagsInput from "@zag-js/tags-input";
import { normalizeProps, useMachine } from "@zag-js/react";
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

export function TagsInput({ label, value, onChange, placeholder, max, allowDuplicates = false, disabled = false, text }: TagsInputProps) {
  const name = useFieldName(label);
  const words = { ...TAGS_INPUT_TEXT, ...text };
  const service = useMachine(tagsInput.machine, {
    id: useId(),
    dir: pageDir(),
    value,
    max,
    allowDuplicates,
    disabled,
    placeholder,
    editable: false,
    blurBehavior: "add",
    addOnPaste: true,
    onValueChange: (d) => onChange(d.value),
    translations: {
      deleteTagTriggerLabel: words.remove,
      tagAdded: words.added,
      tagSelected: words.selected,
      tagDeleted: words.removed,
    },
  });
  const api = tagsInput.connect(service, normalizeProps);
  return (
    <div data-glim="TagsInput" {...api.getRootProps()} className="glim-tags">
      <label {...api.getLabelProps()} className={label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name}
      </label>
      <div {...api.getControlProps()} className="glim-tags-control">
        {api.value.map((tag, index) => (
          <span key={`${tag}-${index}`} {...api.getItemProps({ index, value: tag })} className="glim-tag-item">
            <span {...api.getItemPreviewProps({ index, value: tag })} className="glim-tag">
              <span {...api.getItemTextProps({ index, value: tag })} className="glim-tag-text">
                {tag}
              </span>
              <button {...api.getItemDeleteTriggerProps({ index, value: tag })} className="glim-tag-remove">
                <IconClose />
              </button>
            </span>
            <input {...api.getItemInputProps({ index, value: tag })} className="glim-tag-edit" />
          </span>
        ))}
        <input {...api.getInputProps()} className="glim-tags-input" />
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  );
}
