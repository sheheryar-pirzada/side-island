export type Task = {
  id: string;
  title: string;
  description?: string;
  color: string;
};

export const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Design new logo",
    description: "Create logo concepts for rebrand",
    color: "#a78bfa",
  },
  {
    id: "2",
    title: "Write blog post",
    description: "Article about React Native performance",
    color: "#f472b6",
  },
  {
    id: "3",
    title: "Fix login bug",
    description: "Users unable to log in on iOS",
    color: "#60a5fa",
  },
  {
    id: "4",
    title: "Update documentation",
    description: "Add new API endpoints to docs",
    color: "#34d399",
  },
  {
    id: "5",
    title: "Code review PR #123",
    description: "Review team member's pull request",
    color: "#fbbf24",
  },
  {
    id: "6",
    title: "Plan sprint",
    description: "Organize tasks for next sprint",
    color: "#fb7185",
  },
  {
    id: "7",
    title: "Setup CI/CD",
    description: "Configure automated deployments",
    color: "#818cf8",
  },
  {
    id: "8",
    title: "User testing",
    description: "Conduct usability testing sessions",
    color: "#f59e0b",
  },
];

export type TaskStatus = "todo" | "in-progress" | "done";

