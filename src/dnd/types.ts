import type React from "react";
import type { SharedValue } from "react-native-reanimated";

export type DropZoneBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DragPayload = {
  islandId: string;
  item: unknown;
  index: number;
  data: unknown;
  key: string;
  islandPosition?: {
    x: number;
    y: number;
  };
};

export type DropZoneRegistry = Map<
  string,
  {
    bounds: SharedValue<DropZoneBounds>;
    accepts?: (payload: DragPayload) => boolean;
    onDragEnter?: (payload: DragPayload) => void;
    onDragLeave?: (payload: DragPayload) => void;
    onDrop: (payload: DragPayload) => void;
  }
>;

export type SideIslandDndContextValue = {
  // Shared values for drag state
  isDraggingSV: SharedValue<boolean>;
  dragXSV: SharedValue<number>;
  dragYSV: SharedValue<number>;
  activeDropZoneIdSV: SharedValue<string | null>;
  
  // Methods
  startDrag: (payload: DragPayload) => void;
  setPreviewElement: (key: string, element: React.ReactElement | null) => void;
  updateDragPosition: (x: number, y: number) => void;
  endDrag: (shouldSnapBack?: boolean, onSnapBackComplete?: () => void) => void;
  registerDropZone: (
    dropZoneId: string,
    config: {
      bounds: SharedValue<DropZoneBounds>;
      accepts?: (payload: DragPayload) => boolean;
      onDragEnter?: (payload: DragPayload) => void;
      onDragLeave?: (payload: DragPayload) => void;
      onDrop: (payload: DragPayload) => void;
    }
  ) => void;
  unregisterDropZone: (dropZoneId: string) => void;
};

