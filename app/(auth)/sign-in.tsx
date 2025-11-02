import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type tabT = "Principal" | "Teacher";

export default function SignInScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<tabT>("Principal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Persisted login check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Optionally fetch teacher data if tab is Teacher
        if (activeTab === "Teacher") {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            await AsyncStorage.setItem("@teacher_info", JSON.stringify(data));
          }
        }
        router.replace("/"); // navigate to main screen
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();

        // Store teacher info in AsyncStorage
        if (activeTab === "Teacher") {
          await AsyncStorage.setItem("@teacher_info", JSON.stringify(data));
        }

        // Optionally store principal info if needed
        if (activeTab === "Principal") {
          await AsyncStorage.setItem("@principal_info", JSON.stringify(data));
        }

        // Redirect
        router.replace("/");
      } else {
        Alert.alert("Error", "User data not found in Firestore");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 12,
            paddingVertical: 40,
            justifyContent: "center",
            gap: 20,
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Ionicons name="school" size={70} color="blue" />
          <Text className="text-2xl font-semibold">Welcome Back</Text>
          <Text className="opacity-50 text-xl">Sign in to continue</Text>

          <View className="flex-row gap-2 w-full">
            <Tab
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              title="Principal"
            />
            <Tab
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              title="Teacher"
            />
          </View>

          <View className="w-full gap-4">
            <View className="w-full gap-2">
              <Text className="text-xl font-bold">Email</Text>
              <TextInput
                className="border w-full border-gray-400 rounded-lg p-3"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View className="w-full gap-2">
              <Text className="text-xl font-bold">Password</Text>
              <TextInput
                className="border w-full border-gray-400 rounded-lg p-3"
                secureTextEntry
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <Pressable
            onPress={handleSignIn}
            className="bg-primary py-4 rounded-xl w-full items-center"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Sign In</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

interface TabProps {
  activeTab: tabT;
  title: tabT;
  setActiveTab: (tab: tabT) => void;
}
function Tab({ activeTab, title, setActiveTab }: TabProps) {
  return (
    <Pressable
      onPress={() => setActiveTab(title)}
      className={`border-2 ${
        activeTab === title ? "border-primary bg-primary" : "border-gray-500"
      } py-4 px-3 flex-1 rounded-xl`}
    >
      <Text
        className={`${
          activeTab === title ? "text-white" : "text-gray-500"
        } text-xl font-semibold`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
