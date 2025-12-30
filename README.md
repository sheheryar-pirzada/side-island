# @peersahab/side-island

A Skia-powered quick access island overlay for React Native, with an internal virtualized list (FlatList) and an optional Provider + hooks control layer.

## Install

```bash
npm i @peersahab/side-island
```

### Peer dependencies (required)

This library expects these to be installed in your app:

```bash
npm i @shopify/react-native-skia react-native-reanimated
```

## Usage (drop-in)

```tsx
import React from "react";
import { View } from "react-native";
import { SideIsland } from "@peersahab/side-island";

export function Example() {
  return (
    <View style={{ flex: 1 }}>
      <SideIsland
        items={Array.from({ length: 40 }).map((_, i) => ({ id: String(i) }))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#00000022" }} />
        )}
      />
    </View>
  );
}
```

## Usage (Provider + hook)

Wrap your app once:

```tsx
import React from "react";
import { SideIslandProvider } from "@peersahab/side-island";

export function AppRoot() {
  return (
    <SideIslandProvider>
      {/* your navigation tree */}
    </SideIslandProvider>
  );
}
```

Control it from anywhere:

```tsx
import React from "react";
import { Button } from "react-native";
import { useSideIsland } from "@peersahab/side-island";

export function ToggleIslandButton() {
  const island = useSideIsland();
  return <Button title={island.expanded ? "Close" : "Open"} onPress={island.toggle} />;
}
```

Render the island (it will use Provider state by default):

```tsx
import React from "react";
import { SideIsland } from "@peersahab/side-island";

export function IslandOverlay() {
  return (
    <SideIsland
      items={[1, 2, 3]}
      renderItem={({ item }) => null}
    />
  );
}
```

## Publishing (repo)

- Build: `npm run build`
- Inspect tarball contents: `npm run pack:inspect`
- Publish (public scoped): `npm publish --access public`


