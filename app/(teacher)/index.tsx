import WelcomeTeacher from "@/components/teacher/WelcomeTeacher";
import Today from "@/components/Today";
import Feather from "@expo/vector-icons/Feather";
import { Link, RelativePathString } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherHome() {
  return (
    <SafeAreaView>
      <ScrollView>
        <View className="gap-4 pb-10">
          <WelcomeTeacher />
          <View className="px-3 gap-3 ">
            <Today color="black" />
            <View className="flex-row gap-3 items-center p-2  my-3 justify-center">
              <View className="flex-1">
                <Card
                  icon={
                    <Feather name="trending-up" size={20} color={"green"} />
                  }
                  icon_bg_color="bg-green-100"
                  title="Present"
                  value="40 Students"
                />
              </View>
              <View className="flex-1">
                <Card
                  icon={<Feather name="users" size={20} color={"red"} />}
                  icon_bg_color="bg-red-100"
                  title="Absent"
                  value="2 Students"
                />
              </View>
            </View>
            <View>
              <Text className="text-xl">Quick Actions</Text>
              <QuickActionBar
                title="Mark Attendence"
                desc="Take today's attendence"
                bg_color="bg-primary"
                text_color="text-white"
                link="./mark-attendence"
                icon={<Feather name="clipboard" size={20} color={"white"} />}
              />
              <QuickActionBar
                title="Manage Students"
                desc="Add/Delete Students"
                bg_color="bg-white"
                link="./manage-students"
                text_color=""
                icon={<Feather name="users" size={20} color={"purple"} />}
              />
              <QuickActionBar
                title="Veiw History"
                desc="Past attendence record"
                bg_color="bg-white"
                link="./view-history"
                text_color=""
                icon={<Feather name="calendar" size={20} color={"purple"} />}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
interface CardProps {
  icon: React.ReactNode;
  icon_bg_color: string;
  title: string;
  value: string;
}
function Card({ icon, icon_bg_color, title, value }: CardProps) {
  return (
    <View className="bg-white flex-row rounded-xl gap-2 p-3">
      <View className={`${icon_bg_color} p-3 rounded-full self-start`}>
        {icon}
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-lg text-gray-400 ">{title}</Text>
        <Text className="text-lg text-black font-semibold">{value}</Text>
      </View>
    </View>
  );
}

interface QuickActionBarProps {
  bg_color: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  link: RelativePathString;
  text_color: string;
}

function QuickActionBar({
  bg_color,
  icon,
  title,
  desc,
  link,
  text_color,
}: QuickActionBarProps) {
  return (
    <View className="my-3">
      <Link className="" href={link}>
        <View
          className={`${bg_color} rounded-xl p-5 gap-4 flex-row items-center w-full`}
        >
          <View className="rounded-full p-3 bg-white/20">{icon}</View>
          <View className="gap-1">
            <Text className={`${text_color} text-xl`}>{title}</Text>
            <Text className={`${text_color} opacity-70`}>{desc}</Text>
          </View>
        </View>
      </Link>
    </View>
  );
}
