import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { SymbolView } from "expo-symbols";

export type SendStatus = "idle" | "sending" | "sent";

export function SendFab({
  selectedCount,
  sendStatus,
  onSend,
  sendButtonAnimatedStyle,
  progressAnimatedStyle,
  planeAnimatedStyle,
}: {
  selectedCount: number;
  sendStatus: SendStatus;
  onSend: () => void;
  sendButtonAnimatedStyle: any;
  progressAnimatedStyle: any;
  planeAnimatedStyle: any;
}) {
  return (
    <Pressable
      onPress={onSend}
      disabled={selectedCount === 0 || sendStatus !== "idle"}
      style={[{ opacity: selectedCount === 0 && sendStatus === "idle" ? 0.4 : 1 }]}
    >
      <Animated.View
        style={[
          styles.fabPrimary,
          sendButtonAnimatedStyle,
          sendStatus === "sent" ? styles.fabPrimarySent : null,
        ]}
      >
        {sendStatus === "sending" && <Animated.View style={[styles.sendProgress, progressAnimatedStyle]} />}
        {sendStatus === "sent" && (
          <View style={[styles.sendProgress, { width: "100%", backgroundColor: "#22c55e" }]} />
        )}

        {sendStatus === "sending" && (
          <Animated.View pointerEvents="none" style={[styles.planeOverlay, planeAnimatedStyle]}>
            <View style={styles.planeIcon}>
              <SymbolView name="paperplane.fill" size={18} tintColor="white" />
            </View>
          </Animated.View>
        )}

        <View style={styles.sendButtonContent}>
          {sendStatus === "idle" && <SymbolView name="paperplane.fill" size={20} tintColor="white" />}
          {sendStatus === "sending" && <Text style={styles.sendButtonText}>Sending...</Text>}
          {sendStatus === "sent" && <Text style={[styles.sendButtonText, { color: "#ffffff" }]}>Sent!</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fabPrimary: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fabPrimarySent: {
    borderWidth: 0,
    borderColor: "transparent",
  },
  sendProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
  },
  sendButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  planeOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  planeIcon: {
    transform: [{ rotate: "45deg" }],
  },
});


