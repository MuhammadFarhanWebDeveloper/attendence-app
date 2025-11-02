import Today from "@/components/Today";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AttendanceStatus = "present" | "absent";

interface Student {
  id: string;
  name: string;
  status: AttendanceStatus;
}

const students7B: Student[] = [
  { id: "7B-01", name: "Ayaan Khan", status: "present" },
  { id: "7B-02", name: "Zara Patel", status: "present" },
  { id: "7B-03", name: "Ishaan Mehta", status: "absent" },
  { id: "7B-04", name: "Riya Sharma", status: "present" },
  { id: "7B-05", name: "Arnav Das", status: "present" },
  { id: "7B-06", name: "Meera Joshi", status: "absent" },
  { id: "7B-07", name: "Kabir Singh", status: "present" },
  { id: "7B-08", name: "Anaya Gupta", status: "present" },
  { id: "7B-09", name: "Vivaan Nair", status: "present" },
  { id: "7B-10", name: "Diya Reddy", status: "absent" },
];

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(students7B);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query.length === 0
      ? students
      : students.filter((s) => s.name.toLowerCase().includes(query));
  }, [searchQuery, students]);

  const toggleAttendance = (id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s,
      ),
    );
  };

  const total = students.length;
  const present = students.filter((s) => s.status === "present").length;
  const absent = total - present;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 gap-5 py-3">
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
            <Text className="opacity-70 text-white px-1">Class 7th B</Text>
          </View>
        </View>

        <View className="flex-row justify-center gap-3 items-center">
          <Card title="Total" value={total} />
          <Card title="Present" value={present} />
          <Card title="Absent" value={absent} />
        </View>

        <Today />

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

      <View className="flex-1 px-5 gap-5 py-3">
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StudentItem item={item} onToggle={toggleAttendance} />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
        />
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
  item: Student;
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
        <Text className="text-gray-500">{item.id}</Text>
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
