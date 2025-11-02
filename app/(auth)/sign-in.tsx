import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

type tabT = "Principal" | "Teacher";

export default function SignInScreen() {
  const [activeTab, setActiveTab] = useState<tabT>("Principal");

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
              <Text className="text-xl font-bold">Username</Text>
              <TextInput
                className="border w-full border-gray-400 rounded-lg p-3"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your username"
              />
            </View>
            <View className="w-full gap-2">
              <Text className="text-xl font-bold">Password</Text>
              <TextInput
                className="border w-full border-gray-400 rounded-lg p-3"
                secureTextEntry={true}
                placeholder="Enter your password"
              />
            </View>
          </View>
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
