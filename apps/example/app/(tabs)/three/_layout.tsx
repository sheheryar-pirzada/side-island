import React, { createContext, useContext, useMemo, useState } from "react";
import { Pressable } from "react-native";
import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

type ThreeHeaderContextValue = {
  widgetPickerOpenSignal: number;
  openWidgetPicker: () => void;
};

const ThreeHeaderContext = createContext<ThreeHeaderContextValue | null>(null);

export function useThreeHeader(): ThreeHeaderContextValue {
  const ctx = useContext(ThreeHeaderContext);
  if (!ctx) {
    throw new Error("useThreeHeader must be used within app/(tabs)/three/_layout.tsx");
  }
  return ctx;
}

export default function ThreeLayout() {
  // Local state in layout that can be triggered by headerRight, and read by screen.
  const [widgetPickerOpenSignal, setWidgetPickerOpenSignal] = useState(0);

  const ctxValue = useMemo<ThreeHeaderContextValue>(
    () => ({
      widgetPickerOpenSignal,
      openWidgetPicker: () => {
        setWidgetPickerOpenSignal((n) => n + 1);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    }),
    [widgetPickerOpenSignal]
  );

  return (
    <ThreeHeaderContext.Provider value={ctxValue}>
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerShadowVisible: true,
          headerTitle: "Dashboard",
          headerTintColor: "#ffffff",
          headerRight: () => (
            <Pressable
              onPress={() => ctxValue.openWidgetPicker()}
              style={{
                width: 35,
                height: 35,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SymbolView style={{ alignSelf: "center" }} name="plus.circle.fill" size={28} tintColor="#ffffff" />
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </ThreeHeaderContext.Provider>
  );
}


