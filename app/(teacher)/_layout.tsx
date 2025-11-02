import { Slot } from "expo-router";
import { View } from "react-native";

export default function TeacherTabs() {
  return (
    <View className="flex-1 bg-gray-200">
      <Slot />
    </View>
  );
}
