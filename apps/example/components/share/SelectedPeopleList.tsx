import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { LinearTransition, SlideInDown, SlideOutDown } from "react-native-reanimated";

import type { SelectedPerson } from "../../lib/shareDemoData";
import { ROLE_LABELS } from "../../lib/shareDemoData";
import { RoleIcon } from "./RoleIcon";

export function SelectedPeopleList({
  items,
  accentColor = "#a78bfa",
  onCycleRole,
  onRemove,
}: {
  items: SelectedPerson[];
  accentColor?: string;
  onCycleRole: (personId: string) => void;
  onRemove: (personId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.selectedSection}>
      <Text style={styles.selectedHeader}>People with access</Text>
      <ScrollView style={styles.selectedList} showsVerticalScrollIndicator={false}>
        {items.map(({ person, role }) => (
          <Animated.View
            key={person.id}
            entering={SlideInDown.duration(200)}
            exiting={SlideOutDown.duration(150)}
            layout={LinearTransition.springify()}
            style={styles.selectedRow}
          >
            <Image source={{ uri: person.avatar }} style={styles.selectedAvatar} />
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{person.name}</Text>
              <Text style={styles.selectedEmail}>{person.email}</Text>
            </View>

            <Pressable onPress={() => onCycleRole(person.id)} style={[styles.roleButton, { backgroundColor: `${accentColor}26` }]}>
              <Text style={[styles.roleText, { color: accentColor }]}>{ROLE_LABELS[role]}</Text>
              <RoleIcon role={role} size={16} color={accentColor} />
            </Pressable>

            <Pressable onPress={() => onRemove(person.id)} style={styles.removeButton}>
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedSection: {
    marginTop: 24,
  },
  selectedHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  selectedList: {
    maxHeight: 180,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  selectedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
  },
  selectedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fafafa",
  },
  selectedEmail: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 1,
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderRadius: 12,
    borderCurve: "continuous",
    gap: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a78bfa",
  },
  removeButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  removeText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#71717a",
    marginTop: -2,
  },
});


