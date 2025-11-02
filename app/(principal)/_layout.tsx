import { Redirect, Slot, Tabs } from "expo-router";
import { View, Text } from "react-native";

import "./../globals.css";
export default function PrincipalTabs() {
  return (
    <View className="flex-1 bg-gray-200">
      <Slot />
    </View>
  );
}
