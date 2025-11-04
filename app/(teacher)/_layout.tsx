import { AttendanceProvider } from "@/context/AttendenceContext";
import { AuthContext } from "@/context/AuthContext";
import { TeacherProvider } from "@/context/TeacherContext";
import { Redirect, Slot } from "expo-router";
import { useContext } from "react";
import { View } from "react-native";

export default function Teacher() {
  const { user, loading, role } = useContext(AuthContext);

  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  if (role === "Principal") {
    return <Redirect href={"/(principal)"} />;
  }

  return (
    <TeacherProvider>
      <AttendanceProvider>
        <View className="flex-1 bg-gray-200">
          <Slot />
        </View>
      </AttendanceProvider>
    </TeacherProvider>
  );
}
