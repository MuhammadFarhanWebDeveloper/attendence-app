import Badge from "@/components/badge";
import { db } from "@/lib/firebase";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteStudent, fetchStudents } from "@/services/studentsServices";
import { useTeacher } from "@/context/TeacherContext";

export default function ManageStudents() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { students, refreshStudents } = useTeacher();

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(q) ||
      student.fathername.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const success = await deleteStudent(id);
      if (success) {
        refreshStudents();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
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
                  className="flex-1 text-lg h-full"
                  placeholder="Search students or classes..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Top actions */}
            <View className="flex-row justify-between px-5 p-3 items-center">
              <Text className="text-xl">
                {filteredStudents.length} Students
              </Text>
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
        renderItem={({ item }) => (
          <StudentCard
            item={item as Student}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

type StudentCardProps = {
  item: Student;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

function StudentCard({ isDeleting, item, onDelete }: StudentCardProps) {
  return (
    <View className="py-3 px-5">
      <View className="p-3 gap-3 bg-white rounded-xl shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl">{item.name}</Text>
          <View className="flex-row gap-2 items-center">
            <Pressable
              className="rounded-xl bg-red-100 p-2"
              disabled={isDeleting}
              onPress={() =>
                Alert.alert(
                  "Delete Student",
                  `Are you sure you want to delete ${item.name}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => onDelete(item.id),
                    },
                  ],
                )
              }
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="red" />
              ) : (
                <Feather name="trash-2" size={24} color="red" />
              )}
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
