import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GameState } from "../game/engine";

export function PauseOverlay({
  onResume,
  onAbort,
}: {
  onResume: () => void;
  onAbort: () => void;
}) {
  return (
    <View style={styles.overlay} testID="pause-overlay">
      <View style={styles.panel}>
        <Text style={styles.tag}>[ SYSTEM ]</Text>
        <Text style={styles.title}>PAUSED</Text>
        <Text style={styles.sub}>Reactor cooling. Take a breath, operator.</Text>

        <TouchableOpacity
          testID="resume-btn"
          style={[styles.btn, styles.btnPrimary]}
          onPress={onResume}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={16} color="#080808" />
          <Text style={styles.btnPrimaryText}>RESUME</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="abort-btn"
          style={[styles.btn, styles.btnGhost]}
          onPress={onAbort}
          activeOpacity={0.7}
        >
          <Ionicons name="close-sharp" size={16} color="#FF2A2A" />
          <Text style={styles.btnGhostText}>ABORT MISSION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function GameOverOverlay({
  state,
  best,
  onRestart,
  onMenu,
}: {
  state: GameState;
  best: { wave: number; scrap: number; kills: number };
  onRestart: () => void;
  onMenu: () => void;
}) {
  const reason = state.player.hp <= 0 ? "OPERATOR DOWN" : "RIG OFFLINE";
  return (
    <View style={[styles.overlay, styles.gameOverTint]} testID="gameover-overlay">
      <View style={styles.panel}>
        <Text style={[styles.tag, { color: "#FF2A2A" }]}>[ FATAL ]</Text>
        <Text style={[styles.title, { color: "#FF2A2A" }]}>{reason}</Text>
        <Text style={styles.sub}>The last scrap was not enough.</Text>

        <View style={styles.statBlock}>
          <Stat label="WAVES SURVIVED" value={state.stats.wavesCleared} best={best.wave} />
          <Stat label="ZOMBIES TERMINATED" value={state.stats.kills} best={best.kills} />
          <Stat label="SCRAP RECOVERED" value={state.stats.totalScrap} best={best.scrap} icon />
        </View>

        <TouchableOpacity
          testID="restart-btn"
          style={[styles.btn, styles.btnPrimary]}
          onPress={onRestart}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={16} color="#080808" />
          <Text style={styles.btnPrimaryText}>REBOOT SYSTEM</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="menu-btn"
          style={[styles.btn, styles.btnGhost]}
          onPress={onMenu}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={16} color="#EAEAEA" />
          <Text style={[styles.btnGhostText, { color: "#EAEAEA" }]}>MAIN MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  best,
  icon,
}: {
  label: string;
  value: number;
  best: number;
  icon?: boolean;
}) {
  const isBest = value >= best && value > 0;
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statRight}>
        {icon && <MaterialCommunityIcons name="nut" size={12} color="#F39C12" />}
        <Text style={styles.statValue}>{value}</Text>
        {isBest && <Text style={styles.bestTag}>BEST</Text>}
        {!isBest && best > 0 && <Text style={styles.bestSub}>· best {best}</Text>}
      </View>
    </View>
  );
}

export function WaveBanner({ wave }: { wave: number }) {
  return (
    <View pointerEvents="none" style={styles.waveBanner} testID="wave-banner">
      <Text style={styles.bannerTag}>[ INCOMING ]</Text>
      <Text style={styles.bannerWave}>WAVE {wave.toString().padStart(2, "0")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,8,8,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  gameOverTint: {
    backgroundColor: "rgba(40,8,8,0.92)",
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(20,18,16,0.97)",
    borderWidth: 1,
    borderColor: "#D35400",
    padding: 22,
  },
  tag: {
    color: "#D35400",
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: "Courier",
  },
  title: {
    color: "#EAEAEA",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 4,
    marginTop: 2,
  },
  sub: {
    color: "#7A7A7A",
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  statBlock: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
    paddingVertical: 10,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  statLabel: {
    color: "#7A7A7A",
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "Courier",
  },
  statRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    color: "#EAEAEA",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  bestTag: {
    color: "#39FF14",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "900",
    marginLeft: 6,
    backgroundColor: "rgba(57,255,20,0.15)",
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bestSub: {
    color: "#555",
    fontSize: 10,
    fontFamily: "Courier",
    marginLeft: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: "#D35400",
  },
  btnPrimaryText: {
    color: "#080808",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 3,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: "#333",
  },
  btnGhostText: {
    color: "#FF2A2A",
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: "800",
  },
  waveBanner: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(20,18,16,0.85)",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderWidth: 1,
    borderColor: "#D35400",
  },
  bannerTag: {
    color: "#D35400",
    fontSize: 10,
    letterSpacing: 4,
    fontFamily: "Courier",
  },
  bannerWave: {
    color: "#EAEAEA",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 4,
  },
});
