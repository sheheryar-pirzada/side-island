import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior='automatic'>
      <NativeTabs.Trigger name="index">
        <Icon sf="square.stack.fill" />
        <Label>Island Demo</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="two">
        <Icon sf="heart.fill" />
          <Label>BMI Calculator</Label>
        </NativeTabs.Trigger>
      <NativeTabs.Trigger name="three">
        <Icon sf="rectangle.grid.3x1.fill" />
        <Label>Kanban Board</Label>
      </NativeTabs.Trigger>
      </NativeTabs>
  );
}
