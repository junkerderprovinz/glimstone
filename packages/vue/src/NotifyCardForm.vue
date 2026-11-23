<script setup lang="ts">
import { computed } from "vue";
import { NOTIFY_REDACTED, type NotifyCardFlow, type NotifyCardLabelKeys, type NotifyCardState, type NotifyCardText, type NotifyForm } from "@glimstone/core";
import Button from "./Button.vue";
import Checkbox from "./Checkbox.vue";
import FieldRow from "./FieldRow.vue";
import FieldRowGroup from "./FieldRowGroup.vue";
import { IconTrash } from "./glyphs";
import NumberField from "./NumberField.vue";
import PasswordField from "./PasswordField.vue";
import Select from "./Select.vue";
import Selector from "./Selector.vue";
import TextArea from "./TextArea.vue";
import TextField from "./TextField.vue";
import UnavailableNotice from "./UnavailableNotice.vue";

// The form of one channel, the same in the picker and in the Edit window.
const props = defineProps<{
  form: NotifyForm;
  state: NotifyCardState;
  flow: NotifyCardFlow;
  text: NotifyCardText;
  keys: NotifyCardLabelKeys;
}>();

const eye = computed(() => ({ show: props.text.show, hide: props.text.hide }));
const items = (options: { value: string; label: string }[] | undefined) => (options ?? []).map((o) => ({ id: o.value, label: o.label }));
const port = (v: string) => (v === "" ? null : Number(v));
</script>

<template>
  <div class="glim-notify-form" :data-notify-form="form.kind">
    <p v-if="form.hint" class="glim-notify-text">{{ form.hint }}</p>
    <UnavailableNotice v-if="form.unavailable" :title="text.idle">{{ form.unavailable }}</UnavailableNotice>
    <p v-for="(line, i) in form.loose" :key="i" class="glim-notify-problem" role="alert">{{ line }}</p>
    <FieldRowGroup>
      <FieldRow v-for="f in form.fields" :key="f.path" :label="f.label" :hint="f.hint">
        <PasswordField
          v-if="f.control === 'secret'"
          autocomplete="new-password"
          :model-value="f.value"
          :text="eye"
          :note="f.note"
          :error="f.error"
          @update:model-value="flow.set(f.path, $event)"
        />
        <NumberField
          v-else-if="f.control === 'number'"
          :min="1"
          :max="65535"
          :model-value="port(f.value)"
          :placeholder="f.placeholder"
          :error="f.error"
          @update:model-value="flow.set(f.path, $event == null ? '' : String($event))"
        />
        <TextArea
          v-else-if="f.control === 'area'"
          :mono="f.mono"
          :model-value="f.value"
          :placeholder="f.placeholder"
          :error="f.error"
          @update:model-value="flow.set(f.path, $event)"
        />
        <template v-else-if="f.control === 'select'">
          <Select :model-value="f.value" :options="f.options ?? []" @update:model-value="flow.set(f.path, $event as string)" />
          <p v-if="f.error" class="glim-notify-problem" role="alert">{{ f.error }}</p>
        </template>
        <template v-else-if="f.control === 'segments'">
          <Selector inline activation="manual" :model-value="f.value" :items="items(f.options)" @update:model-value="flow.set(f.path, $event as string)" />
          <p v-if="f.error" class="glim-notify-problem" role="alert">{{ f.error }}</p>
        </template>
        <div v-else-if="f.control === 'checks'" class="glim-notify-checks" data-notify="events">
          <Checkbox v-for="o in f.options ?? []" :key="o.value" :model-value="!!o.checked" :label="o.label" @update:model-value="flow.setEvent(o.value, $event)" />
        </div>
        <div v-else-if="f.control === 'headers'" class="glim-notify-headers">
          <div v-for="(row, i) in state.headers" :key="i" class="glim-notify-header">
            <TextField mono :label="text.fields.headerName" :model-value="row.name" placeholder="Authorization" @update:model-value="flow.setHeader(i, 'name', $event)" />
            <PasswordField
              autocomplete="new-password"
              :aria-label="text.fields.headerValue"
              :model-value="row.value === NOTIFY_REDACTED ? '' : row.value"
              :text="eye"
              @update:model-value="flow.setHeader(i, 'value', $event)"
            />
            <Button compact tone="subtle" :label="text.fields.headerRemove" :label-key="keys.remove" :glyph="IconTrash" @click="flow.removeHeader(i)" />
          </div>
          <div>
            <Button :label="text.fields.headerAdd" :label-key="keys.add" @click="flow.addHeader()" />
          </div>
          <p v-if="f.note" class="glim-notify-text">{{ f.note }}</p>
          <p v-if="f.error" class="glim-notify-problem" role="alert">{{ f.error }}</p>
        </div>
        <TextField v-else :mono="f.mono" :model-value="f.value" :placeholder="f.placeholder" :error="f.error" @update:model-value="flow.set(f.path, $event)" />
      </FieldRow>
    </FieldRowGroup>
    <p v-if="state.said" :class="state.said.ok ? 'glim-notify-said' : 'glim-notify-said glim-notify-said--fail'" :role="state.said.ok ? 'status' : 'alert'">
      {{ state.said.message }}
    </p>
  </div>
</template>
