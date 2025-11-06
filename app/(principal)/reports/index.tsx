import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";

export default function Reports() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={[]} // placeholder
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="bg-primary px-5 p-3 pb-10">
              <View className="flex-row gap-3 items-center py-5">
                <Pressable
                  className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                  onPress={() => router.back()}
                >
                  <Feather name="arrow-left" size={24} color="white" />
                </Pressable>
                <Text className="text-2xl font-bold text-white">
                  Reports Overview
                </Text>
              </View>
            </View>

            <LowAttendanceSection
              onViewDetails={() => router.push("/reports/low-attendance")}
            />
          </>
        }
      />
    </SafeAreaView>
  );
}

function LowAttendanceSection({
  onViewDetails,
}: {
  onViewDetails: () => void;
}) {
  return (
    <View className="px-5 mt-5 mb-10">
      <View className="bg-white p-4 rounded-xl shadow flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-semibold text-red-500">
            Low Attendance
          </Text>
          <Text className="text-gray-600"> students below 75%</Text>
        </View>
        <Pressable
          onPress={onViewDetails}
          className="bg-red-500 px-3 py-1 rounded-lg"
        >
          <Text className="text-white">View</Text>
        </Pressable>
      </View>
    </View>
  );
}
