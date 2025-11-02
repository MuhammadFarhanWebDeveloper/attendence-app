import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  return (
    <View className="bg-primary px-5 py-4 flex-row items-center gap-3">
      <Pressable
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
      >
        <Feather name="arrow-left" size={24} color="white" />
      </Pressable>
      <Text className="text-2xl font-bold text-white">{title}</Text>
    </View>
  );
}
