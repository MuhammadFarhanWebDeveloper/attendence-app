import Feather from "@expo/vector-icons/Feather";
import { View, Text } from "react-native";

interface TodayProps {
  color?: string;
}

export default function Today({ color = "white" }: TodayProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <View className="flex-row gap-3 items-center mt-5">
      <Feather name="calendar" size={20} color={color} />
      <Text style={{ color }} className=" font-medium">
        Today - {formattedDate}
      </Text>
    </View>
  );
}
