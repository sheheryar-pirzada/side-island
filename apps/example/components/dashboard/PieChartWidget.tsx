import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PolarChart, Pie } from "victory-native";
import { SAMPLE_PIE_DATA } from "../../lib/dashboardData";

// Color palette for pie chart slices
const PIE_COLORS = ["#a78bfa", "#f472b6", "#60a5fa", "#34d399", "#fbbf24"];

export function PieChartWidget() {
  // Transform pie data to include color field for PolarChart
  const chartData = SAMPLE_PIE_DATA.map((item, index) => ({
    label: item.x,
    value: item.y,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distribution</Text>
      <View style={styles.chartContainer}>
        <PolarChart
          data={chartData}
          labelKey="label"
          valueKey="value"
          colorKey="color"
          containerStyle={styles.chartContainer}
          canvasStyle={styles.chart}
        >
          <Pie.Chart>
            {({ slice }) => (
              <Pie.Slice />
            )}
          </Pie.Chart>
        </PolarChart>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  chartContainer: {
    height: 200,
    width: "100%",
  },
  chart: {
    height: 200,
    width: "100%",
  },
});

