import React, { useEffect, useState } from "react";
import { View, LayoutChangeEvent } from "react-native";
import Animated, { useSharedValue, useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSideIslandDnd } from "./side-island-dnd-provider";
import type { DragPayload } from "./types";

export type DroppableContainerProps = {
  dropZoneId: string;
  accepts?: (payload: DragPayload) => boolean;
  onDrop: (info: { dropZoneId: string; payload: DragPayload }) => void;
  onDragEnter?: (payload: DragPayload) => void;
  onDragLeave?: (payload: DragPayload) => void;
  children: React.ReactNode | ((state: { isOver: boolean; isDragging: boolean }) => React.ReactNode);
  style?: any;
};

export function DroppableContainer({
  dropZoneId,
  accepts,
  onDrop,
  onDragEnter,
  onDragLeave,
  children,
  style,
}: DroppableContainerProps) {
  const dnd = useSideIslandDnd();
  const boundsSV = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const [isOver, setIsOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  if (!dnd) {
    console.warn("DroppableContainer: SideIslandDndProvider is not found. Drop zone will not work.");
    return <View style={style}>{typeof children === "function" ? children({ isOver: false, isDragging: false }) : children}</View>;
  }
  
  // Register/unregister this drop zone
  useEffect(() => {
    dnd.registerDropZone(dropZoneId, {
      bounds: boundsSV,
      accepts,
      onDragEnter,
      onDragLeave,
      onDrop: (payload) => {
        onDrop({ dropZoneId, payload });
      },
    });
    
    return () => {
      dnd.unregisterDropZone(dropZoneId);
    };
  }, [dropZoneId, accepts, onDrop, onDragEnter, onDragLeave, dnd, boundsSV]);
  
  // Update isOver state based on activeDropZoneId
  useAnimatedReaction(
    () => ({
      activeId: dnd.activeDropZoneIdSV.value,
      dragging: dnd.isDraggingSV.value,
    }),
    (state) => {
      const newIsOver = state.activeId === dropZoneId;
      const newIsDragging = state.dragging;
      scheduleOnRN(setIsOver, newIsOver);
      scheduleOnRN(setIsDragging, newIsDragging);
    }
  );
  
  const handleLayout = (event: LayoutChangeEvent) => {
    // Get absolute position on screen
    event.target.measure((fx, fy, fw, fh, px, py) => {
      boundsSV.value = {
        x: px,
        y: py,
        width: fw,
        height: fh,
      };
    });
  };
  
  // Render children with state
  const renderChildren = () => {
    if (typeof children === "function") {
      return children({ isOver, isDragging });
    }
    return children;
  };
  
  return (
    <View style={style} onLayout={handleLayout}>
      {renderChildren()}
    </View>
  );
}

