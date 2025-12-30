import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import Animated from "react-native-reanimated";

import { SelectedPeopleList } from "./SelectedPeopleList";
import { AddPeopleFab } from "./AddPeopleFab";
import type { SelectedPerson } from "../../lib/shareDemoData";
import type { SendStatus } from "./SendFab";

export function DocumentPermissionCard({
  accentColor,
  filename,
  fileNameAnimatedStyle,
  selectedList,
  sendStatus,
  onCycleRole,
  onRemovePerson,
  onPressAddPeople,
}: {
  accentColor: string;
  filename: string;
  fileNameAnimatedStyle: any;
  selectedList: SelectedPerson[];
  sendStatus: SendStatus;
  onCycleRole: (personId: string) => void;
  onRemovePerson: (personId: string) => void;
  onPressAddPeople: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>document permissions</Text>

      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Share</Text>
        <View style={styles.fileInline}>
          <SymbolView name="document.fill" size={24} tintColor={accentColor} />
          <Animated.Text style={[styles.filename, { fontSize: 16, fontWeight: "700" }, fileNameAnimatedStyle]}>
            {filename}
          </Animated.Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Add people and set their permissions. They'll receive an email notification.</Text>

      <SelectedPeopleList
        items={selectedList}
        accentColor={accentColor}
        onCycleRole={onCycleRole}
        onRemove={onRemovePerson}
      />

      <View style={styles.shareFabRow}>
        {sendStatus === "idle" && <AddPeopleFab onPress={onPressAddPeople} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shareFabRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  card: {
    marginTop: 0,
    marginHorizontal: '2%',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: "#18181b",
  },
  kicker: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
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
    lineHeight: 30,
  },
  fileInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filename: {
    color: "#a78bfa",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#71717a",
  },
});


