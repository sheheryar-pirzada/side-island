import React, { useMemo, useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { SideIsland } from "@peersahab/side-island";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  type MeasurementItem,
  generateHeightItems,
  generateWeightItems,
  generateDayItems,
  formatHeight,
  formatDate,
  calculateBMI,
  getBMICategory,
  convertKgToLbs,
} from "../../lib/measurementUtils";
import { MONTHS } from "../../constants/measurements";
import { DashItem } from "../../components/measurements/DashItem";
import { DayNumberItem } from "../../components/measurements/DayNumberItem";

export default function TabTwoScreen() {
  const [heightExpanded, setHeightExpanded] = useState(false);
  const [weightExpanded, setWeightExpanded] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [dateExpanded, setDateExpanded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [focusedDayIndex, setFocusedDayIndex] = useState<number | null>(null);
  const [selectedHeight, setSelectedHeight] = useState<number | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [focusedHeightIndex, setFocusedHeightIndex] = useState<number | null>(null);
  const [focusedWeightIndex, setFocusedWeightIndex] = useState<number | null>(null);

  const heightItems = useMemo(() => generateHeightItems(), []);
  const weightItems = useMemo(() => generateWeightItems(), []);
  const dayItems = useMemo(() => generateDayItems(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  const bottomInset = insets.bottom ?? 0;

  const handleHeightFocusChange = useCallback((info: { item: MeasurementItem; index: number } | null) => {
    if (info) {
      setFocusedHeightIndex(info.index);
      setSelectedHeight(info.item.value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleWeightFocusChange = useCallback((info: { item: MeasurementItem; index: number } | null) => {
    if (info) {
      setFocusedWeightIndex(info.index);
      setSelectedWeight(info.item.value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleDayFocusChange = useCallback((info: { item: MeasurementItem; index: number } | null) => {
    if (info) {
      setFocusedDayIndex(info.index);
      setSelectedDay(info.item.value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleMonthSelect = useCallback((month: number) => {
    setSelectedMonth(month);
    const daysInNewMonth = new Date(selectedYear, month + 1, 0).getDate();
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(daysInNewMonth);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [selectedYear, selectedDay]);


  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 60, paddingTop: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Profile</Text>
          <Text style={styles.headerSubtitle}>Enter your measurements</Text>
        </View>

        <Pressable
          style={[styles.card, styles.cardSelected]}
          onPress={() => {
            setDateExpanded(!dateExpanded);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <SymbolView name="calendar" size={30} tintColor="#fbbf24" />
            </View>
            <View style={styles.cardLeft}>
              <Text style={styles.cardLabel}>Date</Text>
              <Text style={styles.cardValue}>
                {formatDate(selectedYear, selectedMonth, selectedDay)}
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          style={[styles.card, selectedHeight !== null && styles.cardSelected]}
          onPress={() => {
            setHeightExpanded(!heightExpanded);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <SymbolView name="ruler.fill" style={{ transform: [{ rotate: "90deg" }] }} size={30} tintColor="#fbbf24" />
            </View>
            <View style={styles.cardLeft}>
              <Text style={styles.cardLabel}>Height</Text>
              <Text style={styles.cardValue}>
                {selectedHeight !== null ? formatHeight(selectedHeight) : "Tap to select"}
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          style={[styles.card, selectedWeight !== null && styles.cardSelected]}
          onPress={() => {
            setWeightExpanded(!weightExpanded);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <SymbolView name="scalemass.fill" size={30} tintColor="#fbbf24" />
            </View>
            <View style={styles.cardLeft}>
              <Text style={styles.cardLabel}>Weight</Text>
              <Text style={styles.cardValue}>
                {selectedWeight !== null ? `${selectedWeight} kg` : "Tap to select"}
              </Text>
            </View>
          </View>
        </Pressable>

        {selectedHeight !== null && selectedWeight !== null && (
          <Animated.View
            entering={FadeInUp.duration(300).springify()}
            style={styles.bmiCard}
          >
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={styles.bmiValue}>
              {calculateBMI(selectedWeight, selectedHeight).toFixed(1)}
            </Text>
            <Text style={styles.bmiCategory}>
              {getBMICategory(calculateBMI(selectedWeight, selectedHeight))}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Date Island */}
      <SideIsland<MeasurementItem>
        expanded={dateExpanded}
        onToggleExpanded={setDateExpanded}
        position="right"
        haptics={{
          onOpen: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onClose: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onFocusChange: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
        }}
        height={180}
        topOffset={-180}
        focusedItemDetailGap={16}
        backdropComponent={
          <BlurView
            intensity={30}
            style={{ width: screenWidth, height: screenHeight }}
            tint="systemChromeMaterialDark"
          />
        }
        items={dayItems}
        keyExtractor={(item) => item.id}
        onFocusedItemChange={handleDayFocusChange}
        listProps={{
          showsVerticalScrollIndicator: false,
        }}
        renderItem={({ item, index }) => {
          const isFocused = focusedDayIndex === index;
          return <DayNumberItem item={item} isFocused={isFocused} />;
        }}
        renderFocusedItemDetail={({ item, index, expanded, setExpanded }: { item: MeasurementItem; index: number; expanded: boolean; setExpanded: (next: boolean) => void }) => {
          const currentDate = new Date(selectedYear, selectedMonth, item.value);
          const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
          
          return (
            <Animated.View style={styles.dateDetailContainer}>
              <Animated.View style={styles.monthGridContainer}>
                <View style={styles.monthGrid}>
                  {MONTHS.map((month, monthIndex) => (
                    <Pressable
                      key={month}
                      onPress={() => handleMonthSelect(monthIndex)}
                      style={[
                        styles.monthButton,
                        selectedMonth === monthIndex && styles.monthButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthText,
                          selectedMonth === monthIndex && styles.monthTextSelected,
                        ]}
                      >
                        {month.slice(0, 3)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
              <Animated.Text
                key={`date-display-${item.id}`}
                entering={FadeIn.duration(200).springify()}
                exiting={FadeOut.duration(150)}
                style={styles.dateDisplay}
              >
                {weekday}
              </Animated.Text>
            </Animated.View>
          );
        }}
      />

      {/* Height Island */}
      <SideIsland<MeasurementItem>
        expanded={heightExpanded}
        onToggleExpanded={setHeightExpanded}
        position="right"
        haptics={{
          onOpen: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onClose: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onFocusChange: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
        }}
        height={180}
        topOffset={-180}
        focusedItemDetailGap={12}
        backdropComponent={
          <BlurView
            intensity={20}
            style={{ width: screenWidth, height: screenHeight }}
            tint="systemChromeMaterialDark"
          />
        }
        items={heightItems}
        keyExtractor={(item) => item.id}
        onFocusedItemChange={handleHeightFocusChange}
        listProps={{
          showsVerticalScrollIndicator: false,
        }}
        renderItem={({ item, index }) => {
          const isFocused = focusedHeightIndex === index;
          return <DashItem item={item} isFocused={isFocused} />;
        }}
        renderFocusedItemDetail={({ item }: { item: MeasurementItem; index: number; expanded: boolean; setExpanded: (next: boolean) => void }) => {
          return (
            <Animated.View style={styles.detailCard}>
              <Animated.Text
                key={`height-value-${item.id}`}
                entering={FadeIn.duration(200).delay(30).springify()}
                exiting={FadeOut.duration(150)}
                style={styles.detailValue}
              >
                {formatHeight(item.value)}
              </Animated.Text>
              <Animated.Text
                key={`height-label-${item.id}`}
                entering={FadeIn.duration(200).delay(30).springify()}
                exiting={FadeOut.duration(150)}
                style={styles.detailLabel}
              >
                {item.value} inches
              </Animated.Text>
            </Animated.View>
          );
        }}
      />

      {/* Weight Island */}
      <SideIsland<MeasurementItem>
        expanded={weightExpanded}
        onToggleExpanded={setWeightExpanded}
        position="right"
        haptics={{
          onOpen: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onClose: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onFocusChange: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
        }}
        height={180}
        topOffset={-180}
        focusedItemDetailGap={16}
        backdropComponent={
          <BlurView
            intensity={20}
            style={{ width: screenWidth, height: screenHeight }}
            tint="systemChromeMaterialDark"
          />
        }
        items={weightItems}
        keyExtractor={(item) => item.id}
        onFocusedItemChange={handleWeightFocusChange}
        listProps={{
          showsVerticalScrollIndicator: false,
        }}
        renderItem={({ item, index }) => {
          const isFocused = focusedWeightIndex === index;
          return <DashItem item={item} isFocused={isFocused} />;
        }}
        renderFocusedItemDetail={({ item }: { item: MeasurementItem; index: number; expanded: boolean; setExpanded: (next: boolean) => void }) => {
          return (
            <Animated.View style={styles.detailCard}>
              <Animated.Text
                key={`weight-value-${item.id}`}
                entering={FadeIn.duration(200).springify()}
                exiting={FadeOut.duration(150)}
                style={styles.detailValue}
              >
                {item.value} kg
              </Animated.Text>
              <Animated.Text
                key={`weight-label-${item.id}`}
                entering={FadeIn.duration(200).delay(30).springify()}
                exiting={FadeOut.duration(150)}
                style={styles.detailLabel}
              >
                {convertKgToLbs(item.value).toFixed(1)} lbs
              </Animated.Text>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    paddingHorizontal: '2%',
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: '2%',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "transparent",
    backgroundColor: "#1f1f1f",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flex: 1,
    marginLeft: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconText: {
    fontSize: 28,
  },
  bmiCard: {
    backgroundColor: "#fbbf24",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 24,
    marginTop: 8,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "transparent",
  },
  bmiLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(0,0,0,0.6)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 4,
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0,0,0,0.7)",
  },
  detailCard: {
    alignItems: "flex-end",
    paddingRight: 4,
    minWidth: 140,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fbbf24",
    textAlign: "right",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    textAlign: "right",
    marginTop: 4,
  },
  dateDetailContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 180,
    paddingRight: 4,
    gap: 24,
  },
  monthGridContainer: {
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  monthButton: {
    width: "30%",
    aspectRatio: 1.5,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  monthButtonSelected: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },
  monthText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  monthTextSelected: {
    color: "#000000",
  },
  dateDisplay: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fbbf24",
    textAlign: "right",
    minWidth: 80,
  },
});
