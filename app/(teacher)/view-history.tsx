import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { getAttendance } from "@/services/attendenceServices";
import { useTeacher } from "@/context/TeacherContext";

export default function ViewHistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [students, setStudents] = useState<AttendenceStudent[]>([]);
  const [loading, setLoading] = useState(false);

  const { assignedClass } = useTeacher();

  // Fetch attendance when selectedDate or assignedClass changes
  useEffect(() => {
    if (!assignedClass) return;

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const records: AttendanceRecord[] = await getAttendance({
          className: assignedClass,
          specificDay: selectedDate,
        });

        if (records.length > 0) {
          setStudents(records);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate, assignedClass]);

  const handleChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (date) setSelectedDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Attendance History" />

      {/* Date Picker */}
      <View className="px-5 py-3 gap-4">
        <Pressable
          onPress={() => setShowPicker(true)}
          className="bg-white rounded-lg p-3 flex-row justify-between items-center shadow"
        >
          <Text className="text-lg font-semibold">
            {format(selectedDate, "EEEE, MMM d, yyyy")}
          </Text>
          <Feather name="calendar" size={24} color="gray" />
        </Pressable>

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

      {/* Attendance List / Loading / Empty */}
      {loading ? (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#4ade80" />
          <Text className="text-gray-500 mt-2">Loading attendance...</Text>
        </View>
      ) : students.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-400 text-lg">
            No attendance records for this date.
          </Text>
        </View>
      ) : (
        <FlatList
          className="px-5 mt-3"
          data={students}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-xl p-4 flex-row justify-between items-center shadow-sm">
              <View>
                <Text
                  className={`text-lg font-bold ${
                    item.status === "present"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {item.name}
                </Text>
                <Text className="text-gray-400 text-sm">{item.fathername}</Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Feather
                  name={item.status === "present" ? "check" : "x"}
                  size={18}
                  color={item.status === "present" ? "green" : "red"}
                />
                <Text
                  className={`${
                    item.status === "present"
                      ? "text-green-600"
                      : "text-red-600"
                  } font-semibold`}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
