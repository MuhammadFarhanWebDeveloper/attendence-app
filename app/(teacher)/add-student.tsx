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
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { useTeacher } from "@/context/TeacherContext";

export default function AddStudent() {
  const router = useRouter();
  const { refreshStudents } = useTeacher();
  const [fullName, setFullName] = useState("");
  const [fathername, setFathername] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { assignedClass } = useTeacher();

  const handleAddStudent = async () => {
    setSubmitting(true);
    try {
      if (!fullName || !fathername || !phone) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      let formattedPhone = phone.trim().replace(/\s|-/g, "");

      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+92" + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("3")) {
        formattedPhone = "+92" + formattedPhone;
      } else if (!formattedPhone.startsWith("+92")) {
        Alert.alert(
          "Invalid Number",
          "Phone number must start with 03, 3, or +92.",
        );
        return;
      }

      const pakistaniRegex = /^\+923[0-9]{9}$/;

      if (!pakistaniRegex.test(formattedPhone)) {
        Alert.alert(
          "Invalid Number",
          "Please enter a valid Pakistani phone number.",
        );
        return;
      }

      const newStudentRef = doc(collection(db, "students"));
      const newStudentData = {
        id: newStudentRef.id,
        name: fullName.trim(),
        fathername: fathername.trim(),
        phone: formattedPhone,
        class: assignedClass,
        createdAt: new Date().toISOString(),
      };

      await setDoc(newStudentRef, newStudentData);
      await refreshStudents();

      Alert.alert("Success", "Student added successfully!");
      router.back();
    } catch (error) {
      console.error(error);
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
          <Header title="Add Student" />

          <View className="px-5 mt-6">
            <Text className="text-lg mb-2">Full Name</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-4 text-lg"
              placeholder="Enter full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text className="text-lg mb-2">Father Name</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-4 text-lg"
              placeholder="Enter father name"
              value={fathername}
              onChangeText={setFathername}
            />

            <Text className="text-lg mb-2">Phone</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 mb-6 text-lg"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Pressable
              onPress={handleAddStudent}
              className="bg-primary py-4 rounded-xl items-center"
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Add Student
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
