import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SymbolView } from "expo-symbols";
import Animated, { interpolateColor, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

export function LabelCard({
  labelText,
  onChangeLabelText,
  labelColor,
  accentColor,
  onPressPickColor,
  sendProgress,
}: {
  labelText: string;
  onChangeLabelText: (next: string) => void;
  labelColor: string;
  accentColor: string;
  onPressPickColor: () => void;
  sendProgress?: SharedValue<number>;
}) {
  const fileNameAnimatedStyle = useAnimatedStyle(
    () => ({
      color: sendProgress
        ? interpolateColor(sendProgress.value, [0, 1], [accentColor, "#22c55e"])
        : accentColor,
    }),
    [accentColor, sendProgress]
  );

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>File label & Color</Text>

      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Add a label for</Text>
        <View style={styles.fileInline}>
          <SymbolView name="document.fill" size={24} tintColor={accentColor} />
          <Animated.Text style={[styles.filename, { fontSize: 16, fontWeight: "700" }, fileNameAnimatedStyle]}>
            Secret-File.pdf
          </Animated.Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.inlineField}>
          <SymbolView name="tag.fill" size={24} tintColor="rgba(255,255,255,0.45)" />
          <TextInput
            value={labelText}
            onChangeText={onChangeLabelText}
            placeholder="Create a label"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.inlineInput}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={onPressPickColor} style={styles.colorButton}>
          <SymbolView name="paintbrush.fill" size={24} tintColor={labelColor} />
        </Pressable>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fafafa",
    lineHeight: 22,
  },
  fileInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filename: {
    color: "rgba(255,255,255,0.7)",
  },
  row: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inlineField: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 44,
    gap: 10,
  },
  inlineInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
});


