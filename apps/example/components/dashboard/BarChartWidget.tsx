import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartesianChart, Bar } from "victory-native";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { SAMPLE_CHART_DATA } from "../../lib/dashboardData";

export function BarChartWidget() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Stats</Text>
      <View style={styles.chartContainer}>
        <CartesianChart
          data={SAMPLE_CHART_DATA}
          xKey="x"
          yKeys={["y"]}
          domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.y}
              chartBounds={chartBounds}
              roundedCorners={{ topLeft: 10, topRight: 10 }}
            >
              <LinearGradient
                start={vec(chartBounds.left, chartBounds.top)}
                end={vec(chartBounds.left, chartBounds.bottom)}
                colors={["#a78bfa", "#8b5cf6"]}
              />
            </Bar>
          )}
        </CartesianChart>
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

