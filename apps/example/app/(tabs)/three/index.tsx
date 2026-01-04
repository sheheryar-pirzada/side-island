import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { SideIsland, DroppableContainer } from "@peersahab/side-island";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  type Widget,
  type WidgetType,
  type Person,
  type Task,
  WIDGET_TYPES,
  SAMPLE_PEOPLE,
  INITIAL_TASKS,
} from "../../../lib/dashboardData";
import { BarChartWidget } from "../../../components/dashboard/BarChartWidget";
import { PieChartWidget } from "../../../components/dashboard/PieChartWidget";
import { TaskCardWidget } from "../../../components/dashboard/TaskCardWidget";
import { useThreeHeader } from "./_layout";

export default function TabThreeScreen() {
  const { widgetPickerOpenSignal } = useThreeHeader();

  const [widgetPickerExpanded, setWidgetPickerExpanded] = useState(false);
  const [peoplePickerExpanded, setPeoplePickerExpanded] = useState(false);
  const [selectedTaskCardId, setSelectedTaskCardId] = useState<string | null>(null);
  const [draggedWidgetType, setDraggedWidgetType] = useState<WidgetType | null>(null);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Open island programmatically when headerRight is pressed.
  useEffect(() => {
    if (widgetPickerOpenSignal <= 0) return;
    setWidgetPickerExpanded(true);
  }, [widgetPickerOpenSignal]);

  // Dashboard widgets
  const [dashboardWidgets, setDashboardWidgets] = useState<Widget[]>([
    { id: "w1", type: "bar-chart" },
    { id: "w2", type: "pie-chart" },
    { id: "w3", type: "todo-card" },
  ]);

  // Tasks organized by status
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, Task[]>>({
    todo: INITIAL_TASKS.filter((t) => t.status === "todo"),
    "in-progress": INITIAL_TASKS.filter((t) => t.status === "in-progress"),
    completed: INITIAL_TASKS.filter((t) => t.status === "completed"),
  });

  const handleWidgetDrop = useCallback(
    (payload: { islandId: string; item: unknown; index: number; data: unknown }) => {
      const widgetType = payload.item as WidgetType;
      const newWidget: Widget = {
        id: `w${Date.now()}`,
        type: widgetType,
      };
      // No sorting/insertion: always append.
      setDashboardWidgets((prev) => [...prev, newWidget]);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    []
  );

  const handlePersonAssign = useCallback((taskId: string, personId: string) => {
    setTasksByStatus((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((status) => {
        next[status] = next[status].map((task) =>
          task.id === taskId ? { ...task, assignedPersonId: personId } : task
        );
      });
      return next;
    });
    // Keep the people picker open; let the user close it manually.
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleTaskSelect = useCallback((taskId: string | null) => {
    setSelectedTaskCardId(taskId);
    setPeoplePickerExpanded(taskId !== null);
    if (taskId) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleWidgetRemove = useCallback((widgetId: string) => {
    setDashboardWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const selectedTaskStatus = useMemo<"todo" | "in-progress" | "completed" | null>(() => {
    if (!selectedTaskCardId) return null;
    const statuses: Array<"todo" | "in-progress" | "completed"> = ["todo", "in-progress", "completed"];
    for (const status of statuses) {
      if (tasksByStatus[status]?.some((t) => t.id === selectedTaskCardId)) {
        return status;
      }
    }
    return null;
  }, [selectedTaskCardId, tasksByStatus]);

  const taskStatusLabel = useMemo(() => {
    const labels: Record<"todo" | "in-progress" | "completed", string> = {
      todo: "To Do",
      "in-progress": "In Progress",
      completed: "Completed",
    };
    return selectedTaskStatus ? labels[selectedTaskStatus] : "To Do";
  }, [selectedTaskStatus]);

  const taskStatusIcon = useMemo(() => {
    const icons: Record<"todo" | "in-progress" | "completed", string> = {
      todo: "list.bullet.clipboard",
      "in-progress": "hourglass.bottomhalf.filled",
      completed: "checkmark.circle.fill",
    };
    return selectedTaskStatus ? icons[selectedTaskStatus] : icons.todo;
  }, [selectedTaskStatus]);

  const renderWidget = useCallback(
    (widget: Widget) => {
      switch (widget.type) {
        case "bar-chart":
          return <BarChartWidget />;
        case "pie-chart":
          return <PieChartWidget />;
        case "todo-card":
          return (
            <TaskCardWidget
              tasks={tasksByStatus.todo}
              status="todo"
              onSelectTask={handleTaskSelect}
              selectedTaskId={selectedTaskCardId}
            />
          );
        case "in-progress-card":
          return (
            <TaskCardWidget
              tasks={tasksByStatus["in-progress"]}
              status="in-progress"
              onSelectTask={handleTaskSelect}
              selectedTaskId={selectedTaskCardId}
            />
          );
        case "completed-card":
          return (
            <TaskCardWidget
              tasks={tasksByStatus.completed}
              status="completed"
              onSelectTask={handleTaskSelect}
              selectedTaskId={selectedTaskCardId}
            />
          );
        default:
          return null;
      }
    },
    [tasksByStatus, handleTaskSelect, selectedTaskCardId]
  );

  // Filter widget types that are already on the dashboard
  const availableWidgetTypes = useMemo(() => {
    const existingTypes = new Set(dashboardWidgets.map((w) => w.type));
    return WIDGET_TYPES.filter((wt) => !existingTypes.has(wt.type)).map((wt) => wt.type);
  }, [dashboardWidgets]);

  // Render ghost placeholder for a widget
  const renderGhostWidget = useCallback((widget: Widget) => {
    // Defensive: in dev it’s easy to accidentally pass the wrong object into this renderer.
    // If `widget.type` is not a string, avoid rendering it as a React child.
    const rawType = (widget as any)?.type;
    const safeType: string = typeof rawType === "string" ? rawType : "unknown";
    const widgetType = WIDGET_TYPES.find((wt) => wt.type === (safeType as any));
    
    return (
      <View style={styles.ghostWidget}>
        <View style={styles.ghostWidgetContent}>
          <SymbolView 
            name={(widgetType?.icon as any) || "square.fill"} 
            size={20} 
            tintColor="rgba(255,255,255,0.4)" 
          />
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.ghostWidgetLabel}>
            {widgetType?.label || safeType}
          </Text>
        </View>
      </View>
    );
  }, []);

  // Backdrop component that shows ghost widgets and acts as drop zone
  const widgetPickerBackdrop = useMemo(() => {
    const renderGhostLayout = (charts: Widget[], cards: Widget[]) => {
      if (charts.length === 0 && cards.length === 0) {
        return (
          <View style={styles.emptyDashboard}>
            <Text style={styles.emptyText}>Drag widgets here</Text>
          </View>
        );
      }

      return (
        <>
          {/* Charts: full width (one per row) */}
          {charts.length > 0 ? (
            <View style={styles.fullWidthStack}>
              {charts.map((w) => (
                <View key={w.id} style={styles.fullWidthItem}>
                  {renderGhostWidget(w)}
                </View>
              ))}
            </View>
          ) : null}

          {/* Cards: two per row */}
          {cards.length > 0 ? (
            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                {cards
                  .filter((_, idx) => idx % 2 === 0)
                  .map((w) => (
                    <View key={w.id} style={styles.widgetWrapper}>
                      {renderGhostWidget(w)}
                    </View>
                  ))}
              </View>
              <View style={styles.column}>
                {cards
                  .filter((_, idx) => idx % 2 === 1)
                  .map((w) => (
                    <View key={w.id} style={styles.widgetWrapper}>
                      {renderGhostWidget(w)}
                    </View>
                  ))}
              </View>
            </View>
          ) : null}
        </>
      );
    };
    
    return (
      <View style={[StyleSheet.absoluteFill, styles.backdropContainer]}>
        <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
        <View style={styles.backdropDropZoneWrapper}>
          <DroppableContainer
            dropZoneId="dashboard-drop-zone"
            accepts={(payload) => payload.islandId === "widget-picker"}
            onDrop={({ payload }) => handleWidgetDrop(payload)}
            style={styles.backdropDropZone}
          >
          {({ isOver, isDragging }) => (
            <View
              style={[
                styles.backdropContent,
                { paddingHorizontal: '16%' },
              ]}
            >
              {(() => {
                const charts = dashboardWidgets.filter(
                  (w) => w.type === "bar-chart" || w.type === "pie-chart"
                );
                const cards = dashboardWidgets.filter(
                  (w) => w.type !== "bar-chart" && w.type !== "pie-chart"
                );

                if (isOver && draggedWidgetType) {
                  const preview: Widget = { id: "preview", type: draggedWidgetType };
                  const isChart = draggedWidgetType === "bar-chart" || draggedWidgetType === "pie-chart";

                  if (isChart) {
                    // Keep the preview consistent with the real dashboard layout: charts always render above cards.
                    // Special-case: when dragging pie chart, always show it directly below the bar chart (if present).
                    if (draggedWidgetType === "pie-chart") {
                      const lastBarIdx = charts.map((c) => c.type).lastIndexOf("bar-chart");
                      const insertAt = lastBarIdx >= 0 ? lastBarIdx + 1 : charts.length;
                      charts.splice(insertAt, 0, preview);
                    } else {
                      charts.push(preview);
                    }
                  } else {
                    cards.push(preview);
                  }
                }

                return renderGhostLayout(charts, cards);
              })()}
            </View>
          )}
          </DroppableContainer>
        </View>
      </View>
    );
  }, [dashboardWidgets, handleWidgetDrop, renderGhostWidget, draggedWidgetType]);

  // Because the header is transparent, we need to pad content below it.
  const topContentPadding = useMemo(() => insets.top + 56 + 12, [insets.top]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.dashboard,
          { paddingTop: topContentPadding, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DroppableContainer
          dropZoneId="dashboard-drop-zone"
          accepts={(payload) => payload.islandId === "widget-picker"}
          onDrop={({ payload }) => handleWidgetDrop(payload)}
          style={styles.dropZone}
        >
          {({ isOver, isDragging }) => (
            <View
              style={[
                styles.dashboardContent,
                isOver && styles.dashboardContentActive,
                isDragging && !isOver && styles.dashboardContentInactive,
              ]}
            >
              {dashboardWidgets.length === 0 ? (
                <View style={styles.emptyDashboard}>
                  <Text style={styles.emptyText}>Tap + in the header, then drag widgets here</Text>
                </View>
              ) : (
                <>
                  {/* Charts: full width (one per row) */}
                  <View style={styles.fullWidthStack}>
                    {dashboardWidgets
                      .filter((w) => w.type === "bar-chart" || w.type === "pie-chart")
                      .map((widget) => (
                        <View key={widget.id} style={styles.fullWidthItem}>
                          <View style={styles.widgetContainer}>
                            <Pressable
                              style={styles.removeButton}
                              onPress={() => handleWidgetRemove(widget.id)}
                            >
                              <SymbolView name="xmark.circle.fill" size={24} tintColor="rgba(255,255,255,0.6)" />
                            </Pressable>
                            {renderWidget(widget)}
                          </View>
                        </View>
                      ))}
                  </View>

                  {/* Cards: two per row */}
                  <View style={styles.twoColumnRow}>
                    <View style={styles.column}>
                      {dashboardWidgets
                        .filter((w) => w.type !== "bar-chart" && w.type !== "pie-chart")
                        .filter((_, idx) => idx % 2 === 0)
                        .map((widget) => (
                          <View key={widget.id} style={styles.widgetWrapper}>
                            <View style={styles.widgetContainer}>
                              <Pressable
                                style={styles.removeButton}
                                onPress={() => handleWidgetRemove(widget.id)}
                              >
                                <SymbolView name="xmark.circle.fill" size={24} tintColor="rgba(255,255,255,0.6)" />
                              </Pressable>
                              {renderWidget(widget)}
                            </View>
                          </View>
                        ))}
                    </View>
                    <View style={styles.column}>
                      {dashboardWidgets
                        .filter((w) => w.type !== "bar-chart" && w.type !== "pie-chart")
                        .filter((_, idx) => idx % 2 === 1)
                        .map((widget) => (
                          <View key={widget.id} style={styles.widgetWrapper}>
                            <View style={styles.widgetContainer}>
                              <Pressable
                                style={styles.removeButton}
                                onPress={() => handleWidgetRemove(widget.id)}
                              >
                                <SymbolView name="xmark.circle.fill" size={24} tintColor="rgba(255,255,255,0.6)" />
                              </Pressable>
                              {renderWidget(widget)}
                            </View>
                          </View>
                        ))}
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </DroppableContainer>
      </ScrollView>

      {/* Widget Picker Island (Type 1) */}
      <SideIsland<WidgetType>
        expanded={widgetPickerExpanded}
        onToggleExpanded={setWidgetPickerExpanded}
        position="right"
        width={38}
        haptics={{
          onOpen: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onClose: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          onFocusChange: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
        }}
        height={320}
        topOffset={-140}
        focusedItemDetailGap={2}
        enableDragAndDrop={true}
        islandId="widget-picker"
        // renderDragPreview={({ item }) => {
        //   const widgetType = WIDGET_TYPES.find((wt) => wt.type === item);
        //   return (
        //     <View style={styles.dragPreview}>
        //       <SymbolView name={widgetType?.icon as any || "square.fill"} size={24} tintColor="#ffffff" />
        //       <Text style={styles.dragPreviewText}>{widgetType?.label || item}</Text>
        //     </View>
        //   );
        // }}
        onDragStart={({ item }) => {
          setDraggedWidgetType(item);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onDragEnd={({ dropResult }) => {
          setDraggedWidgetType(null);
          if (dropResult) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }}
        backdropComponent={widgetPickerBackdrop}
        items={availableWidgetTypes}
        keyExtractor={(type) => type}
        listProps={{ showsVerticalScrollIndicator: false }}
        renderItem={({ item }) => {
          const widgetType = WIDGET_TYPES.find((wt) => wt.type === item);
          return (
            <View style={styles.widgetPickerItem}>
              <SymbolView name={widgetType?.icon as any || "square.fill"} size={20} tintColor="#ffffff" />
            </View>
          );
        }}
        renderFocusedItemDetail={({ item }) => {
          const widgetType = WIDGET_TYPES.find((wt) => wt.type === item);
          return (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{widgetType?.label || item}</Text>
            </View>
          );
        }}
      />

      {/* People Picker Island (Type 2) */}
      {selectedTaskCardId && (
        <SideIsland<Person>
          expanded={peoplePickerExpanded}
          onToggleExpanded={setPeoplePickerExpanded}
          position="left"
          haptics={{
            onOpen: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
            onClose: () => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTaskCardId(null);
            },
            onFocusChange: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
          }}
          height={240}
          topOffset={-180}
          focusedItemDetailGap={2}
          enableDragAndDrop={true}
          islandId="people-picker"
          onDragStart={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          onDragEnd={({ dropResult }) => {
            if (dropResult) {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }}
          backdropComponent={
            <View style={StyleSheet.absoluteFill}>
              <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
              <View style={styles.peopleBackdropCenter}>
                <View style={styles.peopleBackdropCard}>
                  <View style={styles.peopleBackdropHeader}>
                    <SymbolView name={taskStatusIcon as any} size={18} tintColor="rgba(255,255,255,0.55)" />
                    <Text style={styles.peopleBackdropTitle}>{taskStatusLabel}</Text>
                  </View>

                  <View style={styles.peopleBackdropRows}>
                    {(selectedTaskStatus ? tasksByStatus[selectedTaskStatus] : tasksByStatus.todo).map((task) => {
                      const assigned = task.assignedPersonId
                        ? SAMPLE_PEOPLE.find((p) => p.id === task.assignedPersonId)
                        : null;
                      return (
                        <DroppableContainer
                          key={task.id}
                          dropZoneId={`ghost-${selectedTaskStatus || "todo"}-${task.id}`}
                          accepts={(payload) => payload.islandId === "people-picker"}
                          onDrop={({ payload }) => {
                            const person = payload.item as Person;
                            handlePersonAssign(task.id, person.id);
                          }}
                        >
                          {({ isOver }) => (
                            <View>
                              <View style={[styles.peopleBackdropRow, isOver && styles.peopleBackdropRowActive]}>
                                <Text style={styles.peopleBackdropRowText}>{task.title}</Text>
                                <View
                                  style={[
                                    styles.peopleBackdropAvatarSlot,
                                    isOver && styles.peopleBackdropAvatarSlotActive,
                                  ]}
                                >
                                  {assigned ? (
                                    <Image source={{ uri: assigned.avatar }} style={styles.peopleBackdropAvatarImg} />
                                  ) : null}
                                </View>
                              </View>
                            </View>
                          )}
                        </DroppableContainer>
                      );
                    })}
                  </View>

                  <Text style={styles.peopleBackdropHint}>Drop a person onto a task row (avatar slot)</Text>
                </View>
              </View>
            </View>
          }
          items={SAMPLE_PEOPLE}
          keyExtractor={(person) => person.id}
          listProps={{ showsVerticalScrollIndicator: false }}
          renderItem={({ item }) => (
            <View style={styles.personPickerItem}>
              <Image source={{ uri: item.avatar }} style={styles.personAvatar} />
            </View>
          )}
          renderFocusedItemDetail={({ item }) => (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  dashboard: {
    paddingHorizontal: '2%',
    paddingBottom: 16,
  },
  dropZone: {
    flex: 1,
  },
  dashboardContent: {
    minHeight: 400,
  },
  dashboardContentActive: {
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    borderRadius: 16,
  },
  dashboardContentInactive: {
    opacity: 0.5,
  },
  emptyDashboard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
  fullWidthStack: {
    gap: 12,
    marginBottom: 12,
  },
  fullWidthItem: {
    width: "100%",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  widgetWrapper: {
    width: "100%",
  },
  widgetContainer: {
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
  },
  widgetPickerItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  dragPreview: {
    backgroundColor: "rgba(0,0,0,0.9)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 150,
  },
  dragPreviewText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  personPickerItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
  },
  personAvatar: {
    width: "100%",
    height: "100%",
  },
  personDragPreview: {
    backgroundColor: "rgba(0,0,0,0.9)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 120,
  },
  personDragAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  personDragName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  detailCard: {
    alignItems: "flex-start",
    paddingLeft: "8%",
    minWidth: 120,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "left",
  },
  peopleBackdropCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  peopleBackdropCard: {
    width: "68%",
    maxWidth: 360,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  peopleBackdropHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  peopleBackdropTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
  },
  peopleBackdropRows: {
    gap: 10,
  },
  peopleBackdropRow: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  peopleBackdropRowActive: {
    borderStyle: "solid",
    borderColor: "#a78bfa",
    backgroundColor: "rgba(167, 139, 250, 0.12)",
  },
  dropZoneDebugOutline: {
    borderRadius: 16,
  },
  peopleBackdropRowText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
  },
  peopleBackdropAvatarSlot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.02)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  peopleBackdropAvatarSlotActive: {
    borderStyle: "solid",
    borderColor: "#a78bfa",
  },
  peopleBackdropAvatarImg: {
    width: "100%",
    height: "100%",
  },
  peopleBackdropHint: {
    marginTop: 12,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
  backdropContainer: {
    flex: 1,
  },
  backdropDropZoneWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  backdropDropZone: {
    justifyContent: "center",
  },
  backdropContent: {
    justifyContent: "center",
    paddingBottom: 16,
    minWidth: "68%", // 100% - 16% padding on each side
  },
  backdropContentActive: {
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    borderRadius: 16,
  },
  backdropContentInactive: {
    opacity: 0.5,
  },
  ghostWidget: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderCurve: "continuous",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostWidgetContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  ghostWidgetLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
});


