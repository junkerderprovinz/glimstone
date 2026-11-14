<script setup lang="ts">
import { ref } from "vue";
import { componentText } from "@glimstone/core";
import { Pagination } from "@glimstone/vue/Pagination";
import { Steps } from "@glimstone/vue/Steps";
import { TagsInput } from "@glimstone/vue/TagsInput";

const ar = componentText("ar");
const steps = [{ title: "النوع" }, { title: "العنوان" }, { title: "الفحص" }];
const tags = ref(["صور", "أسبوعي"]);
</script>

<template>
  <div dir="rtl" lang="ar" style="display: grid; gap: 20px; width: min(34rem, 100%)">
    <Pagination :count="195" :text="ar.pagination" />
    <TagsInput v-model="tags" label="الوسوم" :text="ar.tagsInput" />
    <Steps :items="steps" :text="{ ...ar.steps, finish: 'حفظ' }">
      <template #content="{ item }">{{ item.title }}</template>
    </Steps>
  </div>
</template>
