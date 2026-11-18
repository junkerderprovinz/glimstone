// The Vue names of what a Window, a menu, a tree and a picker are handed: the
// core's models with a component for a glyph.

import type { Component } from "vue";
import type {
  ButtonTone,
  MenuEntry as CoreMenuEntry,
  MenuHead as CoreMenuHead,
  MenuItem as CoreMenuItem,
  PickItem,
  TreeNode as CoreTreeNode,
} from "@glimstone/core";

export type MenuEntry = CoreMenuEntry<Component>;
export type MenuItem = CoreMenuItem<Component>;
export type MenuHead = CoreMenuHead<Component>;
export type TreeNode = CoreTreeNode<Component>;
export type PickerItem = PickItem<Component>;

export interface MenuBarMenu {
  label: string;
  items: MenuEntry[];
  /** The id of the open menu, for a caller or a script that looks for it. */
  id?: string;
}

export interface WindowAction {
  label: string;
  /** The translation key behind `label`, which picks the glyph, or `null`. */
  labelKey: string | null;
  glyph?: Component;
  /** The forward action, filled with the accent and placed last. */
  primary?: boolean;
  /** This action already leaves the window, so no Cancel or Close is added. */
  wayOut?: boolean;
  disabled?: boolean;
  /** Its fill once it has run, such as `ok` or `danger`, in place of the accent or the neutral grey. */
  tone?: ButtonTone;
  /** The busy ring in place of the glyph while it runs. The words, and so the width, stay. */
  busy?: boolean;
  /** What changes, such as how a test came out, in the button's bubble. */
  title?: string;
  /** Attributes for the action's button, such as a data hook. */
  attrs?: Record<string, string>;
  /** Runs on press. The window closes afterwards unless it returns false. */
  onClick?: () => void | false;
}
