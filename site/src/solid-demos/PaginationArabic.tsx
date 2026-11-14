import { createSignal } from "solid-js";
import { componentText } from "@glimstone/core";
import { Pagination } from "@glimstone/solid/Pagination";
import { Steps } from "@glimstone/solid/Steps";
import { TagsInput } from "@glimstone/solid/TagsInput";

const ar = componentText("ar");
const steps = [{ title: "النوع" }, { title: "العنوان" }, { title: "الفحص" }];

export default function PaginationArabic() {
  const [tags, setTags] = createSignal(["صور", "أسبوعي"]);
  return (
    <div dir="rtl" lang="ar" style={{ display: "grid", gap: "20px", width: "min(34rem, 100%)" }}>
      <Pagination count={195} text={ar.pagination} />
      <TagsInput label="الوسوم" value={tags()} onChange={setTags} text={ar.tagsInput} />
      <Steps items={steps} content={(s) => s.title} text={{ ...ar.steps, finish: "حفظ" }} />
    </div>
  );
}
