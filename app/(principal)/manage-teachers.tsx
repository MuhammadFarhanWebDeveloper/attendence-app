import Badge from "@/components/badge";
import { db } from "@/lib/firebase";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
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

async function fetchTeachers(): Promise<Teacher[]> {
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("role", "==", "Teacher"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Teacher, "id">;
      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

export default function ManageClasses() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const cachedData = await AsyncStorage.getItem("teachers");
      if (cachedData) setTeachers(JSON.parse(cachedData));

      const teachersData = await fetchTeachers();
      if (teachersData) {
        setTeachers(teachersData);
        await AsyncStorage.setItem("teachers", JSON.stringify(teachersData));
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Teacher",
      "Are you sure you want to delete this teacher?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(id);
              await deleteDoc(doc(db, "users", id));
              await loadTeachers();
            } catch (error) {
              console.error("Failed to delete teacher:", error);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.class.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={filteredTeachers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
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

              {/* Search Bar */}
              <View className="bg-white rounded-xl flex-row h-[45px] px-3 gap-2 items-center">
                <Feather name="search" size={24} color="gray" />
                <TextInput
                  className="flex-1 text-xl h-full"
                  placeholder="Search teachers or classes..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Top actions */}
            <View className="flex-row justify-between px-5 p-3 items-center">
              <Text className="text-xl">
                {filteredTeachers.length} Teachers
              </Text>
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
        renderItem={({ item }) => (
          <TeacherCard
            item={item}
            onDelete={handleDelete}
            isDeleting={deletingId === item.id}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      {loading && (
        <ActivityIndicator
          size="large"
          color="blue"
          style={{ position: "absolute", top: "60%", left: "50%" }}
        />
      )}
    </SafeAreaView>
  );
}

type TeacherCardProps = {
  item: Teacher;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

function TeacherCard({ item, onDelete, isDeleting }: TeacherCardProps) {
  return (
    <View className="py-3 px-5">
      <View className="p-3 gap-3 bg-white rounded-xl shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl">{item.name}</Text>
          <View className="flex-row gap-2 items-center">
            <Pressable
              className="rounded-xl bg-red-100 p-2"
              disabled={isDeleting}
              onPress={() => onDelete(item.id)}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="red" />
              ) : (
                <Feather name="trash-2" size={24} color="red" />
              )}
            </Pressable>
          </View>
        </View>
        <Text className="text-gray-700">{item.phone}</Text>
        <Badge value={item.class} />
      </View>
    </View>
  );
}
