import Feather from "@expo/vector-icons/Feather";
import { View, Text } from "react-native";
import Badge from "../badge";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTeacher } from "@/context/TeacherContext";
import { useAttendance } from "@/context/AttendenceContext";

export default function WelcomeTeacher() {
  const { teacherName, assignedClass, studentCount } = useTeacher();
  const { todayRecord, presentCount, attendanceRate, loading } =
    useAttendance();
  const attendanceTaken = todayRecord.length > 0;
  return (
    <View className="bg-primary rounded-b-3xl p-3 py-5">
      <View className="bg-white/10 absolute top-4 right-4 backdrop-blur-sm rounded-full p-3">
        <Feather name="settings" size={24} color="white" />
      </View>
      <Text className="text-white font-semibold text-xl py-1">
        Welcome back,
      </Text>
      <Text className="text-white font-bold text-3xl">{teacherName}</Text>
      <View className="bg-white/10 rounded-xl p-3 my-5 relative">
        <Text className="text-white text-lg">Your assigned class</Text>
        <View className="mb-4">
          {assignedClass && <Badge value={assignedClass} />}
        </View>
        <View className="rounded-full self-start p-3 bg-white/20 absolute top-4 right-4">
          <Feather name="users" size={24} color="white" />
        </View>
        {loading ? (
          <Text className="text-white mt-4">Loading attendance summery...</Text>
        ) : !attendanceTaken ? (
          <Text className="text-white mt-4">
            Attendance has not been taken yet.
          </Text>
        ) : (
          <View className="flex-row justify-between px-3 items-center">
            <View className="gap-3 items-center">
              <Text className="font-semibold text-xl text-white">Total</Text>
              <Text className="text-xl text-white">{studentCount}</Text>
            </View>
            <View className="gap-3 items-center">
              <Text className="font-semibold text-xl text-white">Present</Text>
              <Text className="text-white text-xl">{presentCount}</Text>
            </View>
            <View className="gap-3 items-center">
              <Text className="font-semibold text-xl text-white">Rate</Text>
              <Text className="text-xl text-white">{attendanceRate}%</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
