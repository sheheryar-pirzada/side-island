declare module "react-native-worklets" {
  /**
   * Reanimated 4 worklet utilities live in `react-native-worklets`.
   * This is a lightweight type shim for library builds; the real implementation
   * is provided by the consumer app's installed dependency.
   */
  export function scheduleOnRN<Args extends unknown[]>(
    fn: (...args: Args) => void,
    ...args: Args
  ): void;
}


