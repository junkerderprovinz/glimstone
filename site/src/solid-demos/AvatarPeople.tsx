import { Avatar } from "@glimstone/solid/Avatar";

const picture =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#3ddbd9"/><circle cx="4" cy="3" r="1.6" fill="#161616"/><rect x="1.5" y="5.2" width="5" height="3" rx="1.5" fill="#161616"/></svg>');

export default function AvatarPeople() {
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px", "flex-wrap": "wrap" }}>
      <Avatar name="Ada Lovelace" src={picture} size="lg" />
      <Avatar name="Grace Hopper" size="lg" />
      <Avatar name="Linus Torvalds" src="./no-such-picture.png" size="lg" />
      <Avatar name="Margaret Hamilton" size="md" hueIndex={0} />
      <Avatar name="Katherine Johnson" size="md" hueIndex={1} />
      <Avatar name="Alan Turing" size="sm" />
    </div>
  );
}
