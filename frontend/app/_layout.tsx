import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root}>
        <StatusBar style="light" hidden />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#080808" },
            animation: "fade",
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080808" },
});
