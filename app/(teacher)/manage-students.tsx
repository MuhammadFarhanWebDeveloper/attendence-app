import Badge from "@/components/badge";
import { db } from "@/lib/firebase";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Fetch students from Firestore
async function fetchStudents() {
  try {
    const studentsCol = collection(db, "students");
    const querySnapshot = await getDocs(studentsCol);
    const students: Student[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Student),
    }));
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
  }
}

export default function ManageStudents() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    (async () => {
      // Load cached students first
      const cachedData = await AsyncStorage.getItem("students");
      if (cachedData) setStudents(JSON.parse(cachedData));

      try {
        const studentsData = await fetchStudents();
        if (studentsData) {
          setStudents(studentsData);
          await AsyncStorage.setItem("students", JSON.stringify(studentsData));
        }
      } catch (error) {
        console.error("Failed to fetch students from Firebase:", error);
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={students}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
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
                  Manage Students
                </Text>
              </View>
              {/* Search bar */}
              <View className="bg-white rounded-xl flex-row h-[45px] px-3 gap-2 items-center">
                <Feather name="search" size={24} color="gray" />
                <TextInput
                  className="flex-1 text-xl h-full"
                  placeholder="Search students or classes..."
                />
              </View>
            </View>

            {/* Top actions */}
            <View className="flex-row justify-between px-5 p-3 items-center">
              <Text className="text-xl">{students.length} Students</Text>
              <Pressable
                onPress={() => router.push("/add-student")}
                className="bg-primary flex-row p-2 rounded-xl items-center gap-2"
              >
                <Feather name="plus" size={24} color="white" />
                <Text className="text-white">Add Student</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => <StudentCard item={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

type StudentCardProps = {
  item: Student;
};

function StudentCard({ item }: StudentCardProps) {
  const onDelete = () => {};

  return (
    <View className="py-3 px-5">
      <View className="p-3 gap-3 bg-white rounded-xl shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl">{item.name}</Text>
          <View className="flex-row gap-2 items-center">
            <Pressable className="rounded-xl bg-red-100 p-2">
              <Feather name="trash-2" size={24} color="red" />
            </Pressable>
          </View>
        </View>
        <Text className="text-gray-700">Father: {item.fathername}</Text>
        <Text className="text-gray-700">Phone: {item.phone}</Text>
        <Badge value={item.class} />
      </View>
    </View>
  );
}
