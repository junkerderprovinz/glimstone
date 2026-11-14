import { Code, ContractTable, Demo, H2, PropsTable } from "../ui";
import { MachineNote } from "./reading";

export function AvatarPage() {
  return (
    <>
      <p className="lead">A person's picture, and their initials while it loads, when it fails or when there is none.</p>
      <MachineNote file="react/Avatar.tsx" machine="avatar" />
      <Demo name="AvatarPeople" />
      <Code
        code={`import { Avatar } from "@glimstone/react/Avatar";

<Avatar name="Ada Lovelace" src={photo} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The name is the accessible name in every state. The picture and the initials are only what it looks like.</li>
        <li>Its corners follow the shape setting like everything else somebody presses or looks at, round, soft or square.</li>
        <li>
          At rest the initials stand on the third surface, since a face is not activity. Under rainbow a list of people
          can give each circle a palette position with <code>hueIndex</code>.
        </li>
        <li>
          <code>md</code> is a field's height and <code>lg</code> the key height, so an avatar stands level with the
          controls of its row. <code>sm</code> fits a line of text.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Avatar" />
      <H2>API</H2>
      <PropsTable of="Avatar" />
    </>
  );
}
