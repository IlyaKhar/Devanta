import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, View, Pressable } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", padding: 16 }}>
      <StatusBar style="dark" />
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 12 }}>Devanta</Text>
      <Text style={{ fontSize: 16, marginBottom: 16 }}>Продолжай обучение вместе с Максом.</Text>
      <View style={{ gap: 12 }}>
        <Pressable style={{ backgroundColor: "#2563EB", padding: 14, borderRadius: 12 }}>
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Продолжить</Text>
        </Pressable>
        <Pressable style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12 }}>
          <Text style={{ textAlign: "center" }}>Лидерборд</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
