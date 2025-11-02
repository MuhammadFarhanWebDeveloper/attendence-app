import { View, Text } from "react-native";

interface BadgeProps {
  value: string;
}
export default function Badge({ value }: BadgeProps) {
  return (
    <View className="rounded-full bg-blue-400 self-start px-3 py-1 mt-2">
      <Text className="text-white font-semibold">{value}</Text>
    </View>
  );
}
