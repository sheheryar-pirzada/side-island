import React from "react";
import { SymbolView } from "expo-symbols";

import type { Role } from "../../lib/shareDemoData";
import { ROLE_ICONS } from "../../lib/shareDemoData";

export function RoleIcon({
  role,
  color = "#a78bfa",
  size = 12,
}: {
  role: Role;
  color?: string;
  size?: number;
}) {
  return <SymbolView name={ROLE_ICONS[role] as any} size={size} tintColor={color} />;
}


