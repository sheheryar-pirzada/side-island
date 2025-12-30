import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior='automatic'>
      <NativeTabs.Trigger name="index">
        <Icon sf="square.stack.fill" />
        <Label>Island Demo</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="two">
        <Icon sf="key.shield.fill" />
        <Label>Private</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
