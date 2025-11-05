import Feather from "@expo/vector-icons/Feather";
import { Link, RelativePathString } from "expo-router";
import { View, Text } from "react-native";

export default function QuickActions() {
  return (
    <View className="p-2">
      <Text className="font-semibold text-xl">QuickActions</Text>
      <View className="flex-row gap-4 items-center justify-center my-4 flex-wrap">
        <Card
          link="./(principal)/manage-teachers"
          icon_bg_color="bg-blue-50"
          title="Manage Teachers"
          icon={<Feather name="users" size={20} color="blue" />}
        />
        <Card
          link="./(principal)/class-overview"
          icon_bg_color="bg-green-50"
          title="Class Overview"
          icon={<Feather name="bar-chart-2" size={20} color="green" />}
        />
        <Card
          link="./(principal)/absent-students"
          icon_bg_color="bg-red-50"
          title="Absent Students"
          icon={<Feather name="clipboard" size={20} color="red" />}
        />
        <Card
          link="./(principal)/reports"
          icon_bg_color="bg-purple-50"
          title="Reports"
          icon={<Feather name="file-text" size={20} color="purple" />}
        />
      </View>
    </View>
  );
}
interface CardProps {
  title: string;
  icon: React.ReactNode;
  icon_bg_color: string;
  link: RelativePathString;
}

const Card = ({ link, title, icon, icon_bg_color }: CardProps) => {
  return (
    <Link className="w-[45%]" href={link}>
      <View className="gap-4 w-[100%]  justify-center items-center bg-white shadow-md p-6 rounded-xl">
        <View className={`${icon_bg_color} rounded-full p-4`}>{icon}</View>
        <Text>{title}</Text>
      </View>
    </Link>
  );
};
