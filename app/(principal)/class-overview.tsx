import Header from "@/components/Header";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ClassInfo = {
  className: string;
  teacherName: string;
  totalStudents: number;
  present: number;
  absents: number;
  attendance: number; // percentage
};

const classes: ClassInfo[] = [
  {
    className: "7th B",
    teacherName: "Mr. Ahmed Khan",
    totalStudents: 30,
    present: 28,
    absents: 2,
    attendance: 93.3,
  },
  {
    className: "8th A",
    teacherName: "Ms. Sara Malik",
    totalStudents: 32,
    present: 30,
    absents: 2,
    attendance: 93.8,
  },
  {
    className: "9th C",
    teacherName: "Mr. Bilal Qureshi",
    totalStudents: 28,
    present: 25,
    absents: 3,
    attendance: 89.3,
  },
  {
    className: "10th A",
    teacherName: "Ms. Hina Fatima",
    totalStudents: 35,
    present: 33,
    absents: 2,
    attendance: 94.2,
  },
  {
    className: "6th D",
    teacherName: "Mr. Ali Raza",
    totalStudents: 25,
    present: 24,
    absents: 1,
    attendance: 96,
  },
];
export default function ClassOverview() {
  return (
    <SafeAreaView className="flex-1">
      <Header title="Class Overview" />
      <FlatList
        data={classes}
        keyExtractor={(item) => item.className}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ClassCard item={item} />}
      />
    </SafeAreaView>
  );
}

type ClassCardProps = {
  item: ClassInfo;
};

function ClassCard({ item }: ClassCardProps) {
  return (
    <View className="p-2">
      <View className="bg-white rounded-xl p-4 shadow-lg">
        <Text className="text-xl font-bold mb-1">{item.className}</Text>
        <Text className="text-gray-700 mb-2">Teacher: {item.teacherName}</Text>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-gray-600">Total Students</Text>
            <Text className="text-lg font-semibold">{item.totalStudents}</Text>
          </View>

          <View>
            <Text className="text-gray-600">Present</Text>
            <Text className="text-lg font-semibold">{item.present}</Text>
          </View>

          <View>
            <Text className="text-gray-600">Absents</Text>
            <Text className="text-lg font-semibold">{item.absents}</Text>
          </View>

          <View>
            <Text className="text-gray-600">Attendance</Text>
            <Text className="text-lg font-semibold">{item.attendance}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
