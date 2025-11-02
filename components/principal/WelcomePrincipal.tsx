import { View, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
export default function WelcomePrincipal() {
  return (
    <View className="bg-primary rounded-b-3xl p-3 py-5">
      <View className="bg-white/10 absolute top-4 right-4 backdrop-blur-sm rounded-full p-3">
        <Feather name="settings" size={24} color="white" />
      </View>
      <Text className="text-white font-semibold text-xl py-1">
        Welcome back,
      </Text>
      <Text className="text-white font-bold text-3xl">Muhammad Farhan</Text>
      <View className="flex-row items-center justify-center flex-wrap gap-2">
        <Card
          icon={<Feather name="users" size={24} color="blue" />}
          title="Total Students"
          value="900"
        />
        <Card
          icon={<Feather name="user-check" size={24} color="green" />}
          title="Present Today "
          value="300"
        />
        <Card
          icon={<Feather name="user-x" size={24} color="red" />}
          title="Absent Today"
          value="600"
        />
        <Card
          icon={<Feather name="trending-up" size={24} color="yellow" />}
          title="Attendence"
          value="93%"
        />
      </View>
    </View>
  );
}

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function Card({ title, value, icon }: CardProps) {
  return (
    <View className="bg-white/10 backdrop-blur-sm rounded-xl p-3 w-[48%] my-4">
      <View className="flex-row gap-4 items-center">
        {icon}
        <Text className="text-white">{title}</Text>
      </View>
      <Text className="text-white font-semibold text-xl mt-4">{value}</Text>
    </View>
  );
}
