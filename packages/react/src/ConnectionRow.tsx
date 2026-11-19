import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { CONNECTION_ROW_KEYS, connectionTestFace, connectionTile, type ConnectionRowLabelKeys, type ConnectionRowText, type ConnectionTest, type TileMark } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { BrandMark } from "./ReadmeButton.tsx";
import { IconCheck, IconClose } from "./glyphs.tsx";

export type { ConnectionRowLabelKeys, ConnectionRowText, ConnectionTest } from "@glimstone/core";

// A connected service or account as a compact row ("Connections" in the design
// language): its mark lit on a tile the row's whole height, its name with any
// badges, one quiet line on how it stands, and its test, edit and remove at
// the end. A button stands only where its handler is passed. The other props
// of a <div> go to the row.

export interface ConnectionRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The service's name, also the row's accessible name. */
  name: string;
  /** A brand's mark from a catalog, which stands on its own colour, or one of the app's glyphs, which stands on the accent. */
  mark: TileMark | ReactNode;
  /** One quiet line under the name, such as who is signed in or where it connects. */
  status?: string;
  /** Badges after the name, for a state that is not the normal case, such as a failed connection. */
  badges?: ReactNode;
  /** More quiet lines under the status, such as what uses the connection. */
  children?: ReactNode;
  /** Where the test stands: `busy` while it runs, then `tone` and a `title` with what it found. */
  test?: ConnectionTest;
  text: ConnectionRowText;
  labelKeys?: Partial<ConnectionRowLabelKeys>;
  onTest?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

// On a phone the buttons show their glyphs alone, so they keep to one line.
const NARROW = 640;

export function ConnectionRow({ name, mark, status, badges, children, test, text, labelKeys, onTest, onEdit, onRemove, className, ...rest }: ConnectionRowProps) {
  const keys = { ...CONNECTION_ROW_KEYS, ...labelKeys };
  const tile = connectionTile(mark);
  const face = connectionTestFace(test);
  return (
    <div data-glim="ConnectionRow" role="group" aria-label={name} {...rest} className={["glim-well glim-connection", className].filter(Boolean).join(" ")}>
      <span className="glim-connection-tile" style={tile.style as CSSProperties | undefined} aria-hidden="true">
        <span className="glim-connection-mark">{tile.svg === undefined ? (mark as ReactNode) : <BrandMark svg={tile.svg} />}</span>
      </span>
      <div className="glim-connection-main">
        <div className="glim-connection-head">
          <span className="glim-connection-name">{name}</span>
          {badges && <span className="glim-connection-badges">{badges}</span>}
        </div>
        <div className="glim-connection-foot">
          <div className="glim-connection-about">
            {status && <p className="glim-connection-status">{status}</p>}
            {children}
          </div>
          {(onTest || onEdit || onRemove) && (
            <span className="glim-connection-actions">
              {onTest && (
                <Button
                  label={text.test}
                  labelKey={keys.test}
                  glyph={face.outcome === "check" ? <IconCheck /> : face.outcome === "cross" ? <IconClose /> : undefined}
                  tone={face.tone}
                  busy={test?.busy}
                  title={test?.title}
                  compactBelow={NARROW}
                  className={face.shake ? "glim-shake" : undefined}
                  data-connection="test"
                  onClick={onTest}
                />
              )}
              {onEdit && <Button label={text.edit} labelKey={keys.edit} compactBelow={NARROW} data-connection="edit" onClick={onEdit} />}
              {onRemove && <Button label={text.remove} labelKey={keys.remove} compactBelow={NARROW} data-connection="remove" onClick={onRemove} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
