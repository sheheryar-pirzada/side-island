import { useCallback, useContext, useMemo } from "react";
import type { SideIslandController } from "../types/island";
import { SideIslandContext } from "../provider/side-island-provider";

export function useSideIsland(): SideIslandController {
  const ctx = useContext(SideIslandContext);
  if (!ctx) {
    throw new Error("useSideIsland must be used within a SideIslandProvider");
  }

  const open = useCallback(() => ctx.setExpanded(true), [ctx]);
  const close = useCallback(() => ctx.setExpanded(false), [ctx]);
  const toggle = useCallback(() => ctx.setExpanded(!ctx.expanded), [ctx]);

  return useMemo(
    () => ({
      expanded: ctx.expanded,
      setExpanded: ctx.setExpanded,
      open,
      close,
      toggle,
      config: ctx.config,
    }),
    [close, ctx.config, ctx.expanded, ctx.setExpanded, open, toggle]
  );
}


