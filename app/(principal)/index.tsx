import QuickActions from "@/components/principal/QuickActions";
import WelcomePrincipal from "@/components/principal/WelcomePrincipal";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <View className="gap-4">
          <WelcomePrincipal />
          <QuickActions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
