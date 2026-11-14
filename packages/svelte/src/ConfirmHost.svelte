<script lang="ts">
  import { getAllContexts, mount, unmount, untrack } from "svelte";
  import { portalTarget } from "@glimstone/core";
  import ConfirmDialog from "./ConfirmDialog.svelte";
  import type { ConfirmHostState } from "./confirm.svelte.js";

  // useConfirm's dialog. An ancestor with a transform would confine a fixed
  // backdrop to its own box, so it is mounted straight into <body> and draws
  // nothing where the host stands.
  let { host }: { host: ConfirmHostState } = $props();
  const context = getAllContexts();

  $effect(() => {
    const p = host.pending;
    if (!p) return;
    const dialog = untrack(() =>
      mount(ConfirmDialog, {
        target: portalTarget(),
        context,
        props: {
          title: host.text.title,
          message: p.message,
          confirmLabel: p.confirmLabel ?? host.text.confirm,
          confirmLabelKey: p.confirmLabelKey,
          confirmGlyph: p.confirmGlyph,
          cancelLabel: host.text.cancel,
          extra: p.extra,
          onConfirm: () => host.settle(true),
          onCancel: () => host.settle(false),
          get ref() {
            return host.dialog;
          },
          set ref(el) {
            host.dialog = el;
          },
        },
      }),
    );
    return () => void unmount(dialog);
  });
</script>
