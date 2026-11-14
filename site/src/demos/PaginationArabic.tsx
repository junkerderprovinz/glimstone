import { useState } from "react";
import { componentText } from "@glimstone/core";
import { Pagination } from "@glimstone/react/Pagination";
import { Steps } from "@glimstone/react/Steps";
import { TagsInput } from "@glimstone/react/TagsInput";

const ar = componentText("ar");
const steps = [{ title: "النوع" }, { title: "العنوان" }, { title: "الفحص" }];

export default function PaginationArabic() {
  const [tags, setTags] = useState(["صور", "أسبوعي"]);
  return (
    <div dir="rtl" lang="ar" style={{ display: "grid", gap: 20, width: "min(34rem, 100%)" }}>
      <Pagination count={195} text={ar.pagination} />
      <TagsInput label="الوسوم" value={tags} onChange={setTags} text={ar.tagsInput} />
      <Steps items={steps} content={(s) => s.title} text={{ ...ar.steps, finish: "حفظ" }} />
    </div>
  );
}
