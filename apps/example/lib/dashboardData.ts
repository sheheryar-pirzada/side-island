export type WidgetType = "bar-chart" | "pie-chart" | "todo-card" | "in-progress-card" | "completed-card";

export type Widget = {
  id: string;
  type: WidgetType;
  position?: { x: number; y: number };
  data?: {
    title?: string;
    chartData?: Array<{ x: number; y: number; label?: string }>;
  };
};

export type Person = {
  id: string;
  name: string;
  avatar: string;
  color: string;
};

export type Task = {
  id: string;
  title: string;
  assignedPersonId?: string;
  status: "todo" | "in-progress" | "completed";
};

export const WIDGET_TYPES: Array<{ type: WidgetType; label: string; icon: string }> = [
  { type: "bar-chart", label: "Bar Chart", icon: "chart.bar.fill" },
  { type: "pie-chart", label: "Pie Chart", icon: "chart.pie.fill" },
  { type: "todo-card", label: "Todo Card", icon: "list.bullet.clipboard" },
  { type: "in-progress-card", label: "In Progress", icon: "hourglass.bottomhalf.filled" },
  { type: "completed-card", label: "Completed", icon: "checkmark.circle.fill" },
];

export const SAMPLE_PEOPLE: Person[] = [
  {
    id: "1",
    name: "Alice",
    avatar: "https://i.pravatar.cc/150?img=1",
    color: "#a78bfa",
  },
  {
    id: "2",
    name: "Bob",
    avatar: "https://i.pravatar.cc/150?img=2",
    color: "#f472b6",
  },
  {
    id: "3",
    name: "Charlie",
    avatar: "https://i.pravatar.cc/150?img=3",
    color: "#60a5fa",
  },
  {
    id: "4",
    name: "Diana",
    avatar: "https://i.pravatar.cc/150?img=4",
    color: "#34d399",
  },
  {
    id: "5",
    name: "Eve",
    avatar: "https://i.pravatar.cc/150?img=5",
    color: "#fbbf24",
  },
];

export const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Design new logo", status: "todo" },
  { id: "t2", title: "Write blog post", status: "todo" },
  { id: "t3", title: "Fix login bug", status: "in-progress", assignedPersonId: "1" },
  { id: "t4", title: "Update documentation", status: "in-progress" },
  { id: "t5", title: "Code review PR #123", status: "completed", assignedPersonId: "2" },
  { id: "t6", title: "Plan sprint", status: "completed" },
];

export const SAMPLE_CHART_DATA = Array.from({ length: 7 }, (_, i) => ({
  x: i + 1,
  y: 20 + Math.random() * 60,
  label: `Day ${i + 1}`,
}));

export const SAMPLE_PIE_DATA = [
  { x: "Category A", y: 35 },
  { x: "Category B", y: 25 },
  { x: "Category C", y: 20 },
  { x: "Category D", y: 20 },
];

