import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import Header from "@/components/Header";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AddTeacher() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleAddTeacher = async () => {
    setSubmitting(true);
    try {
      if (!fullName || !phone || !className) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        Alert.alert("Error", "Please enter a valid 10-digit phone number");
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role: "Teacher", // 'teacher' or 'principal'
        name: fullName,
        phone,
        class: className,
        createdAt: new Date(),
      });
      Alert.alert("Success", "Teacher added successfully!");
      router.back(); // Go back to Manage Teachers screen
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSubmitting(false);
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
            gap: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Header title="Add Teacher" />

          {/* Form */}
          <View className="px-5 mt-6">
            {/* Full Name */}

            <Text className="text-lg mb-2">Email</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-4 text-lg"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCorrect={false}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Text className="text-lg mb-2">Password</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-4 text-lg"
              placeholder="Enter your email"
              value={password}
              secureTextEntry={true}
              onChangeText={setPassword}
            />
            <Text className="text-lg mb-2">Full Name</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-4 text-lg"
              placeholder="Enter full name"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Phone */}
            <Text className="text-lg mb-2">Phone</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-4 text-lg"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Class */}
            <Text className="text-lg mb-2">Class</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-6 text-lg"
              placeholder="Enter class (e.g., 7th B)"
              value={className}
              onChangeText={setClassName}
            />

            {/* Submit Button */}
            <Pressable
              onPress={handleAddTeacher}
              className="bg-primary py-4 rounded-xl items-center"
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Add Teacher
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
