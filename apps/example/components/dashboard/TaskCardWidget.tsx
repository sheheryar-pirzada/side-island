import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import type { Task, Person } from "../../lib/dashboardData";
import { SAMPLE_PEOPLE } from "../../lib/dashboardData";

type TaskCardWidgetProps = {
  tasks: Task[];
  status: "todo" | "in-progress" | "completed";
  onSelectTask: (taskId: string | null) => void;
  selectedTaskId: string | null;
};

export function TaskCardWidget({
  tasks,
  status,
  onSelectTask,
  selectedTaskId,
}: TaskCardWidgetProps) {
  const statusLabels = {
    todo: "To Do",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  const getPersonById = (id: string): Person | undefined => {
    return SAMPLE_PEOPLE.find((p) => p.id === id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{statusLabels[status]}</Text>
      <ScrollView
        style={styles.tasksScroll}
        contentContainerStyle={styles.tasksContainer}
        showsVerticalScrollIndicator={false}
      >
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks</Text>
          </View>
        ) : (
          tasks.map((task) => {
            const assignedPerson = task.assignedPersonId ? getPersonById(task.assignedPersonId) : null;
            const isSelected = selectedTaskId === task.id;

            return (
              <Animated.View
                key={task.id}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={[
                  styles.taskCard,
                  isSelected && styles.taskCardSelected,
                ]}
                onTouchEnd={() => {
                  onSelectTask(isSelected ? null : task.id);
                }}
              >
                <View style={styles.taskRow}>
                  <View style={styles.taskTextCol}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {!assignedPerson && (
                      <Text style={styles.assignHint}>Tap to assign person</Text>
                    )}
                  </View>

                  <View style={styles.avatarSlot}>
                    {assignedPerson ? (
                      <Image source={{ uri: assignedPerson.avatar }} style={styles.avatarSlotImg} />
                    ) : null}
                  </View>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
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
    // Match chart cards: 16 (top) + title + 12 + ~200 content + 16 (bottom) ≈ 260-270
    height: 264,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  tasksScroll: {
    flex: 1,
  },
  tasksContainer: {
    gap: 8,
    paddingBottom: 2,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
  },
  taskCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  taskCardSelected: {
    borderColor: "#a78bfa",
    borderWidth: 2,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  taskTextCol: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  avatarSlot: {
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
  avatarSlotImg: {
    width: "100%",
    height: "100%",
  },
  assignHint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    fontStyle: "italic",
  },
});

