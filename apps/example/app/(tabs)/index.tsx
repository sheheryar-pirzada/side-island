import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { SideIsland } from "@peersahab/side-island";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { LABEL_COLORS, PEOPLE, ROLE_CYCLE, ROLE_LABELS } from "../../lib/shareDemoData";
import type { Person, SelectedPerson } from "../../lib/shareDemoData";
import { RoleIcon } from "../../components/share/RoleIcon";
import { IslandAvatarItem } from "../../components/share/IslandAvatarItem";
import { SendFab } from "../../components/share/SendFab";
import type { SendStatus } from "../../components/share/SendFab";
import { LabelCard } from "../../components/share/LabelCard";
import { ColorPickerIsland } from "../../components/share/ColorPickerIsland";
import { ReviewCard } from "../../components/share/ReviewCard";
import { DocumentPermissionCard } from "../../components/share/DocumentPermissionCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const [expanded, setExpanded] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedPeople, setSelectedPeople] = useState<Record<string, SelectedPerson>>({});
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [accentColor, setAccentColor] = useState("#a78bfa");
  const [labelText, setLabelText] = useState("");
  const [labelColor, setLabelColor] = useState("#a78bfa");
  const [colorExpanded, setColorExpanded] = useState(false);

  const bottomInset = insets.bottom ?? 0;

  // Animation values
  const sendButtonWidth = useSharedValue(48);
  const progress = useSharedValue(0); // 0..1
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetState = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    setSendStatus("idle");
    setSelectedPeople({});
    setLabelText("");
    sendButtonWidth.value = withTiming(48, { duration: 260, easing: Easing.out(Easing.cubic) });
    progress.value = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const onSendFinished = useCallback(() => {
    setSendStatus("sent");
    // fire and forget
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    resetTimeoutRef.current = setTimeout(() => {
      resetState();
    }, 2200);
  }, [resetState]);

  const handleSend = useCallback(() => {
    if (sendStatus !== "idle" || Object.keys(selectedPeople).length === 0) return;

    setSendStatus("sending");
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Expand button width
    sendButtonWidth.value = withTiming(140, { duration: 300, easing: Easing.out(Easing.cubic) });

    // Animate progress bar
    progress.value = 0;
    progress.value = withTiming(1, { duration: 2000, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(onSendFinished)();
      }
    });
  }, [sendStatus, selectedPeople, onSendFinished]);

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    width: sendButtonWidth.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: sendButtonWidth.value * progress.value,
  }));

  const planeAnimatedStyle = useAnimatedStyle(() => {
    const w = sendButtonWidth.value;
    const icon = 18;
    // Travel the full width (left edge -> right edge) while staying inside the button.
    const travel = Math.max(0, w - icon);
    return {
      transform: [
        { translateX: travel * progress.value },
      ],
    };
  });

  const fileNameAnimatedStyle = useAnimatedStyle(
    () => ({
      color: interpolateColor(progress.value, [0, 1], [accentColor, "#22c55e"]),
    }),
    [accentColor]
  );

  const people = useMemo<Person[]>(() => PEOPLE, []);

  const selectedList = Object.values(selectedPeople);
  const selectedCount = selectedList.length;

  const togglePerson = (person: Person) => {
    setSelectedPeople((prev) => {
      const next = { ...prev };
      if (next[person.id]) {
        delete next[person.id];
      } else {
        next[person.id] = { person, role: "view" };
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const cycleRole = (personId: string) => {
    setSelectedPeople((prev) => {
      const current = prev[personId];
      if (!current) return prev;
      const currentIndex = ROLE_CYCLE.indexOf(current.role);
      const nextRole = ROLE_CYCLE[(currentIndex + 1) % ROLE_CYCLE.length];
      return { ...prev, [personId]: { ...current, role: nextRole } };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removePerson = (personId: string) => {
    setSelectedPeople((prev) => {
      const next = { ...prev };
      delete next[personId];
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <DocumentPermissionCard
          accentColor={accentColor}
          filename="Secret-File.pdf"
          fileNameAnimatedStyle={fileNameAnimatedStyle}
          selectedList={selectedList}
          sendStatus={sendStatus}
          onCycleRole={cycleRole}
          onRemovePerson={removePerson}
          onPressAddPeople={() => setExpanded(!expanded)}
        />

        <LabelCard
          labelText={labelText}
          onChangeLabelText={setLabelText}
          labelColor={labelColor}
          accentColor={accentColor}
          onPressPickColor={() => setColorExpanded(true)}
          sendProgress={progress}
        />

        <ReviewCard
          filename="Secret-File.pdf"
          accentColor={accentColor}
          labelText={labelText}
          labelColor={labelColor}
          selected={selectedList}
          sendButtonWidth={sendButtonWidth}
          action={
            <SendFab
              selectedCount={selectedCount}
              sendStatus={sendStatus}
              onSend={handleSend}
              sendButtonAnimatedStyle={sendButtonAnimatedStyle}
              progressAnimatedStyle={progressAnimatedStyle}
              planeAnimatedStyle={planeAnimatedStyle}
            />
          }
        />
      </ScrollView>

      <SideIsland<Person>
        expanded={expanded}
        onToggleExpanded={setExpanded}
        position="right"
        width={38}
        haptics={{
          onOpen: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onClose: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onFocusChange: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
        }}
        height={320}
        topOffset={-180}
        focusedItemDetailGap={2}
        backdropComponent={
          <BlurView
            intensity={20}
            style={{ width: screenWidth, height: screenHeight }}
            tint="dark"
          />
        }
        items={people}
        keyExtractor={(p) => p.id}
        listProps={{
          showsVerticalScrollIndicator: false,
        }}
        renderItem={({ item }) => {
          const isSelected = !!selectedPeople[item.id];
          return <IslandAvatarItem person={item} selected={isSelected} onPress={() => togglePerson(item)} />;
        }}
        renderFocusedItemDetail={({ item }: { item: Person; index: number; expanded: boolean; setExpanded: (next: boolean) => void }) => {
          const selection = selectedPeople[item.id];
          const isSelected = !!selection;
          return (
            <View style={styles.detailCard}>
              <Animated.Text
                key={`name-${item.id}`}
                entering={FadeInUp.duration(200).springify()}
                exiting={FadeOutUp.duration(150)}
                style={styles.detailName}
              >
                {item.name}
              </Animated.Text>
              <Animated.Text
                key={`email-${item.id}`}
                entering={FadeInUp.duration(200).delay(30).springify()}
                exiting={FadeOutUp.duration(150)}
                style={styles.detailEmail}
              >
                {item.email}
              </Animated.Text>
              {isSelected && (
                <Animated.View
                  key={`role-${item.id}`}
                  entering={FadeInUp.duration(200).delay(60).springify()}
                  exiting={FadeOutUp.duration(150)}
                  style={styles.detailRoleRow}
                >
                  <Pressable
                    onPress={() => cycleRole(item.id)}
                    style={styles.detailRoleButton}
                  >
                    <Text style={styles.detailRoleText}>{ROLE_LABELS[selection.role]}</Text>
                    <RoleIcon role={selection.role} color="rgba(255,255,255,0.5)" size={16} />
                  </Pressable>
                </Animated.View>
              )}
              </View>
          );
        }}
      />

      <ColorPickerIsland
        expanded={colorExpanded}
        onToggleExpanded={setColorExpanded}
        colors={LABEL_COLORS}
        selectedColor={labelColor}
        onSelectColor={(hex) => {
          setLabelColor(hex);
          setAccentColor(hex);
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
    paddingBottom: 18,
  },
  detailCard: {
    alignItems: "flex-start",
    paddingRight: 4,
    minWidth: 140,
  },
  detailName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "right",
  },
  detailEmail: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    textAlign: "right",
    marginTop: 2,
  },
  detailRoleRow: {
    marginTop: 4,
  },
  detailRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailRoleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
});
