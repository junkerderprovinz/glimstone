import { Selector } from "@glimstone/react";

export function Picker({ phone, value, onChange }: { phone: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <Selector items={[]} value={value} onChange={onChange} />
      <Selector
        items={[]}
        value={value}
        onChange={onChange}
      />
      <Selector items={[]} value={value} onChange={onChange} fit />
    </>
  );
}
