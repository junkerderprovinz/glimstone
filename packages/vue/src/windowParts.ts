// The Vue names of what a Window, a menu and a tree are handed: the core's models
// with a component for a glyph.

import type { Component } from "vue";
import type { MenuEntry as CoreMenuEntry, MenuHead as CoreMenuHead, MenuItem as CoreMenuItem, TreeNode as CoreTreeNode } from "@glimstone/core";

export type MenuEntry = CoreMenuEntry<Component>;
export type MenuItem = CoreMenuItem<Component>;
export type MenuHead = CoreMenuHead<Component>;
export type TreeNode = CoreTreeNode<Component>;

export interface MenuBarMenu {
  label: string;
  items: MenuEntry[];
}

export interface WindowAction {
  label: string;
  /** The translation key behind `label`, which picks the glyph, or `null`. */
  labelKey: string | null;
  glyph?: Component;
  /** The forward action, filled with the accent and placed last. */
  primary?: boolean;
  /** This action already leaves the window, such as Done, so no Cancel or Close is added. */
  wayOut?: boolean;
  disabled?: boolean;
  /** Attributes for the action's button, such as a data hook. */
  attrs?: Record<string, string>;
  /** Runs on press. The window closes afterwards unless it returns false. */
  onClick?: () => void | false;
}
