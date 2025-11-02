import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";

type AttendanceStatus = "present" | "absent";

interface Student {
  id: string;
  name: string;
  status: AttendanceStatus;
  date: string; // YYYY-MM-DD
}

// Example attendance history
const attendanceHistory: Student[] = [
  { id: "7B-01", name: "Ayaan Khan", status: "present", date: "2025-11-01" },
  { id: "7B-02", name: "Zara Patel", status: "absent", date: "2025-11-01" },
  { id: "7B-03", name: "Ishaan Mehta", status: "present", date: "2025-10-31" },
  { id: "7B-04", name: "Riya Sharma", status: "present", date: "2025-10-31" },
  { id: "7B-05", name: "Arnav Das", status: "present", date: "2025-11-01" },
  // add more as needed
];

export default function ViewHistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setFilteredStudents(attendanceHistory.filter((s) => s.date === dateStr));
  }, [selectedDate]);

  const handleChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === "ios"); // keep open on iOS
    if (date) setSelectedDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Attendence History" />
      <View className="px-5 py-3 gap-4">
        {/* Header */}
        {/* Selected Date */}
        <Pressable
          onPress={() => setShowPicker(true)}
          className="bg-white rounded-lg p-3 flex-row justify-between items-center shadow"
        >
          <Text className="text-lg font-semibold">
            {format(selectedDate, "EEEE, MMM d, yyyy")}
          </Text>
          <Feather name="calendar" size={24} color="gray" />
        </Pressable>

        {/* Date Picker */}
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      {/* Attendance List */}
      <FlatList
        className="px-5 mt-3"
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 flex-row justify-between items-center shadow-sm">
            <View>
              <Text
                className={`text-lg font-bold ${item.status === "present" ? "text-green-600" : "text-red-600"}`}
              >
                {item.name}
              </Text>
              <Text className="text-gray-500">{item.id}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Feather
                name={item.status === "present" ? "check" : "x"}
                size={18}
                color={item.status === "present" ? "green" : "red"}
              />
              <Text
                className={`${item.status === "present" ? "text-green-600" : "text-red-600"} font-semibold`}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
