import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";
import { usePrincipal } from "@/context/PrincipalContext";
import { getAttendanceSummary } from "@/services/attendenceServices";
import Header from "@/components/Header";

type ClassSummary = {
  className: string;
  teacherName?: string;
  totalStudents: number;
  present: number;
  absent: number;
  attendance: number;
};

export default function ClassOverview() {
  const { classes, loading: principalLoading } = usePrincipal();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [summaries, setSummaries] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllSummaries = useCallback(async () => {
    try {
      if (!classes || classes.length === 0) return;
      setLoading(true);

      const results = await Promise.all(
        classes.map(async (className) => {
          const summary = await getAttendanceSummary(className, selectedDate);
          return {
            className: summary.className,
            teacherName: "-",
            totalStudents: summary.total,
            present: summary.present,
            absent: summary.absent, // ✅ fixed
            attendance: summary.rate,
          };
        }),
      );
      setSummaries(results);
    } catch (err) {
      console.error("Error fetching class summaries:", err);
    } finally {
      setLoading(false);
    }
  }, [classes, selectedDate]);

  useEffect(() => {
    if (!principalLoading) fetchAllSummaries();
  }, [fetchAllSummaries, principalLoading]);

  const onChangeDate = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header title="Class Overview" />

      <View className="px-4 mt-2">
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="bg-white p-3 rounded-xl flex-row justify-between items-center shadow"
        >
          <Text className="text-lg font-semibold">
            {selectedDate.toDateString()}
          </Text>
          <Feather name="calendar" size={22} color="gray" />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onChangeDate}
          />
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-2 text-gray-500">Loading attendance...</Text>
        </View>
      ) : summaries.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">
            No data available for this date.
          </Text>
        </View>
      ) : (
        <FlatList
          data={summaries}
          keyExtractor={(item) => item.className}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
          renderItem={({ item }) => <ClassCard item={item} />}
          ItemSeparatorComponent={() => <View className="h-2" />}
        />
      )}
    </SafeAreaView>
  );
}

type ClassCardProps = {
  item: ClassSummary;
};

function ClassCard({ item }: ClassCardProps) {
  console.log(item);
  return (
    <View className="p-2">
      <View className="bg-white rounded-xl p-4 shadow-lg">
        <Text className="text-xl font-bold mb-1">{item.className}</Text>
        <Text className="text-gray-700 mb-2">
          Teacher: {item.teacherName || "N/A"}
        </Text>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-gray-600">Total</Text>
            <Text className="text-lg font-semibold">{item.totalStudents}</Text>
          </View>

          <View>
            <Text className="text-gray-600">Present</Text>
            <Text className="text-lg font-semibold text-green-600">
              {item.present}
            </Text>
          </View>

          <View>
            <Text className="text-gray-600">Absent</Text>
            <Text className="text-lg font-semibold text-red-600">
              {item.absent}
            </Text>
          </View>

          <View>
            <Text className="text-gray-600">Rate</Text>
            <Text
              className={`text-lg font-semibold ${
                item.attendance >= 90
                  ? "text-green-600"
                  : item.attendance >= 75
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {item.attendance}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
