import { Selector } from "@glimstone/react";

export function Picker({ phone, value, onChange }: { phone: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <Selector items={[]} value={value} onChange={onChange} pairsOnPhone />
      <Selector
        items={[]}
        value={value}
        pairsOnPhone={phone}
        onChange={onChange}
      />
      <Selector items={[]} value={value} onChange={onChange} pairsOnPhone={true} fit />
    </>
  );
}
