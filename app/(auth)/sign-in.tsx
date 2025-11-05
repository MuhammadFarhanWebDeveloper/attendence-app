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
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.clear();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        Alert.alert("Error", "User data not found in Firestore");
        return;
      }

      const data = userDoc.data();
      if (data.role == "Teacher") {
        await AsyncStorage.setItem("@teacher_info", JSON.stringify(data));
        console.log("user loggedin successfully");
      } else if (data.role == "Principal") {
        await AsyncStorage.setItem("@principal_info", JSON.stringify(data));
      }
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log(`${data.role} logged in successfully!`);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  console.log("Hello guyzzz");
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
