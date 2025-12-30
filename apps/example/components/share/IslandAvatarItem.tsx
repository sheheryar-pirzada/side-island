import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Person } from "../../lib/shareDemoData";

function CheckIcon() {
  return <Text style={styles.checkIcon}>✓</Text>;
}

export function IslandAvatarItem({
  person,
  selected,
  onPress,
}: {
  person: Person;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.avatarContainer}>
      <View style={[styles.avatarWrapper, selected && styles.avatarSelected]}>
        <Image source={{ uri: person.avatar }} style={styles.avatar} />
        {selected && (
          <View style={styles.checkBadge}>
            <CheckIcon />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
  },
  avatarWrapper: {
    position: "relative",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSelected: {
    borderColor: "#a78bfa",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#27272a",
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#a78bfa",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    fontSize: 9,
    fontWeight: "900",
    color: "#052e16",
  },
});


