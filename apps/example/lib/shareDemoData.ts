export type Role = "owner" | "comment" | "view";

export type Person = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export type SelectedPerson = {
  person: Person;
  role: Role;
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  comment: "Can comment",
  view: "Can view",
};

export const ROLE_ICONS: Record<Role, string> = {
  owner: "bolt.fill",
  comment: "text.bubble.fill",
  view: "eye.fill",
};

export const ROLE_CYCLE: Role[] = ["view", "comment", "owner"];

export const PEOPLE: Person[] = [
  {
    id: "p1",
    name: "Sherry",
    avatar:
      "https://media.licdn.com/dms/image/v2/C4D03AQGWP5yKwZQ93Q/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1625467384783?e=2147483647&v=beta&t=kGaQWXxrdaeKOR5lRz0iWMbRFmZ63LwlXL888Y5PDuA",
    email: "sherry@company.com",
  },
  { id: "p2", name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?img=50", email: "sarah@company.com" },
  { id: "p3", name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=43", email: "alex@company.com" },
  { id: "p4", name: "Mina Patel", avatar: "https://i.pravatar.cc/150?img=67", email: "mina@company.com" },
  { id: "p5", name: "Jordan Lee", avatar: "https://i.pravatar.cc/150?img=22", email: "jordan@company.com" },
  { id: "p6", name: "Sam Nguyen", avatar: "https://i.pravatar.cc/150?img=19", email: "sam@company.com" },
  { id: "p7", name: "Taylor Brooks", avatar: "https://i.pravatar.cc/150?img=17", email: "taylor@company.com" },
  { id: "p8", name: "Ava Johnson", avatar: "https://i.pravatar.cc/150?img=16", email: "ava@company.com" },
  { id: "p9", name: "Noah Kim", avatar: "https://i.pravatar.cc/150?img=15", email: "noah@company.com" },
  { id: "p10", name: "Ella Martinez", avatar: "https://i.pravatar.cc/150?img=14", email: "ella@company.com" },
  { id: "p11", name: "Omar Hassan", avatar: "https://i.pravatar.cc/150?img=13", email: "omar@company.com" },
  { id: "p12", name: "Grace Wilson", avatar: "https://i.pravatar.cc/150?img=12", email: "grace@company.com" },
];

export type LabelColor = { name: string; value: string };

export const LABEL_COLORS: LabelColor[] = [
  { name: "Purple", value: "#a78bfa" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Cyan", value: "#22d3ee" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#facc15" },
  { name: "Orange", value: "#fb923c" },
  { name: "Red", value: "#f87171" },
  { name: "Pink", value: "#f472b6" },
  { name: "Slate", value: "#94a3b8" },
];


