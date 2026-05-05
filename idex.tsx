import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: "https://i.imgur.com/gxZqVl0.jpeg" }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>GERAÇÃO</Text>
        <Text style={styles.subtitle}>SÔNICA</Text>
        <Text style={styles.tagline}>O som que conecta gerações</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/tiktok")}>
          <Text style={styles.buttonText}>🎬 Videoclipes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/instagram")}>
          <Text style={styles.buttonText}>📸 Feed Musical</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/radio")}>
          <Text style={styles.buttonText}>🎧 Rádio / Podcast</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.liveButton]} onPress={() => router.push("/ao-vivo")}>
          <Text style={styles.buttonText}>🔴 AO VIVO</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 48, fontWeight: "bold", color: "#fff", letterSpacing: 4 },
  subtitle: { fontSize: 32, color: "#ff3366", marginBottom: 8 },
  tagline: { fontSize: 16, color: "#ccc", marginBottom: 40 },
  button: { backgroundColor: "#ff3366", paddingVertical: 14, paddingHorizontal: 30, borderRadius: 40, marginVertical: 8, width: "80%", alignItems: "center" },
  liveButton: { backgroundColor: "#cc0000" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" }
}); 