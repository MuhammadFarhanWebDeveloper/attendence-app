import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import Badge from "@/components/badge";
import { getAcademicMonths } from "@/lib/academicSession";
import { getLowAttendanceStudents } from "@/services/attendenceServices";

export default function LowAttendanceStudents() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<
    (Student & {
      attendanceRate: number;
      totalDays: number;
      present: number;
      absent: number;
      leaves: number;
      createdAt: string;
    })[]
  >([]);
  const [filteredStudents, setFilteredStudents] = useState<typeof students>([]);
  const [totalDays, setTotalDays] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);

  const sessionStartYear = 2025;

  const academicMonths = useMemo<AcademicMonth[]>(
    () => getAcademicMonths(sessionStartYear),
    [sessionStartYear],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const month = selectedMonth.getMonth();
        const year = selectedMonth.getFullYear();

        const data = await getLowAttendanceStudents(
          month,
          year,
          selectedClass ?? undefined,
        );

        setStudents(data);
        setClasses(Array.from(new Set(data.map((s) => s.class))));
      } catch (err) {
        console.error("Error fetching low attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedClass]);
  useEffect(() => {
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();

    const filtered = students.filter((s) => {
      const date = new Date(s.createdAt);
      const matchMonth =
        date.getMonth() === month && date.getFullYear() === year;
      const matchClass = selectedClass ? s.class === selectedClass : true;
      return matchMonth && matchClass;
    });

    setFilteredStudents(filtered);
    setTotalDays(filtered[0]?.totalDays || 0);
  }, [selectedMonth, selectedClass, students]);

  const monthLabel = useMemo(() => {
    const m = academicMonths.find(
      (am) =>
        am.month === selectedMonth.getMonth() &&
        am.year === selectedMonth.getFullYear(),
    );
    return m ? `${m.label} ${m.year}` : "";
  }, [selectedMonth, academicMonths]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="blue" />
        <Text className="mt-3 text-gray-600">
          Loading monthly low attendance report...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-100 flex-1">
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="bg-primary px-5 p-3 pb-8">
            {/* Header */}
            <View className="flex-row gap-3 items-center py-5">
              <Pressable
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={24} color="white" />
              </Pressable>
              <Text className="text-2xl font-bold text-white">
                Monthly Low Attendance
              </Text>
            </View>

            {/* Month Selector */}
            <Pressable
              className="bg-white/20 rounded-lg p-3 flex-row justify-between items-center"
              onPress={() => setShowMonthPicker(true)}
            >
              <Text className="text-white text-base font-semibold">
                {monthLabel || "Select Month"}
              </Text>
              <Feather name="calendar" size={22} color="white" />
            </Pressable>

            {/* Month Picker Modal */}
            <Modal visible={showMonthPicker} transparent animationType="slide">
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white p-4 rounded-t-xl">
                  {academicMonths.map((m, idx) => (
                    <Pressable
                      key={idx}
                      className="py-2"
                      onPress={() => {
                        setSelectedMonth(new Date(m.year, m.month, 1));
                        setShowMonthPicker(false);
                      }}
                    >
                      <Text className="text-lg">
                        {m.label} {m.year}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    className="py-2 mt-2"
                    onPress={() => setShowMonthPicker(false)}
                  >
                    <Text className="text-center text-blue-500 font-semibold">
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* Class Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
            >
              <Pressable
                className={`px-4 py-2 rounded-xl ${
                  !selectedClass ? "bg-white" : "bg-gray-500"
                }`}
                onPress={() => setSelectedClass(null)}
              >
                <Text
                  className={`font-medium ${
                    !selectedClass ? "text-black" : "text-white"
                  }`}
                >
                  All Classes
                </Text>
              </Pressable>

              {classes.map((cls) => (
                <Pressable
                  key={cls}
                  className={`px-4 py-2 rounded-xl ${
                    selectedClass === cls ? "bg-white" : "bg-gray-500"
                  }`}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text
                    className={`font-medium ${
                      selectedClass === cls ? "text-black" : "text-white"
                    }`}
                  >
                    {cls}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Summary */}
            <View className="bg-white/20 mt-4 p-3 rounded-xl flex-row justify-between items-center">
              <Text className="text-white text-base font-semibold">
                Total Working Days
              </Text>
              <Text className="text-white text-lg font-bold">
                {totalDays} Days
              </Text>
            </View>

            <Text className="text-white/90 text-lg mt-3">
              Students below 75% in {monthLabel}
            </Text>
          </View>
        }
        renderItem={({ item }) => <StudentCard student={item} />}
        ListEmptyComponent={
          <View className="p-5">
            <Text className="text-center text-gray-500 text-lg">
              No low-attendance students found for this month and class.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function StudentCard({
  student,
}: {
  student: Student & {
    attendanceRate: number;
    totalDays: number;
    present: number;
    absent: number;
    leaves: number;
  };
}) {
  return (
    <View className="p-3">
      <View className="bg-white p-4 mb-4 rounded-xl shadow">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold">{student.name}</Text>
          <Badge value={`${student.attendanceRate}%`} />
        </View>

        <Text className="text-gray-600 mb-1">{student.fathername}</Text>

        <View className="flex-row justify-between items-center mb-3">
          <Badge value={student.class} />
          <Text className="text-gray-500 text-sm">{student.phone}</Text>
        </View>

        <View className="bg-gray-50 rounded-lg p-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700 font-medium">Present:</Text>
            <Text className="text-green-600 font-semibold">
              {student.present}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700 font-medium">Absent:</Text>
            <Text className="text-red-500 font-semibold">{student.absent}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700 font-medium">Leaves:</Text>
            <Text className="text-yellow-600 font-semibold">
              {student.leaves}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
