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
  { id: "p13", name: "Lucas Brown", avatar: "https://i.pravatar.cc/150?img=11", email: "lucas@company.com" },
  { id: "p14", name: "Zoe Anderson", avatar: "https://i.pravatar.cc/150?img=10", email: "zoe@company.com" },
  { id: "p15", name: "Ryan Thompson", avatar: "https://i.pravatar.cc/150?img=9", email: "ryan@company.com" },
  { id: "p16", name: "Maya Singh", avatar: "https://i.pravatar.cc/150?img=8", email: "maya@company.com" },
  { id: "p17", name: "David Park", avatar: "https://i.pravatar.cc/150?img=7", email: "david@company.com" },
  { id: "p18", name: "Sophia Garcia", avatar: "https://i.pravatar.cc/150?img=6", email: "sophia@company.com" },
  { id: "p19", name: "James White", avatar: "https://i.pravatar.cc/150?img=5", email: "james@company.com" },
  { id: "p20", name: "Isabella Davis", avatar: "https://i.pravatar.cc/150?img=4", email: "isabella@company.com" },
  { id: "p21", name: "Michael Zhang", avatar: "https://i.pravatar.cc/150?img=3", email: "michael@company.com" },
  { id: "p22", name: "Emma Taylor", avatar: "https://i.pravatar.cc/150?img=2", email: "emma@company.com" },
  { id: "p23", name: "Daniel Moore", avatar: "https://i.pravatar.cc/150?img=1", email: "daniel@company.com" },
  { id: "p24", name: "Olivia Jackson", avatar: "https://i.pravatar.cc/150?img=20", email: "olivia@company.com" },
  { id: "p25", name: "William Harris", avatar: "https://i.pravatar.cc/150?img=21", email: "william@company.com" },
  { id: "p26", name: "Charlotte Lewis", avatar: "https://i.pravatar.cc/150?img=23", email: "charlotte@company.com" },
  { id: "p27", name: "Benjamin Walker", avatar: "https://i.pravatar.cc/150?img=24", email: "benjamin@company.com" },
  { id: "p28", name: "Amelia Hall", avatar: "https://i.pravatar.cc/150?img=25", email: "amelia@company.com" },
  { id: "p29", name: "Henry Allen", avatar: "https://i.pravatar.cc/150?img=26", email: "henry@company.com" },
  { id: "p30", name: "Lily Young", avatar: "https://i.pravatar.cc/150?img=27", email: "lily@company.com" },
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


