import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Extrapolation, interpolate } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { SideIslandDndContextValue, DragPayload, DropZoneRegistry } from "./types";

const SideIslandDndContext = createContext<SideIslandDndContextValue | null>(null);

export function useSideIslandDnd(): SideIslandDndContextValue | null {
  const ctx = useContext(SideIslandDndContext);
  return ctx;
}

function pointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
}

type SideIslandDndProviderProps = {
  children: React.ReactNode;
  renderDragPreview?: (payload: DragPayload) => React.ReactElement | null;
};

export function SideIslandDndProvider({ children, renderDragPreview }: SideIslandDndProviderProps) {
  // Shared values for drag state
  const isDraggingSV = useSharedValue(false);
  const dragXSV = useSharedValue(0);
  const dragYSV = useSharedValue(0);
  const activeDropZoneIdSV = useSharedValue<string | null>(null);
  const snapBackAnimX = useSharedValue(0);
  const snapBackAnimY = useSharedValue(0);
  const isSnappingBackSV = useSharedValue(false);
  const islandPositionXSV = useSharedValue(0);
  const islandPositionYSV = useSharedValue(0);
  
  // JS refs for payload and registry
  const activePayloadRef = useRef<DragPayload | null>(null);
  const previewElementsMap = useRef<Map<string, React.ReactElement | null>>(new Map());
  const dropZoneRegistry = useRef<DropZoneRegistry>(new Map());
  const previousActiveDropZoneIdRef = useRef<string | null>(null);
  const onSnapBackCompleteRef = useRef<(() => void) | null>(null);

  // Provider needs to re-render to display preview content (refs don't trigger renders).
  const [activePayloadState, setActivePayloadState] = useState<DragPayload | null>(null);
  const [activePreviewElementState, setActivePreviewElementState] = useState<React.ReactElement | null>(null);
  
  const startDrag = (payload: DragPayload) => {
    activePayloadRef.current = payload;
    setActivePayloadState(payload);
    const previewElement = previewElementsMap.current.get(payload.key) || (renderDragPreview ? renderDragPreview(payload) : null);
    setActivePreviewElementState(previewElement);
    isDraggingSV.value = true;
    isSnappingBackSV.value = false;
    snapBackAnimX.value = 0;
    snapBackAnimY.value = 0;
    // Store island position in shared values for worklet access
    if (payload.islandPosition) {
      islandPositionXSV.value = payload.islandPosition.x;
      islandPositionYSV.value = payload.islandPosition.y;
    }
    previousActiveDropZoneIdRef.current = null;

    const previewFromMap = previewElementsMap.current.get(payload.key) ?? null;
    setActivePreviewElementState(previewFromMap ?? (renderDragPreview ? renderDragPreview(payload) : null));
  };

  const finishSnapBack = useCallback(() => {
    // Cleanup provider state on JS thread (safe: refs, maps, setState).
    const cb = onSnapBackCompleteRef.current;
    onSnapBackCompleteRef.current = null;

    activePayloadRef.current = null;
    activeDropZoneIdSV.value = null;
    previousActiveDropZoneIdRef.current = null;
    setActivePayloadState(null);
    setActivePreviewElementState(null);

    try {
      cb?.();
    } catch {
      // swallow
    }
  }, [activeDropZoneIdSV]);
  
  const setPreviewElement = (key: string, element: React.ReactElement | null) => {
    previewElementsMap.current.set(key, element);
    if (activePayloadRef.current?.key === key) {
      setActivePreviewElementState(element ?? (renderDragPreview ? renderDragPreview(activePayloadRef.current) : null));
    }
  };
  
  const updateDragPosition = (x: number, y: number) => {
    dragXSV.value = x;
    dragYSV.value = y;

    // Hit-test in JS (worklets cannot touch JS Maps, refs, or call arbitrary functions safely).
    if (!isDraggingSV.value) return;

    let foundId: string | null = null;
    const registry = dropZoneRegistry.current;
    const payload = activePayloadRef.current;

    for (const [dropZoneId, config] of registry.entries()) {
      const bounds = config.bounds.value;
      if (!pointInBounds(x, y, bounds)) continue;
      if (payload && config.accepts && !config.accepts(payload)) continue;
      foundId = dropZoneId;
      break;
    }

    const previousId = previousActiveDropZoneIdRef.current;
    if (foundId !== previousId) {
      // Update active shared value first for UI highlight.
      activeDropZoneIdSV.value = foundId;

      if (payload && previousId) {
        const prevConfig = registry.get(previousId);
        prevConfig?.onDragLeave?.(payload);
      }
      if (payload && foundId) {
        const newConfig = registry.get(foundId);
        newConfig?.onDragEnter?.(payload);
      }
      previousActiveDropZoneIdRef.current = foundId;
    } else {
      activeDropZoneIdSV.value = foundId;
    }
  };
  
  const endDrag = (shouldSnapBack: boolean = false, onSnapBackComplete?: () => void) => {
    const payload = activePayloadRef.current;
    const activeDropZoneId = activeDropZoneIdSV.value;
    
    if (payload && activeDropZoneId) {
      const config = dropZoneRegistry.current.get(activeDropZoneId);
      if (config) {
        config.onDrop(payload);
      }
    }
    
    // If no drop zone and should snap back, animate preview back to island
    if (shouldSnapBack && payload?.islandPosition) {
      onSnapBackCompleteRef.current = onSnapBackComplete ?? null;
      isSnappingBackSV.value = true;
      const targetX = payload.islandPosition.x;
      const targetY = payload.islandPosition.y;
      
      // Animate back to island center-left position using linear timing animation
      dragXSV.value = withTiming(targetX, { duration: 300 });
      dragYSV.value = withTiming(targetY, { duration: 300 }, (finished) => {
        "worklet";
        if (finished) {
          // Animation completed - hide preview first
          isDraggingSV.value = false;
          isSnappingBackSV.value = false;
          scheduleOnRN(finishSnapBack);
        }
      });
    } else {
      // Reset state immediately
      isDraggingSV.value = false;
      isSnappingBackSV.value = false;
      onSnapBackCompleteRef.current = null;
      finishSnapBack();
    }
  };
  
  const registerDropZone = (
    dropZoneId: string,
    config: {
      bounds: SharedValue<{ x: number; y: number; width: number; height: number }>;
      accepts?: (payload: DragPayload) => boolean;
      onDragEnter?: (payload: DragPayload) => void;
      onDragLeave?: (payload: DragPayload) => void;
      onDrop: (payload: DragPayload) => void;
    }
  ) => {
    dropZoneRegistry.current.set(dropZoneId, config);
  };
  
  const unregisterDropZone = (dropZoneId: string) => {
    dropZoneRegistry.current.delete(dropZoneId);
  };

  // NOTE: We intentionally do NOT expose refs/maps via context.
  // Reanimated worklets can capture context values; exposing refs can trigger
  // "[Worklets] Tried to modify key `current` ..." warnings when those refs are mutated.
  
  const contextValue = useMemo<SideIslandDndContextValue>(
    () => ({
      isDraggingSV,
      dragXSV,
      dragYSV,
      activeDropZoneIdSV,
      startDrag,
      setPreviewElement,
      updateDragPosition,
      endDrag,
      registerDropZone,
      unregisterDropZone,
    }),
    // These functions and shared values are stable within a single provider instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  
  // Drag preview overlay style with distance-based scaling
  const dragPreviewStyle = useAnimatedStyle(() => {
    const dragging = isDraggingSV.value;
    const snappingBack = isSnappingBackSV.value;
    if (!dragging && !snappingBack) {
      return { opacity: 0 };
    }
    
    let scale = 1;
    const islandX = islandPositionXSV.value;
    const islandY = islandPositionYSV.value;
    
    // Calculate scale based on distance from island (only if island position is set)
    if (islandX > 0 || islandY > 0) {
      const dx = dragXSV.value - islandX;
      const dy = dragYSV.value - islandY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Scale from 1x at 0 distance to 2x at 100px distance
      const scaleDistance = 100;
      scale = interpolate(
        distance,
        [0, scaleDistance],
        [1, 2],
        Extrapolation.CLAMP
      );
    }
    
    return {
      opacity: 1,
      position: "absolute" as const,
      left: dragXSV.value,
      top: dragYSV.value,
      transform: [
        { translateX: -50 },
        { translateY: -50 },
        { scale },
      ],
    };
  });
  
  return (
    <SideIslandDndContext.Provider value={contextValue}>
      {children}
      {/* Drag preview overlay (full-screen, not constrained by island) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.dragPreview, dragPreviewStyle]} pointerEvents="none">
          {activePreviewElementState}
        </Animated.View>
      </View>
    </SideIslandDndContext.Provider>
  );
}

const styles = StyleSheet.create({
  dragPreview: {
    zIndex: 10000,
    alignItems: "center",
    justifyContent: "center",
  },
});

