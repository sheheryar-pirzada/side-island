import { Text, StyleSheet } from "react-native";
import type { MeasurementItem } from "../../lib/measurementUtils";

type DayNumberItemProps = {
  item: MeasurementItem;
  isFocused: boolean;
};

export function DayNumberItem({ item, isFocused }: DayNumberItemProps) {
  const color = isFocused ? "#fbbf24" : "#ffffff";
  const opacity = isFocused ? 1 : 0.8;

  return (
    <Text
      style={[
        styles.dayNumber,
        {
          color,
          opacity,
        },
      ]}
    >
      {item.value}
    </Text>
  );
}

const styles = StyleSheet.create({
  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
});

