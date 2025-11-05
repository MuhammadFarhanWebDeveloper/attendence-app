import React, { createContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";

type Role = "Teacher" | "Principal" | null;

type AuthContextType = {
  user: User | null;
  role: Role;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segment = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const uid = currentUser.uid;
        const usersDoc = await getDoc(doc(db, "users", uid));

        if (!usersDoc.exists()) {
          await auth.signOut();
          return;
        }

        const data = usersDoc.data();
        const userRole = (data.role as Role) || null;
        setRole(userRole);

        if (userRole) {
          await AsyncStorage.setItem("@user_role", userRole);
        }

        console.log("Detected role:", userRole);

        if (userRole === "Teacher" && !segment[0]?.startsWith("(teacher)")) {
          router.replace("/(teacher)");
        } else if (
          userRole === "Principal" &&
          !segment[0]?.startsWith("(principal)")
        ) {
          router.replace("/(principal)");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
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
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
