import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Badge from "@/components/badge";

export default function WeeklyReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceSummary[]>([]);

  useEffect(() => {
    // Simulated async fetch
    setTimeout(() => {
      setAttendanceData([
        {
          className: "Class 9",
          date: "2025-10-28 → 2025-11-03",
          total: 120,
          present: 108,
          absent: 12,
          rate: 90,
        },
        {
          className: "Class 10",
          date: "2025-10-28 → 2025-11-03",
          total: 140,
          present: 124,
          absent: 16,
          rate: 88,
        },
        {
          className: "Class 8",
          date: "2025-10-28 → 2025-11-03",
          total: 100,
          present: 92,
          absent: 8,
          rate: 92,
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="blue" />
        <Text className="mt-3 text-gray-600">Loading Weekly Report...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={attendanceData}
        keyExtractor={(item) => item.className}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="bg-primary px-5 p-3 pb-8">
            <View className="flex-row gap-3 items-center py-5">
              <Pressable
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={24} color="white" />
              </Pressable>
              <Text className="text-2xl font-bold text-white">
                Weekly Attendance
              </Text>
            </View>

            <Text className="text-white/90 text-lg mt-[-5px]">
              Week of 28 Oct – 3 Nov, 2025
            </Text>
          </View>
        }
        renderItem={({ item }) => <ClassCard report={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

function ClassCard({ report }: { report: AttendanceSummary }) {
  const rateColor =
    report.rate >= 90
      ? "text-green-600"
      : report.rate >= 80
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <View className="bg-white p-4 mb-4 rounded-xl shadow">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold">{report.className}</Text>
        <Badge value={`${report.rate}%`} />
      </View>

      <Text className="text-gray-500 mb-2">{report.date}</Text>

      <View className="flex-row justify-between mt-1">
        <Text className="text-gray-700 font-medium">
          Present: {report.present}
        </Text>
        <Text className="text-gray-700 font-medium">
          Absent: {report.absent}
        </Text>
        <Text className="text-gray-700 font-medium">Total: {report.total}</Text>
      </View>
    </View>
  );
}
