import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { storage } from "@/src/utils/storage";
import { BEST_KEY, BestRecord } from "@/src/game/storage";

export default function MainMenu() {
  const router = useRouter();
  const [best, setBest] = useState<BestRecord>({ wave: 0, scrap: 0, kills: 0 });
  const [showHow, setShowHow] = useState(false);

  const loadBest = useCallback(async () => {
    const raw = await storage.getItem<string>(BEST_KEY, "");
    if (raw && typeof raw === "string" && raw.length > 0) {
      try {
        const parsed = JSON.parse(raw);
        setBest({
          wave: parsed.wave ?? 0,
          scrap: parsed.scrap ?? 0,
          kills: parsed.kills ?? 0,
        });
      } catch {}
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBest();
    }, [loadBest]),
  );

  return (
    <SafeAreaView style={styles.root} testID="main-menu">
      <BackdropDots />

      <View style={styles.content}>
        <Text style={styles.tag} testID="title-tag">
          [ SOLE SURVIVOR · COLONY OPS ]
        </Text>
        <Text style={styles.title}>LAST</Text>
        <Text style={styles.titleAccent}>SCRAP</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>
          One operator. One RIG. Endless hunger.
        </Text>

        <View style={styles.lore}>
          <Text style={styles.loreTag}>// MISSION BRIEF</Text>
          <Text style={styles.loreText}>
            The RIG is the last fusion reactor on Earth — it transmutes scrap into life. Its
            coolant smells like blood and fermented brain matter. The dead found it. Your team
            became their dinner. Hold the line. Buy time with the bones you collect.
          </Text>
        </View>

        <View style={styles.statRow}>
          <StatTile
            icon={<Ionicons name="trophy" size={14} color="#D35400" />}
            label="BEST WAVE"
            value={best.wave.toString().padStart(2, "0")}
            testID="best-wave"
          />
          <StatTile
            icon={<MaterialCommunityIcons name="nut" size={14} color="#F39C12" />}
            label="TOP SCRAP"
            value={best.scrap.toString()}
            testID="best-scrap"
          />
          <StatTile
            icon={<FontAwesome5 name="skull" size={12} color="#7DBE00" />}
            label="TOP KILLS"
            value={best.kills.toString()}
            testID="best-kills"
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          testID="start-btn"
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => router.push("/game")}
        >
          <Ionicons name="power" size={18} color="#080808" />
          <Text style={styles.startBtnText}>BOOT THE RIG</Text>
        </TouchableOpacity>

        <Pressable
          testID="how-btn"
          style={styles.howBtn}
          onPress={() => setShowHow((v) => !v)}
        >
          <Text style={styles.howText}>
            {showHow ? "HIDE BRIEFING" : "HOW TO PLAY"}
          </Text>
        </Pressable>

        {showHow && (
          <View style={styles.howPanel} testID="how-panel">
            <HowLine k="MOVE" v="with the joystick (bottom-left)." />
            <HowLine k="AUTO-FIRE" v="targets the nearest zombie." />
            <HowLine k="DEFEND" v="the cyan RIG core. If it dies, you die." />
            <HowLine k="COLLECT" v="scrap from kills. Upgrade between waves." />
            <HowLine k="ENEMIES" v="green=walker, light=runner, big=brute." />
          </View>
        )}

        <Text style={styles.footer}>v1.0 · LOCAL BUILD · NO COMMS · NO BACKUP</Text>
      </View>
    </SafeAreaView>
  );
}

function HowLine({ k, v }: { k: string; v: string }) {
  return (
    <Text style={styles.howLine}>
      <Text style={styles.howKey}>· {k}  </Text>
      <Text style={styles.howVal}>{v}</Text>
    </Text>
  );
}

function StatTile({
  icon,
  label,
  value,
  testID,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  testID?: string;
}) {
  return (
    <View style={styles.statTile} testID={testID}>
      <View style={styles.statTopRow}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function BackdropDots() {
  // Sparse dot pattern using deterministic positions
  const dots: { x: string; y: string; o: number }[] = [];
  for (let i = 0; i < 80; i++) {
    const seed = i * 2654435761;
    const x = ((seed >>> 0) % 100) + "%";
    const y = (((seed >>> 8) >>> 0) % 100) + "%";
    const o = 0.04 + (((seed >>> 16) % 10) / 10) * 0.08;
    dots.push({ x, y, o });
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: d.x as any,
            top: d.y as any,
            width: 2,
            height: 2,
            backgroundColor: `rgba(243,156,18,${d.o})`,
          }}
        />
      ))}
      {/* Subtle reactor glow at center */}
      <View
        style={{
          position: "absolute",
          alignSelf: "center",
          top: "20%",
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: "rgba(0,255,255,0.04)",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080808", paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: "center", paddingTop: 24 },
  tag: {
    color: "#D35400",
    fontSize: 10,
    letterSpacing: 4,
    fontFamily: "Courier",
    marginBottom: 8,
  },
  title: {
    color: "#EAEAEA",
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: 6,
    lineHeight: 64,
  },
  titleAccent: {
    color: "#D35400",
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: 6,
    lineHeight: 64,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: "#D35400",
    marginTop: 12,
    marginBottom: 12,
  },
  subtitle: {
    color: "#7A7A7A",
    fontSize: 13,
    letterSpacing: 1,
    fontStyle: "italic",
  },
  lore: {
    marginTop: 24,
    borderLeftWidth: 2,
    borderLeftColor: "#333",
    paddingLeft: 12,
  },
  loreTag: {
    color: "#00FFFF",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Courier",
    marginBottom: 6,
  },
  loreText: {
    color: "#9a9a9a",
    fontSize: 12,
    lineHeight: 18,
  },
  statRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 10,
  },
  statTile: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    padding: 10,
    backgroundColor: "rgba(20,18,16,0.8)",
  },
  statTopRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: {
    color: "#7A7A7A",
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: "Courier",
  },
  statValue: {
    color: "#EAEAEA",
    fontSize: 22,
    fontWeight: "900",
    fontFamily: "Courier",
    marginTop: 4,
  },
  actions: { paddingBottom: 24 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D35400",
    paddingVertical: 16,
    gap: 10,
  },
  startBtnText: {
    color: "#080808",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
  },
  howBtn: {
    alignSelf: "center",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  howText: {
    color: "#9a9a9a",
    fontSize: 11,
    letterSpacing: 2,
  },
  howPanel: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#333",
    padding: 12,
    backgroundColor: "rgba(10,9,8,0.85)",
  },
  howLine: { marginVertical: 2 },
  howKey: {
    color: "#00FFFF",
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: "Courier",
    fontWeight: "700",
  },
  howVal: {
    color: "#9a9a9a",
    fontSize: 11,
    fontFamily: "Courier",
  },
  footer: {
    textAlign: "center",
    color: "#444",
    fontSize: 9,
    letterSpacing: 3,
    fontFamily: "Courier",
    marginTop: 18,
  },
});
