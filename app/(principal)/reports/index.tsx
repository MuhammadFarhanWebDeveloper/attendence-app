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

export default function Reports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState<AttendanceSummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<AttendanceSummary[]>([]);
  const [lowAttendanceCount, setLowAttendanceCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setWeeklySummary([
        {
          className: "Class 9",
          date: "2025-11-03",
          total: 20,
          present: 18,
          absent: 2,
          rate: 90,
        },
        {
          className: "Class 10",
          date: "2025-11-03",
          total: 25,
          present: 22,
          absent: 3,
          rate: 88,
        },
      ]);

      setMonthlySummary([
        {
          className: "Class 9",
          date: "2025-11",
          total: 400,
          present: 360,
          absent: 40,
          rate: 90,
        },
        {
          className: "Class 10",
          date: "2025-11",
          total: 500,
          present: 450,
          absent: 50,
          rate: 90,
        },
      ]);

      setLowAttendanceCount(18);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="blue" />
        <Text className="mt-3 text-gray-600">Loading Reports...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={[]}
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

            {/* Weekly Summary */}
            <ReportSection
              title="📅 Weekly Attendance"
              subtitle="Summary of this week's attendance"
              data={weeklySummary}
              onViewDetails={() => router.push("/reports/weekly")}
            />

            <ReportSection
              title="📊 Monthly Attendance"
              subtitle="Class-wise monthly report"
              data={monthlySummary}
              onViewDetails={() => router.push("/reports/monthly")}
            />

            {/* Low Attendance */}
            <LowAttendanceSection
              count={lowAttendanceCount}
              onViewDetails={() => router.push("/reports/low-attendance")}
            />
          </>
        }
      />
    </SafeAreaView>
  );
}

function ReportSection({
  title,
  subtitle,
  data,
  onViewDetails,
}: {
  title: string;
  subtitle: string;
  data: AttendanceSummary[];
  onViewDetails: () => void;
}) {
  return (
    <View className="px-5 mt-[25px]">
      <View className="bg-white p-4 rounded-xl shadow">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-xl font-semibold">{title}</Text>
            <Text className="text-gray-600">{subtitle}</Text>
          </View>
          <Pressable
            onPress={onViewDetails}
            className="bg-primary px-3 py-1 rounded-lg"
          >
            <Text className="text-white">View</Text>
          </Pressable>
        </View>

        {data.map((report) => (
          <View
            key={report.className}
            className="flex-row justify-between items-center border-b border-gray-200 py-2"
          >
            <View>
              <Text className="font-semibold">{report.className}</Text>
              <Text className="text-gray-500 text-sm">{report.date}</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-800 font-semibold">
                {report.rate}%
              </Text>
              <Text className="text-gray-500 text-sm">
                P:{report.present} / A:{report.absent}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function LowAttendanceSection({
  count,
  onViewDetails,
}: {
  count: number;
  onViewDetails: () => void;
}) {
  return (
    <View className="px-5 mt-5 mb-10">
      <View className="bg-white p-4 rounded-xl shadow flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-semibold text-red-500">
            ⚠️ Low Attendance
          </Text>
          <Text className="text-gray-600">{count} students below 75%</Text>
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
