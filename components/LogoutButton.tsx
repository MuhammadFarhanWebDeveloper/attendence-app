import React, { useState } from "react";
import { Pressable, ActivityIndicator, Text, View, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { getAuth, signOut } from "firebase/auth";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const auth = getAuth();

            try {
              await AsyncStorage.clear();

              await signOut(auth);

              Alert.alert(
                "Logged Out",
                "You have been signed out successfully.",
              );

              router.replace("/sign-in");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Something went wrong while logging out.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Pressable
      onPress={handleLogout}
      disabled={loading}
      className="flex-row items-center justify-center bg-red-800 px-4 py-3 rounded-lg"
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View className="flex-row items-center space-x-2 gap-3">
          <Feather name="log-out" size={20} color="#fff" />
          <Text className="text-white font-medium">Logout</Text>
        </View>
      )}
    </Pressable>
  );
}
