import type React from "react";
import type { FlatListProps, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

export type SideIslandItemScrollAnimationInfo = {
  /**
   * The item index in the FlatList.
   */
  index: number;
  /**
   * Scroll position (contentOffset.y) of the island list.
   */
  scrollY: SharedValue<number>;
  /**
   * Measured height of an item row (shared value, populated after first layout).
   */
  itemHeight: SharedValue<number>;
  /**
   * Visible list viewport height (island height minus internal padding).
   */
  viewportHeight: number;
  /**
   * Estimated separator height used for stride calculations.
   */
  separatorHeight: number;
};

export type TeamMember = {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status?: "active" | "inactive";
};

export type SideIslandHaptics = {
  /**
   * Called when the island opens (expanded becomes true).
   * Implement this using your own haptics library (e.g. expo-haptics).
   */
  onOpen?: () => void | Promise<void>;
  /**
   * Called when the island closes (expanded becomes false).
   * Implement this using your own haptics library (e.g. expo-haptics).
   */
  onClose?: () => void | Promise<void>;
  /**
   * Called when the focused item changes while scrolling.
   * Use this to trigger a "rigid" (or other) haptic in your app.
   */
  onFocusChange?: (info: { index: number } | null) => void | Promise<void>;
};

export type SideIslandPosition = "left" | "right";

export type SideIslandConfig = {
  /**
   * Which side of the screen the island is pinned to.
   * Default: "right"
   */
  position?: SideIslandPosition;
  width?: number;
  height?: number;
  waveAmplitude?: number;
  waveY1?: number;
  waveY2?: number;
  backgroundColor?: string;
  topOffset?: number;
  /**
   * Optional haptics adapter. If provided, it will be used to trigger haptic feedback
   * on island open/close without adding a hard dependency to any haptics library.
   */
  haptics?: SideIslandHaptics;
};

export type SideIslandController = {
  expanded: boolean;
  setExpanded: (next: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  config: SideIslandConfig;
};

export type SideIslandProviderProps = {
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  config?: SideIslandConfig;
  value?: {
    expanded: boolean;
    setExpanded: (next: boolean) => void;
    config?: SideIslandConfig;
  };
};

export type SideIslandProps<ItemT> = {
  items: readonly ItemT[];
  renderItem: (info: { item: ItemT; index: number }) => React.ReactElement | null;
  keyExtractor?: (item: ItemT, index: number) => string;
  listProps?: Omit<FlatListProps<ItemT>, "data" | "renderItem" | "keyExtractor">;
  /**
   * Optional wrapper for each rendered list item. Use this to implement custom scroll-based
   * animations (e.g. fade/scale/rotate) using Reanimated.
   *
   * If not provided, SideIsland uses its built-in "scale toward center" animation.
   */
  renderItemWrapper?: (
    info: SideIslandItemScrollAnimationInfo & { children: React.ReactNode }
  ) => React.ReactElement;
  /**
   * Called whenever the "focused" item changes as the user scrolls.
   * Focus is determined by the item closest to the vertical center of the island.
   * On first open, the island scrolls to focus the first item (index 0) centered.
   * On subsequent opens, the island scrolls back to the last focused item.
   */
  onFocusedItemChange?: (info: { item: ItemT; index: number } | null) => void;

  /**
   * Which side of the screen the island is pinned to.
   * Default: "right"
   */
  position?: SideIslandPosition;
  width?: number;
  height?: number;
  waveAmplitude?: number;
  waveY1?: number;
  waveY2?: number;
  backgroundColor?: string;
  topOffset?: number;
  /**
   * Optional haptics adapter. If provided, it will be used to trigger haptic feedback
   * on island open/close without adding a hard dependency to any haptics library.
   */
  haptics?: SideIslandHaptics;

  style?: ViewStyle;

  expanded?: boolean;
  onToggleExpanded?: (next: boolean) => void;
  defaultExpanded?: boolean;

  /**
   * Optional backdrop component that will fade into view when the island expands.
   * Should cover the full screen and be positioned behind the island.
   */
  backdropComponent?: React.ReactElement;

  /**
   * Optional component to render details of the currently focused item.
   * Displayed on top of the backdrop, opposite of the island:
   * - position="right" => detail is to the left of the island
   * - position="left"  => detail is to the right of the island
   * Receives the focused item info and can interact with the island.
   */
  renderFocusedItemDetail?: (info: {
    item: ItemT;
    index: number;
    expanded: boolean;
    setExpanded: (next: boolean) => void;
  }) => React.ReactElement | null;

  /**
   * Horizontal gap between the focused item detail component and the island.
   * Default: 16
   */
  focusedItemDetailGap?: number;

  /**
   * Enable drag-and-drop functionality for island items.
   * When enabled, items can be dragged and dropped into DroppableContainer components.
   * Default: false
   */
  enableDragAndDrop?: boolean;

  /**
   * Unique identifier for this island when using drag-and-drop.
   * Used to identify which island an item came from in drop callbacks.
   * Default: "default"
   */
  islandId?: string;

  /**
   * Custom function to extract drag payload from an item.
   * Defaults to returning { item, index }.
   */
  getDragPayload?: (info: { item: ItemT; index: number }) => unknown;

  /**
   * Custom render function for the drag preview that follows the finger.
   * Defaults to rendering the item itself.
   */
  renderDragPreview?: (info: { item: ItemT; index: number }) => React.ReactElement | null;

  /**
   * Called when a drag operation starts.
   */
  onDragStart?: (info: { item: ItemT; index: number; islandId: string }) => void;

  /**
   * Called when a drag operation ends.
   * dropResult is null if the item was not dropped in a valid drop zone.
   */
  onDragEnd?: (info: {
    item: ItemT;
    index: number;
    islandId: string;
    dropResult: null | { dropZoneId: string };
  }) => void;
};
