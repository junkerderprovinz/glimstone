<script lang="ts" module>
  import type { TagsInputText } from "@glimstone/core";

  export type { TagsInputText } from "@glimstone/core";

  export interface TagsInputProps {
    label?: string;
    /** The tags, bound with `bind:value`. */
    value: string[];
    onChange?: (value: string[]) => void;
    placeholder?: string;
    /** How many tags it takes at most. */
    max?: number;
    /** Takes the same tag twice. */
    allowDuplicates?: boolean;
    disabled?: boolean;
    text?: Partial<TagsInputText>;
  }
</script>

<script lang="ts">
  import * as tagsInput from "@zag-js/tags-input";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { TAGS_INPUT_TEXT, pageDir } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";
  import { IconClose } from "./glyphs.js";

  // A field that turns what is typed into tags, such as the labels of a backup
  // or the addresses a notice goes to. Enter or a comma adds a tag, and the tags
  // stand in the field as pills, each with its own remove mark. Inside a
  // FieldRow the row names it.
  let { label, value = $bindable(), onChange, placeholder, max, allowDuplicates = false, disabled = false, text }: TagsInputProps = $props();

  const name = useFieldName(() => label);
  const words = $derived({ ...TAGS_INPUT_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(tagsInput.machine, () => ({
    id,
    dir: pageDir(),
    value,
    max,
    allowDuplicates,
    disabled,
    placeholder,
    editable: false,
    blurBehavior: "add" as const,
    addOnPaste: true,
    onValueChange: (d: { value: string[] }) => {
      value = d.value;
      onChange?.(d.value);
    },
    translations: {
      deleteTagTriggerLabel: words.remove,
      tagAdded: words.added,
      tagSelected: words.selected,
      tagDeleted: words.removed,
    },
  }));
  const api = $derived(tagsInput.connect(service, normalizeProps));
</script>

<div data-glim="TagsInput" {...api.getRootProps()} class="glim-tags">
  <label {...api.getLabelProps()} class={label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div {...api.getControlProps()} class="glim-tags-control">
    {#each api.value as tag, index (`${tag}-${index}`)}
      <span {...api.getItemProps({ index, value: tag })} class="glim-tag-item">
        <span {...api.getItemPreviewProps({ index, value: tag })} class="glim-tag">
          <span {...api.getItemTextProps({ index, value: tag })} class="glim-tag-text">{tag}</span>
          <button {...api.getItemDeleteTriggerProps({ index, value: tag })} class="glim-tag-remove">{@render IconClose()}</button>
        </span>
        <input {...api.getItemInputProps({ index, value: tag })} class="glim-tag-edit" />
      </span>
    {/each}
    <input {...api.getInputProps()} class="glim-tags-input" />
  </div>
  <input {...api.getHiddenInputProps()} />
</div>
