import React, { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SideIsland } from "@peersahab/side-island";
import type { LabelColor } from "../../lib/shareDemoData";

export function ColorPickerIsland({
  expanded,
  onToggleExpanded,
  colors,
  selectedColor,
  onSelectColor,
}: {
  expanded: boolean;
  onToggleExpanded: (next: boolean) => void;
  colors: LabelColor[];
  selectedColor: string;
  onSelectColor: (hex: string) => void;
}) {
  const items = useMemo(() => colors, [colors]);
  const [focused, setFocused] = useState<LabelColor | null>(null);

  // Animated interpolation for the focused color label
  const prevColor = useSharedValue<string>(selectedColor);
  const nextColor = useSharedValue<string>(selectedColor);
  const t = useSharedValue(1);
  const slideT = useSharedValue(1);

  const lastColorRef = useRef<string>(selectedColor);

  const focusedTextAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(slideT.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(slideT.value, [0, 1], [8, 0], Extrapolation.CLAMP) }],
      color: interpolateColor(t.value, [0, 1], [prevColor.value, nextColor.value]),
    } as any;
  });

  return (
    <SideIsland<LabelColor>
      position="left"
      expanded={expanded}
      onToggleExpanded={onToggleExpanded}
      focusedItemDetailGap={10}
      height={350}
      topOffset={-90}
      backgroundColor="#000000"
      haptics={{
        onOpen: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        onClose: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        onFocusChange: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
      }}
      backdropComponent={<BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />}
      items={items}
      keyExtractor={(c) => c.value}
      onFocusedItemChange={(info) => {
        const next = info?.item ?? null;
        setFocused(next);
        if (!next) return;

        const nextHex = next.value;
        const prevHex = lastColorRef.current;
        if (prevHex.toLowerCase() === nextHex.toLowerCase()) return;

        lastColorRef.current = nextHex;
        prevColor.value = prevHex;
        nextColor.value = nextHex;
        t.value = 0;
        slideT.value = 0;
        t.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
        slideT.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      }}
      listProps={{ showsVerticalScrollIndicator: false }}
      renderFocusedItemDetail={({ item }) => {
        const effective = focused ?? item;
        return (
          <View style={styles.detailPill}>
            <Animated.Text style={[styles.detailText, focusedTextAnimatedStyle]}>
              {effective.name}
            </Animated.Text>
          </View>
        );
      }}
      renderItem={({ item }) => {
        const isSelected = item.value.toLowerCase() === selectedColor.toLowerCase();
        return (
          <Pressable
            onPress={() => {
              onSelectColor(item.value);
              onToggleExpanded(false);
              Haptics.selectionAsync();
            }}
            style={styles.swatchHit}
          >
            <View
              style={[
                styles.swatch,
                { backgroundColor: item.value },
                isSelected ? styles.swatchSelected : null,
              ]}
            />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  swatchHit: {
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
  },
  swatchSelected: {
    borderColor: "rgba(255,255,255,0.85)",
  },
  detailPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  detailText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});


