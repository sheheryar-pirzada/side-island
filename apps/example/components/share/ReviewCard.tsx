import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import type { SelectedPerson } from "../../lib/shareDemoData";

export function ReviewCard({
  filename,
  accentColor,
  labelText,
  labelColor,
  selected,
  action,
  sendButtonWidth,
}: {
  filename: string;
  accentColor: string;
  labelText: string;
  labelColor: string;
  selected: SelectedPerson[];
  action?: React.ReactNode;
  /**
   * Optional: if provided, avatars will "pack together" as the send button expands.
   * Expecting the same shared value that drives the send button width (collapsed ~48, expanded ~140).
   */
  sendButtonWidth?: SharedValue<number>;
}) {
  const people = selected.map((s) => s.person);
  const count = people.length;

  const showOverflow = count > 5;
  const visible = showOverflow ? people.slice(0, 4) : people.slice(0, 5);
  const overflowCount = showOverflow ? count - 4 : 0;

  const avatarPackStyle = useAnimatedStyle(() => {
    if (!sendButtonWidth) return {};
    const overlap = interpolate(sendButtonWidth.value, [48, 140], [0, -12], Extrapolation.CLAMP);
    const scale = interpolate(sendButtonWidth.value, [48, 140], [1, 0.92], Extrapolation.CLAMP);
    return { marginLeft: overlap, transform: [{ scale }] };
  }, [sendButtonWidth]);

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Review & Send</Text>

      <View style={styles.fileRow}>
        <SymbolView name="document.fill" size={20} tintColor={accentColor} />
        <Text style={[styles.filename, { color: accentColor }]}>{filename}</Text>
      </View>

      <View style={styles.metaRow}>
        {labelText.trim() ? (
          <View style={[styles.labelPill, { backgroundColor: labelColor }]}>
            <Text style={styles.labelText}>{labelText.trim()}</Text>
          </View>
        ) : (
          <Text style={styles.noLabel}>No label</Text>
        )}
      </View>

      <View style={styles.avatarsRow}>
        {count === 0 ? (
          <Text style={styles.emptyRecipients}>No recipients selected</Text>
        ) : (
          <View style={styles.avatarsGroup}>
            {visible.map((p, idx) => (
              <Animated.View key={p.id} style={idx === 0 ? undefined : avatarPackStyle}>
                <Image source={{ uri: p.avatar }} style={styles.avatar} />
              </Animated.View>
            ))}
            {showOverflow && (
              <Animated.View style={visible.length === 0 ? undefined : avatarPackStyle}>
                <View style={styles.moreAvatar}>
                  <Text style={styles.moreText}>+{overflowCount}</Text>
                </View>
              </Animated.View>
            )}
          </View>
        )}

        {action ? <View style={styles.inlineAction}>{action}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    marginHorizontal: '2%',
    padding: 24,
    paddingVertical: 20,
    borderRadius: 32,
    backgroundColor: "#18181b",
  },
  kicker: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 10,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filename: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  labelPill: {
    height: 32  ,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(0,0,0,0.8)",
  },
  noLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
  },
  avatarsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  avatarsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  inlineAction: {
    flexShrink: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
  },
  moreAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    fontSize: 12,
    fontWeight: "900",
    color: "rgba(255,255,255,0.75)",
  },
  emptyRecipients: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
  },
});
