import { Redirect, Slot, Tabs } from "expo-router";
import { View, Text } from "react-native";

import "./../globals.css";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { PrincipalProvider } from "@/context/PrincipalContext";
export default function Principal() {
  const { user, loading, role } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }
  if (role === "Teacher") {
    return <Redirect href={"/(teacher)"} />;
  }
  return (
    <PrincipalProvider>
      <View className="flex-1 bg-gray-200">
        <Slot />
      </View>
    </PrincipalProvider>
  );
}
