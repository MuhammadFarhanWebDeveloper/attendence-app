import React, { createContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);

        if (segments[0] !== "sign-in") {
          router.replace("/sign-in");
        }
        return;
      }

      setUser(currentUser);

      try {
        const [teacherData, principalData] = await Promise.all([
          AsyncStorage.getItem("@teacher_info"),
          AsyncStorage.getItem("@principal_info"),
        ]);

        const currentGroup = segments[0];

        if (teacherData && currentGroup !== "(teacher)") {
          router.replace("/(teacher)");
        } else if (principalData && currentGroup !== "(principal)") {
          router.replace("/(principal)");
        } else if (
          !teacherData &&
          !principalData &&
          currentGroup !== "(auth)"
        ) {
          router.replace("/sign-in");
        }
      } catch (err) {
        console.log("Error reading role from AsyncStorage:", err);
        router.replace("/sign-in");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
