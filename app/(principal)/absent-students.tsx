import Badge from "@/components/badge";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Today from "@/components/Today";

type Student = {
  name: string;
  className: string;
  phone: string;
};

const absentStudents: Student[] = [
  { name: "Ali Raza", className: "7th B", phone: "+92 300 1234567" },
  { name: "Sara Malik", className: "8th A", phone: "+92 333 7654321" },
  { name: "Bilal Qureshi", className: "9th C", phone: "+92 301 9988776" },
  { name: "Hina Fatima", className: "10th A", phone: "+92 321 5544332" },
  { name: "Nida Shah", className: "5th A", phone: "+92 344 6677889" },
  { name: "Kamran Iqbal", className: "8th B", phone: "+92 300 4455667" },
];

export default function AbsentStudents() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [filteredStudents, setFilteredStudents] =
    useState<Student[]>(absentStudents);

  const classes = Array.from(new Set(absentStudents.map((s) => s.className)));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilteredStudents(
        absentStudents.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedClass ? s.className === selectedClass : true),
        ),
      );
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedClass]);
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.phone}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="bg-primary px-5 py-3 pb-10">
              <View className="flex-row gap-3 items-center py-5">
                <Pressable
                  className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                  onPress={() => router.back()}
                >
                  <Feather name="arrow-left" size={24} color="white" />
                </Pressable>
                <Text className="text-2xl font-bold text-white">
                  Absent Students
                </Text>
              </View>

              {/* Search bar */}
              <View className="bg-white rounded-xl flex-row h-[45px] px-3 gap-2 items-center">
                <Feather name="search" size={24} color="gray" />
                <TextInput
                  className="flex-1 text-xl h-full"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Date */}
              <Today />
              {/* Class filter buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-4"
                contentContainerStyle={{ gap: 10, paddingHorizontal: 3 }}
              >
                <Pressable
                  className={`px-4 py-2 rounded-xl ${
                    !selectedClass ? "bg-white" : "bg-white/30"
                  }`}
                  onPress={() => setSelectedClass(null)}
                >
                  <Text className={`text-black font-medium`}>All Classes</Text>
                </Pressable>

                {classes.map((cls) => (
                  <Pressable
                    key={cls}
                    className={`px-4 py-2 rounded-xl ${
                      selectedClass === cls ? "bg-white" : "bg-white/30"
                    }`}
                    onPress={() => setSelectedClass(cls)}
                  >
                    <Text className="text-black font-medium">{cls}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Absent count */}
            <View className="px-3 py-3">
              <Text className="text-lg font-semibold">
                {filteredStudents.length} Students Absent Today
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Card
            name={item.name}
            className={item.className}
            phone={item.phone}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </SafeAreaView>
  );
}

type CardProps = {
  name: string;
  className: string;
  phone: string;
};

function Card({ name, className, phone }: CardProps) {
  return (
    <View className="px-5">
      <View className="rounded-xl bg-white p-3 shadow-lg">
        <Text className="text-lg font-semibold">{name}</Text>
        <Badge value={className} />
        <Text className="text-gray-700 mt-1">{phone}</Text>
      </View>
    </View>
  );
}
