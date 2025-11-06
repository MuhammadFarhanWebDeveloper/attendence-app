import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import Badge from "@/components/badge";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const AbsentHeader = React.memo(
  ({
    router,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setShowDatePicker,
    showDatePicker,
    onChangeDate,
    classes,
    selectedClass,
    setSelectedClass,
    absentCount,
  }: {
    router: ReturnType<typeof useRouter>;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    selectedDate: Date;
    setShowDatePicker: (v: boolean) => void;
    showDatePicker: boolean;
    onChangeDate: (event: any, date?: Date) => void;
    classes: string[];
    selectedClass: string | null;
    setSelectedClass: (v: string | null) => void;
    absentCount: number;
  }) => {
    return (
      <View className="bg-primary px-5 py-3 pb-10">
        <View className="flex-row gap-3 items-center py-5">
          <Pressable
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white">Absent Students</Text>
        </View>

        <View className="bg-white rounded-xl flex-row h-[45px] px-3 gap-2 items-center">
          <Feather name="search" size={24} color="gray" />
          <TextInput
            className="flex-1 text-xl h-full"
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View className="mt-3">
          <Pressable
            className="bg-white rounded-lg p-3 flex-row justify-between items-center shadow"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-lg font-semibold">
              {selectedDate.toDateString()}
            </Text>
            <Feather name="calendar" size={24} color="gray" />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 10, paddingHorizontal: 3 }}
        >
          <Pressable
            className={`px-4 py-2 rounded-xl ${
              !selectedClass ? "bg-white" : "bg-gray-500"
            }`}
            onPress={() => setSelectedClass(null)}
          >
            <Text className={!selectedClass ? "text-black" : "text-white"}>
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
                className={selectedClass === cls ? "text-black" : "text-white"}
              >
                {cls}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="px-3 py-3">
          <Text className="text-lg font-semibold text-white">
            {absentCount} Students Absent
          </Text>
        </View>
      </View>
    );
  },
);

export default function AbsentStudents() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [absentStudents, setAbsentStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAbsentStudents = useCallback(() => {
    setLoading(true);

    const ref = collection(db, "attendance");
    let q = query(ref);

    if (selectedClass) {
      q = query(q, where("class", "==", selectedClass));
    }
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      q = query(q, where("date", "==", dateString));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      const absent: Student[] = snap.docs
        .map((doc) => doc.data() as AttendanceRecord)
        .filter((record) => record.status === "absent")
        .map((record) => ({
          id: record.studentId,
          name: record.name,
          fathername: record.fathername,
          class: record.class,
          phone: record.phone,
          createdAt: record.createdAt,
        }));

      setAbsentStudents(absent);
      setClasses(Array.from(new Set(absent.map((s) => s.class))));
      setLoading(false);
    });

    return unsubscribe;
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    const unsub = fetchAbsentStudents();
    return () => unsub();
  }, [fetchAbsentStudents]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilteredStudents(
        absentStudents.filter(
          (s) =>
            (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.fathername.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (selectedClass ? s.class === selectedClass : true),
        ),
      );
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery, selectedClass, absentStudents]);

  const onChangeDate = useCallback((_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setSelectedDate(date);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={loading ? [] : filteredStudents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <AbsentHeader
            router={router}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDate={selectedDate}
            setShowDatePicker={setShowDatePicker}
            showDatePicker={showDatePicker}
            onChangeDate={onChangeDate}
            classes={classes}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            absentCount={filteredStudents.length}
          />
        }
        renderItem={({ item }) => (
          <Card
            id={item.id}
            createdAt={item.createdAt}
            name={item.name}
            fathername={item.fathername}
            class={item.class}
            phone={item.phone}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          loading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" />
              <Text className="mt-2">Loading absent students...</Text>
            </View>
          ) : (
            <Text className="text-center text-gray-500 mt-6">
              No absent students found for this date.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

function Card({ name, fathername, class: className, phone }: Student) {
  return (
    <View className="px-5 py-2">
      <View className="rounded-xl bg-white p-3 shadow-lg">
        <Text className="text-lg font-semibold">{name}</Text>
        <Text className="text-gray-500">{fathername}</Text>
        <Badge value={className} />
        <Text className="text-gray-700 mt-1">{phone}</Text>
      </View>
    </View>
  );
}
