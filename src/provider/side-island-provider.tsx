import React, { createContext, useCallback, useMemo, useState } from "react";
import type { SideIslandConfig, SideIslandProviderProps } from "../types/island";

type ProviderValue = {
  expanded: boolean;
  setExpanded: (next: boolean) => void;
  config: SideIslandConfig;
};

export const SideIslandContext = createContext<ProviderValue | null>(null);

export function SideIslandProvider({
  children,
  defaultExpanded = false,
  onExpandedChange,
  config,
  value,
}: SideIslandProviderProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const expanded = value?.expanded ?? internalExpanded;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (value?.setExpanded) {
        value.setExpanded(next);
      } else {
        setInternalExpanded(next);
      }
      onExpandedChange?.(next);
    },
    [onExpandedChange, value]
  );

  const mergedConfig = useMemo(() => {
    return {
      ...(config ?? {}),
      ...(value?.config ?? {}),
    };
  }, [config, value?.config]);

  const ctxValue = useMemo<ProviderValue>(() => {
    return { expanded, setExpanded, config: mergedConfig };
  }, [expanded, mergedConfig, setExpanded]);

  return <SideIslandContext.Provider value={ctxValue}>{children}</SideIslandContext.Provider>;
}


