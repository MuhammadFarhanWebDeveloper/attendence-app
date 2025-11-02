import Badge from "@/components/badge";
import { db } from "@/lib/firebase";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Teacher = {
  id?: string;
  class: string;
  createdAt: string;
  email: string;
  name: string;
  phone: string;
  role: "Teacher";
};

async function fetchTeachers() {
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("role", "==", "Teacher"));
    const querySnapshot = await getDocs(q);
    const teachers: Teacher[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Teacher),
    }));
    return teachers;
  } catch (error) {
    console.error("Error fetching teachers:", error);
  }
}

export default function ManageClasses() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    (async () => {
      const cachedData = await AsyncStorage.getItem("teachers");
      if (cachedData) {
        setTeachers(JSON.parse(cachedData));
      }

      try {
        const teachersData = await fetchTeachers();
        if (teachersData) {
          setTeachers(teachersData);
          await AsyncStorage.setItem("teachers", JSON.stringify(teachersData));
        }
      } catch (error) {
        console.error("Failed to fetch teachers from Firebase:", error);
      }
    })();
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={teachers}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {}
            <View className="bg-primary px-5 p-3 pb-10">
              <View className="flex-row gap-3 items-center py-5">
                <Pressable
                  className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                  onPress={() => router.back()}
                >
                  <Feather name="arrow-left" size={24} color="white" />
                </Pressable>
                <Text className="text-2xl font-bold text-white">
                  Manage Teachers
                </Text>
              </View>
              {}
              <View className="bg-white rounded-xl flex-row h-[45px] px-3 gap-2 items-center">
                <Feather name="search" size={24} color="gray" />
                <TextInput
                  className="flex-1 text-xl h-full"
                  placeholder="Search teachers or classes..."
                />
              </View>
            </View>

            <View className="flex-row justify-between px-5 p-3 items-center">
              <Text className="text-xl">{teachers.length} Teachers</Text>
              <Pressable
                onPress={() => router.push("/add-teacher")}
                className="bg-primary flex-row p-2 rounded-xl items-center gap-2"
              >
                <Feather name="plus" size={24} color="white" />
                <Text className="text-white">Add Teacher</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => <TeacherCard item={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

type TeacherCardProps = {
  item: Teacher;
};

function TeacherCard({ item }: TeacherCardProps) {
  const onDelete = () => {};

  return (
    <View className="py-3 px-5">
      <View className="p-3 gap-3 bg-white rounded-xl shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl">{item.name}</Text>
          <View className="flex-row gap-2 items-center">
            <View className="rounded-xl bg-blue-100 p-2">
              <Feather name="edit" size={24} color="blue" />
            </View>
            <Pressable className="rounded-xl bg-red-100 p-2">
              <Feather name="trash-2" size={24} color="red" />
            </Pressable>
          </View>
        </View>
        <Text className="text-gray-700">{item.phone}</Text>
        <Badge value={item.class} />
      </View>
    </View>
  );
}
