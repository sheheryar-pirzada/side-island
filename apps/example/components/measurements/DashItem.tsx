import { View, StyleSheet } from "react-native";
import type { MeasurementItem } from "../../lib/measurementUtils";

type DashItemProps = {
  item: MeasurementItem;
  isFocused: boolean;
};

export function DashItem({ item, isFocused }: DashItemProps) {
  const color = isFocused ? "#fbbf24" : "#ffffff";
  const width = item.isMainMarker ? 20 : 15;
  const height = item.isMainMarker ? 8 : 4;
  const opacity = isFocused ? 1 : item.isMainMarker ? 0.7 : 0.4;

  return (
    <View
      style={[
        styles.dash,
        {
          width,
          height,
          backgroundColor: color,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dash: {
    borderRadius: 3,
  },
});

