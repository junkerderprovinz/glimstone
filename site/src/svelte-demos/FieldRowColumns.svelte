<script lang="ts">
  import { FieldRow, FieldRowGroup, TextField } from "@glimstone/svelte";
</script>

<div style="width: 100%; max-width: 720px">
  <FieldRowGroup columns={2}>
    <FieldRow label="Name">
      <TextField width="grow" value="*.mkv" />
    </FieldRow>
    <FieldRow label="Changed">
      <TextField width="grow" value="this week" />
    </FieldRow>
    <FieldRow label="Size at least">
      <TextField width="grow" value="1 GB" />
    </FieldRow>
    <FieldRow label="Owner">
      <TextField width="grow" value="anna" />
    </FieldRow>
    <FieldRow label="Look in" wide>
      <TextField width="grow" mono value="/mnt/user/media" />
    </FieldRow>
  </FieldRowGroup>
</div>
