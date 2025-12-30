import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, PanResponder, Pressable, StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Canvas, Group, Path as SkPathNode, Skia } from "@shopify/react-native-skia";

import { SideIslandContext } from "./provider/side-island-provider";
import type { SideIslandPosition, SideIslandProps } from "./types/island";

function clamp(n: number, min: number, max: number) {
  "worklet";
  return Math.max(min, Math.min(max, n));
}

function buildWaveIslandPath(
  w: number,
  h: number,
  position: SideIslandPosition,
  amp: number = 34,
  y1: number = 0.28,
  y2: number = 0.72
) {
  const p = Skia.Path.Make();

  const pinnedRight = position === "right";
  const xPinned = pinnedRight ? w : 0;
  const xBulge = pinnedRight ? 0 : w;

  // Keep y1/y2 meaningful even when h is small.
  // Ensure y1 < y2 and they’re not too close.
  const minGap = 0.22; // 22% of height between peaks
  const Y1 = h * clamp(y1, 0.05, 0.45);
  const Y2 = h * clamp(y2, 0.55, 0.95);
  const gap = Y2 - Y1;
  const fixGap = gap < h * minGap;
  const Y1Fixed = fixGap ? h * 0.5 - (h * minGap) / 2 : Y1;
  const Y2Fixed = fixGap ? h * 0.5 + (h * minGap) / 2 : Y2;

  /**
   * Controls the "roundness" of the shoulders.
   * Clamp it by available vertical space and width so we don't overshoot.
   */
  const curveSize = Math.max(1, Math.min(Y1Fixed, h - Y2Fixed, w * 0.8));

  // Start at the pinned top corner, go clockwise
  p.moveTo(xPinned, 0);

  // Pinned edge straight down
  p.lineTo(xPinned, h);

  // Bottom convex S-curve (turn out, then into the bulge wall)
  p.cubicTo(
    xPinned,
    h - curveSize * 0.75,
    xBulge,
    Y2Fixed + curveSize * 0.75,
    xBulge,
    Y2Fixed
  );

  // Bulge edge (flat face where content sits)
  p.lineTo(xBulge, Y1Fixed);

  // Top convex S-curve (turn back into the pinned wall)
  p.cubicTo(xBulge, Y1Fixed - curveSize * 0.5, xPinned, curveSize * 0.5, xPinned, 0);

  p.close();
  return p;
}

function DefaultSeparator({ height = 12 }: { height?: number }) {
  return <View style={{ height }} />;
}

function ScaledItem({
  index,
  scrollY,
  itemHeight,
  viewportHeight,
  separatorHeight,
  children,
}: {
  index: number;
  scrollY: Animated.SharedValue<number>;
  itemHeight: Animated.SharedValue<number>;
  viewportHeight: number;
  separatorHeight: number;
  children: React.ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const h = itemHeight.value;
    if (h <= 0) return {};

    const stride = h + separatorHeight;
    const inset = Math.max(0, viewportHeight / 2 - h / 2);

    const itemCenterY = inset + index * stride + h / 2;
    const viewportCenterY = scrollY.value + viewportHeight / 2;
    const dist = Math.abs(itemCenterY - viewportCenterY);

    // Scale items based on distance from center:
    // - centered => 1.0
    // - 1 item away => 0.8
    // - 2 items away => 0.5
    // - 3+ items away => 0
    const scale = interpolate(dist, [0, stride, stride * 2, stride * 3], [1, 0.8, 0.5, 0], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  }, [index, separatorHeight, viewportHeight]);

  return (
    <Animated.View style={[{ alignItems: "center", justifyContent: "center" }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export function SideIsland<ItemT>({
  items,
  renderItem,
  keyExtractor,
  listProps,
  onFocusedItemChange,

  position,
  width,
  height,
  waveAmplitude,
  waveY1,
  waveY2,
  backgroundColor,
  handleWidth,
  topOffset,
  debug,
  haptics,

  style,

  expanded,
  onToggleExpanded,
  defaultExpanded = false,

  onPress,

  backdropComponent,
  renderFocusedItemDetail,
  focusedItemDetailGap = 16,
}: SideIslandProps<ItemT>) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const ctx = React.useContext(SideIslandContext);

  const resolvedPosition: SideIslandPosition = position ?? ctx?.config.position ?? "right";

  const resolvedWidth = width ?? ctx?.config.width ?? 40;
  const resolvedHeight = height ?? ctx?.config.height ?? 250;
  const resolvedWaveAmplitude = waveAmplitude ?? ctx?.config.waveAmplitude ?? 18;
  const resolvedWaveY1 = waveY1 ?? ctx?.config.waveY1 ?? 0.1;
  const resolvedWaveY2 = waveY2 ?? ctx?.config.waveY2 ?? 0.9;
  const resolvedHandleWidth = handleWidth ?? ctx?.config.handleWidth ?? 16;
  const resolvedTopOffset = topOffset ?? ctx?.config.topOffset ?? 0;
  const resolvedDebug = debug ?? ctx?.config.debug ?? false;
  const resolvedHaptics = haptics ?? ctx?.config.haptics;

  const log = (...args: any[]) => {
    if (typeof __DEV__ !== "undefined" && __DEV__ && resolvedDebug) {
      // eslint-disable-next-line no-console
      console.log("[side-island]", ...args);
    }
  };

  // Default island background should be pure black (app can override via prop/provider).
  const defaultBg = "#000000";
  const resolvedBackgroundColor = backgroundColor ?? ctx?.config.backgroundColor ?? defaultBg;

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isControlled = typeof expanded === "boolean";
  const isUsingProvider = !!ctx && !isControlled;

  const effectiveExpanded = isControlled ? expanded : isUsingProvider ? ctx.expanded : internalExpanded;

  const prevExpandedRef = useRef<boolean>(effectiveExpanded);
  useEffect(() => {
    const prev = prevExpandedRef.current;
    if (prev === effectiveExpanded) return;
    prevExpandedRef.current = effectiveExpanded;

    if (!resolvedHaptics) return;

    if (effectiveExpanded) {
      log("haptics:open");
      try {
        void resolvedHaptics.onOpen?.();
      } catch (e) {
        log("haptics:error", e);
      }
    } else {
      log("haptics:close");
      try {
        void resolvedHaptics.onClose?.();
      } catch (e) {
        log("haptics:error", e);
      }
    }
  }, [effectiveExpanded, resolvedHaptics]); // log intentionally not included

  const setExpanded = (next: boolean) => {
    log("setExpanded", { next, isControlled, isUsingProvider });
    if (isControlled) {
      onToggleExpanded?.(next);
      return;
    }
    if (isUsingProvider) {
      ctx.setExpanded(next);
      return;
    }
    setInternalExpanded(next);
  };

  const toggleExpanded = () => setExpanded(!effectiveExpanded);

  // Position island vertically centered and pinned to a screen edge
  const topPosition = Math.round((screenHeight - resolvedHeight) / 2) + resolvedTopOffset;

  // When collapsed, keep a small handle visible.
  const collapsedMagnitude = Math.max(0, resolvedWidth - resolvedHandleWidth);
  const collapsedTranslateX = resolvedPosition === "right" ? collapsedMagnitude : -collapsedMagnitude;

  // Animated translateX value - controls horizontal position
  const translateXAnim = useSharedValue(collapsedTranslateX);
  const backdropOpacity = useSharedValue(effectiveExpanded ? 1 : 0);

  useEffect(() => {
    log("animate", { effectiveExpanded, collapsedTranslateX });
    translateXAnim.value = withTiming(effectiveExpanded ? 0 : collapsedTranslateX, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    backdropOpacity.value = withTiming(effectiveExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [collapsedTranslateX, effectiveExpanded, translateXAnim, backdropOpacity]); // log is stable enough via resolvedDebug

  const path = useMemo(() => {
    return buildWaveIslandPath(resolvedWidth, resolvedHeight, resolvedPosition, resolvedWaveAmplitude, resolvedWaveY1, resolvedWaveY2);
  }, [resolvedHeight, resolvedPosition, resolvedWaveAmplitude, resolvedWaveY1, resolvedWaveY2, resolvedWidth]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: translateXAnim.value }] };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return { opacity: backdropOpacity.value };
  });

  const resolvedKeyExtractor = useMemo(() => {
    return keyExtractor ?? ((_: ItemT, index: number) => String(index));
  }, [keyExtractor]);

  const separator = listProps?.ItemSeparatorComponent ?? (() => <DefaultSeparator />);

  // Keep these in sync with the wrapper View around the FlatList (the one using StyleSheet.absoluteFill).
  // They shrink the *actual* visible list viewport inside the island.
  const listViewportPaddingTop = 24;
  const listViewportPaddingBottom = 24;

  const lastFocusedKeyRef = useRef<string | null>(null);
  const lastFocusedIndexRef = useRef<number | null>(null);
  const hasOpenedOnceRef = useRef(false);
  const suppressFocusRef = useRef(false);
  const listRef = useRef<FlatList<ItemT> | null>(null);
  const scrollYRef = useRef(0);
  const rafScheduledRef = useRef(false);
  const [measuredItemHeight, setMeasuredItemHeight] = useState<number | null>(null);
  const scrollYAnim = useSharedValue(0);
  const itemHeightAnim = useSharedValue(0);

  // Track focused item for the detail component
  const [focusedItemInfo, setFocusedItemInfo] = useState<{ item: ItemT; index: number } | null>(null);

  useEffect(() => {
    if (measuredItemHeight != null && measuredItemHeight > 0 && itemHeightAnim.value <= 0) {
      itemHeightAnim.value = measuredItemHeight;
    }
  }, [measuredItemHeight, itemHeightAnim]);

  // Add extra inset so the first/last items can be positioned in the *center* of the viewport.
  // IMPORTANT: don't add extra fixed padding on top of this, otherwise index 0 can never reach the center.
  const contentEdgeInset = useMemo(() => {
    const viewportHeight = Math.max(0, resolvedHeight - listViewportPaddingTop - listViewportPaddingBottom);
    const approxItemHalfHeight = measuredItemHeight ? measuredItemHeight / 2 : 20;
    return Math.max(0, Math.round(viewportHeight / 2 - approxItemHalfHeight));
  }, [measuredItemHeight, resolvedHeight]);
  const defaultViewabilityConfig = useMemo(() => {
    return {
      // Lower threshold so focus transitions don't require "half an item" to leave the viewport.
      itemVisiblePercentThreshold: 10,
      minimumViewTime: 0,
      waitForInteraction: false,
    };
  }, []);

  const emitFocus = (index: number) => {
    if (items.length === 0) return;
    const maxIndex = Math.max(0, items.length - 1);
    const clampedIndex = clamp(index, 0, maxIndex);
    const focusedKey = String(clampedIndex);

    if (focusedKey === lastFocusedKeyRef.current) return;

    lastFocusedKeyRef.current = focusedKey;
    lastFocusedIndexRef.current = clampedIndex;

    const focusInfo = { item: items[clampedIndex] as ItemT, index: clampedIndex };

    log("focus:change", { index: clampedIndex, key: focusedKey });
    setFocusedItemInfo(focusInfo);
    onFocusedItemChange?.(focusInfo);

    if (effectiveExpanded) {
      log("haptics:focus");
      try {
        void resolvedHaptics?.onFocusChange?.({ index: clampedIndex });
      } catch (e) {
        log("haptics:error", e);
      }
    }
  };

  const recomputeFocus = () => {
    if (suppressFocusRef.current) return;
    if (items.length === 0) return;

    const itemH = measuredItemHeight ?? 0;
    if (itemH <= 0) return;

    // DefaultSeparator height is 12; if user provides a custom separator, stride becomes unknown,
    // so we conservatively treat separator height as 0.
    const separatorEstimate = listProps?.ItemSeparatorComponent ? 0 : 12;
    const stride = itemH + separatorEstimate;

    const viewportHeight = Math.max(0, resolvedHeight - listViewportPaddingTop - listViewportPaddingBottom);
    const centerY = scrollYRef.current + viewportHeight / 2;

    // First row's center is at: paddingTop + itemH/2
    const firstCenterY = contentEdgeInset + itemH / 2;
    const raw = (centerY - firstCenterY) / stride;
    const idx = Math.round(raw);
    emitFocus(idx);
  };

  const handleViewableItemsChanged = useMemo(() => {
    return (info: { viewableItems: Array<{ item: ItemT; index: number | null; key?: string }>; changed: any[] }) => {
      const viewable = (info?.viewableItems ?? []).filter((v) => v && v.index != null) as Array<{
        item: ItemT;
        index: number;
        key?: string;
      }>;

      // Preserve any caller-provided handler.
      (listProps as any)?.onViewableItemsChanged?.(info);

      const shouldReportFocus = !!onFocusedItemChange || !!resolvedHaptics?.onFocusChange;
      if (!shouldReportFocus) return;
      if (suppressFocusRef.current) return;

      // Viewability callbacks can temporarily report 0 items during fast scroll / mount.
      // Focus is driven by measured layouts + scroll position, so just request a recompute.
      if (viewable.length > 0) {
        recomputeFocus();
      }
    };
  }, [effectiveExpanded, listProps, onFocusedItemChange, resolvedHaptics]); // recomputeFocus uses refs

  const scrollToIndexCentered = (index: number, animated: boolean) => {
    const maxIndex = Math.max(0, items.length - 1);
    const clamped = clamp(index, 0, maxIndex);
    log("scrollToIndexCentered", { index: clamped, animated });
    listRef.current?.scrollToIndex({ index: clamped, animated, viewPosition: 0.5 });
  };

  useEffect(() => {
    if (!effectiveExpanded) return;
    if (items.length === 0) return;

    // On first open, center on the first item (index 0) and focus it.
    // On subsequent opens, center on the last focused item.
    const target =
      hasOpenedOnceRef.current && lastFocusedIndexRef.current != null
        ? lastFocusedIndexRef.current
        : 0;

    suppressFocusRef.current = true;
    const t0 = setTimeout(() => {
      scrollToIndexCentered(target, false);
      // Ensure focus starts at the intended target after the programmatic scroll.
      emitFocus(target);
      const t1 = setTimeout(() => {
        suppressFocusRef.current = false;
      }, 50);
      return () => clearTimeout(t1);
    }, 0);

    hasOpenedOnceRef.current = true;
    return () => clearTimeout(t0);
  }, [effectiveExpanded, items.length]);

  // Swipe toward the pinned edge on the backdrop to close (uses PanResponder to avoid requiring RNGH).
  // If no backdrop is provided, we fall back to attaching the gesture to the island itself.
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        if (!effectiveExpanded) return false;
        const dx = gestureState.dx;
        const dy = gestureState.dy;
        const should =
          resolvedPosition === "right"
            ? dx > 10 && Math.abs(dx) > Math.abs(dy)
            : dx < -10 && Math.abs(dx) > Math.abs(dy);
        if (should) log("swipe:claim", { dx, dy });
        return should;
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (!effectiveExpanded) return;
        const dx = gestureState.dx;
        const vx = gestureState.vx;
        log("swipe:release", { dx, vx });
        const shouldClose = resolvedPosition === "right" ? dx > 60 && vx > 0 : dx < -60 && vx < 0;
        if (shouldClose) {
          log("swipe:close", { dx, vx });
          setExpanded(false);
        }
      },
      onPanResponderTerminate: () => {
        log("swipe:terminate");
        // no-op
      },
    });
  }, [effectiveExpanded, setExpanded, log, resolvedPosition]);

  const panHandlers = backdropComponent ? undefined : panResponder.panHandlers;

  const islandContent = (
    <Animated.View
      {...panHandlers}
      style={[
        styles.container,
        {
          width: resolvedWidth,
          height: resolvedHeight,
          top: topPosition,
          ...(resolvedPosition === "right" ? { right: 0 } : { left: 0 }),
        },
        animatedContainerStyle,
        style,
      ]}
    >
      <View style={StyleSheet.absoluteFill}>
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Group clip={path}>
            <SkPathNode path={path} color={resolvedBackgroundColor} />
          </Group>
        </Canvas>

        <View
          style={[
            StyleSheet.absoluteFill,
            resolvedPosition === "right"
              ? { paddingTop: listViewportPaddingTop, paddingBottom: listViewportPaddingBottom, paddingLeft: 6, paddingRight: 0, borderRadius: 50 }
              : { paddingTop: listViewportPaddingTop, paddingBottom: listViewportPaddingBottom, paddingLeft: 0, paddingRight: 6, borderRadius: 50 },
          ]}
          pointerEvents="box-none"
        >
          <FlatList
            {...listProps}
            ref={(r) => {
              listRef.current = r;
            }}
            data={items as unknown as ItemT[]}
            renderItem={({ item, index }: { item: ItemT; index: number }) => {
              const viewportHeight = Math.max(0, resolvedHeight - listViewportPaddingTop - listViewportPaddingBottom);
              const separatorHeight = listProps?.ItemSeparatorComponent ? 0 : 12;
              return (
                <ScaledItem
                  index={index}
                  scrollY={scrollYAnim}
                  itemHeight={itemHeightAnim}
                  viewportHeight={viewportHeight}
                  separatorHeight={separatorHeight}
                >
                  <View
                    onLayout={(e) => {
                      const { height } = e.nativeEvent.layout;
                      if (height > 0 && itemHeightAnim.value <= 0) {
                        itemHeightAnim.value = height;
                      }
                      if (measuredItemHeight == null && height > 0) {
                        setMeasuredItemHeight(height);
                      }
                    }}
                  >
                    {renderItem({ item, index })}
                  </View>
                </ScaledItem>
              );
            }}
            keyExtractor={resolvedKeyExtractor}
            showsVerticalScrollIndicator={listProps?.showsVerticalScrollIndicator ?? false}
            ItemSeparatorComponent={separator}
            viewabilityConfig={listProps?.viewabilityConfig ?? defaultViewabilityConfig}
            onViewableItemsChanged={handleViewableItemsChanged as any}
            onScroll={(e) => {
              scrollYRef.current = e.nativeEvent.contentOffset.y;
              scrollYAnim.value = e.nativeEvent.contentOffset.y;
              (listProps as any)?.onScroll?.(e);
              if (!rafScheduledRef.current) {
                rafScheduledRef.current = true;
                requestAnimationFrame(() => {
                  rafScheduledRef.current = false;
                  recomputeFocus();
                });
              }
            }}
            scrollEventThrottle={listProps?.scrollEventThrottle ?? 16}
            onScrollToIndexFailed={(info) => {
              (listProps as any)?.onScrollToIndexFailed?.(info);
              setTimeout(() => {
                scrollToIndexCentered(info.index, false);
              }, 50);
            }}
            contentContainerStyle={[
              { alignItems: "center", paddingTop: contentEdgeInset, paddingBottom: contentEdgeInset },
              listProps?.contentContainerStyle as any,
            ]}
          />
        </View>

        {resolvedHandleWidth > 0 && (
          <Pressable
            onPress={() => {
              log("handle:press");
              onPress?.();
              toggleExpanded();
            }}
            style={[
              styles.handle,
              { width: resolvedHandleWidth },
              resolvedPosition === "right" ? styles.handleRight : styles.handleLeft,
            ]}
            hitSlop={10}
          />
        )}
      </View>
    </Animated.View>
  );

  // Render the focused item detail component
  const focusedItemDetailContent = useMemo(() => {
    if (!renderFocusedItemDetail || !focusedItemInfo) return null;
    return renderFocusedItemDetail({
      item: focusedItemInfo.item,
      index: focusedItemInfo.index,
      expanded: effectiveExpanded,
      setExpanded,
    });
  }, [renderFocusedItemDetail, focusedItemInfo, effectiveExpanded, setExpanded]);

  return (
    <>
      {backdropComponent && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              width: screenWidth,
              height: screenHeight,
            },
            animatedBackdropStyle,
          ]}
          pointerEvents={effectiveExpanded ? "auto" : "none"}
          {...panResponder.panHandlers}
        >
          {backdropComponent}
        </Animated.View>
      )}
      {focusedItemDetailContent && (
        <Animated.View
          style={[
            styles.focusedItemDetail,
            {
              ...(resolvedPosition === "right"
                ? { right: resolvedWidth + focusedItemDetailGap }
                : { left: resolvedWidth + focusedItemDetailGap }),
              top: topPosition,
              height: resolvedHeight,
            },
            animatedBackdropStyle,
          ]}
          pointerEvents={effectiveExpanded ? "auto" : "none"}
        >
          {focusedItemDetailContent}
        </Animated.View>
      )}
      {islandContent}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9998,
  },
  container: {
    position: "absolute",
    zIndex: 9999,
  },
  handle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  handleRight: {
    right: 0,
  },
  handleLeft: {
    left: 0,
  },
  focusedItemDetail: {
    position: "absolute",
    zIndex: 9999,
    justifyContent: "center",
  },
});
