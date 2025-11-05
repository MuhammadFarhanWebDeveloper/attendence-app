import Today from "@/components/Today";
import { useAttendance } from "@/context/AttendenceContext";
import { useTeacher } from "@/context/TeacherContext";
import {
  getAttendance,
  getAttendanceSummary,
  markAttendance,
  submitAttendance,
} from "@/services/attendenceServices";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const {
    students: initialStudents,
    studentCount: total,
    assignedClass,
  } = useTeacher();

  const { refreshAttendance } = useAttendance();

  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [checkingIfAttendanceTaken, setCheckingIfAttendanceTaken] =
    useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState<AttendenceStudent[]>(
    initialStudents.map((s) => ({
      ...s,
      status: "present",
      date: new Date().toISOString().split("T")[0],
    })),
  );
  const handleSubmitAttendance = async () => {
    try {
      if (students.length === 0) {
        alert("No students to submit!");
        return;
      }

      setSubmitting(true);
      await markAttendance(assignedClass!, students);
      await refreshAttendance();
      alert("Attendance submitted successfully!");

      router.replace("/");

      setStudents((prev) => prev.map((s) => ({ ...s, status: "present" })));
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit attendance: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (!assignedClass) return;
      try {
        const todayDate = new Date();
        const summary = await getAttendanceSummary(assignedClass, todayDate);
        setAttendanceTaken(summary.total > 0);
      } catch (err) {
        console.error("Failed to check today's attendance:", err);
      } finally {
        setCheckingIfAttendanceTaken(false);
      }
    };
    checkTodayAttendance();
  }, [assignedClass]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query.length === 0
      ? students
      : students.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.fathername.toLowerCase().includes(query),
        );
  }, [searchQuery, students]);

  const { present, absent } = useMemo(() => {
    const presentCount = students.filter((s) => s.status === "present").length;
    return { present: presentCount, absent: total - presentCount };
  }, [students, total]);

  const toggleAttendance = (id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s,
      ),
    );
  };
  const currentHour = new Date().getHours();
  const attendanceEnabled = currentHour >= 7 && currentHour < 23;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 gap-5 py-3">
        {/* Header */}
        <View className="flex-row gap-3 items-center py-5">
          <Pressable
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-white">
              Mark Attendance
            </Text>
            <Text className="opacity-70 text-white px-1">
              Class: {assignedClass}
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View className="flex-row justify-center gap-3 items-center">
          <Card title="Total" value={total} />
          <Card title="Present" value={present} />
          <Card title="Absent" value={absent} />
        </View>

        <Today />

        {/* Search */}
        <View className="bg-white rounded-xl flex-row h-[45px] px-3 gap-2 items-center">
          <Feather name="search" size={22} color="gray" />
          <TextInput
            className="flex-1 text-lg h-full"
            placeholder="Search students..."
            placeholderTextColor="#9ca3af"
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>
      </View>

      {/* Student List */}
      <View className="flex-1 px-5 gap-5 py-3">
        {!attendanceEnabled ? (
          <Text className="text-red-800 font-semibold text-center mt-4">
            Attendance can only be marked between 7 AM and 2 PM
          </Text>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StudentItem item={item} onToggle={toggleAttendance} />
            )}
            ItemSeparatorComponent={() => <View className="h-3" />}
          />
        )}
      </View>

      {/* Submit Button */}
      <View className="px-5 py-3">
        <Pressable
          disabled={
            !attendanceEnabled ||
            checkingIfAttendanceTaken ||
            submitting ||
            attendanceTaken
          }
          onPress={handleSubmitAttendance}
          className={`rounded-2xl p-3 items-center justify-center ${
            !checkingIfAttendanceTaken &&
            attendanceEnabled &&
            !submitting &&
            !attendanceTaken
              ? "bg-primary"
              : "bg-gray-400"
          }`}
        >
          {submitting || checkingIfAttendanceTaken ? (
            <ActivityIndicator color="#fff" />
          ) : attendanceTaken ? (
            <Text className="text-lg font-semibold text-white">
              Attendance already submitted today
            </Text>
          ) : (
            <Text className="text-lg font-semibold text-white">
              Submit Attendance({present} Present, {absent} Absent)
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <View className="bg-white/20 gap-2 py-3 px-5 rounded-xl items-center justify-center flex-1">
      <Text className="text-lg text-white font-semibold text-center">
        {title}
      </Text>
      <Text className="text-lg text-white text-center">{value}</Text>
    </View>
  );
}

function StudentItem({
  item,
  onToggle,
}: {
  item: AttendenceStudent;
  onToggle: (id: string) => void;
}) {
  const isPresent = item.status === "present";

  return (
    <View className="bg-white rounded-xl p-4 flex-row justify-between items-center shadow-sm">
      <View>
        <Text
          className="text-lg font-bold"
          style={{ color: isPresent ? "green" : "red" }}
        >
          {item.name}
        </Text>
        <Text className="text-gray-500">{item.fathername}</Text>
      </View>

      <View className="flex-row gap-3 justify-center items-center">
        <View
          className="rounded-full p-1"
          style={{
            borderWidth: 1,
            borderColor: isPresent ? "green" : "red",
          }}
        >
          <Feather
            name={isPresent ? "check" : "x"}
            size={15}
            color={isPresent ? "green" : "red"}
          />
        </View>
        <Switch
          onValueChange={() => onToggle(item.id)}
          value={isPresent}
          thumbColor="#f4f4f5"
          trackColor={{ false: "#d1d5db", true: "green" }}
        />
      </View>
    </View>
  );
}
