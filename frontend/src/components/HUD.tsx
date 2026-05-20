import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { GameState } from "../game/engine";

type Props = {
  state: GameState;
  onPause: () => void;
};

export default function HUD({ state, onPause }: Props) {
  const playerPct = Math.max(0, (state.player.hp / state.player.maxHp) * 100);
  const rigPct = Math.max(0, (state.rig.hp / state.rig.maxHp) * 100);

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {/* TOP LEFT - Player HP + scrap */}
      <View style={styles.topLeft} pointerEvents="box-none">
        <View style={styles.row}>
          <FontAwesome5 name="heartbeat" size={14} color="#FF2A2A" />
          <Text style={styles.label}>OP</Text>
          <SegmentedBar pct={playerPct} color="#FF2A2A" testID="player-health-bar" />
          <Text style={styles.statText} testID="player-hp-text">
            {Math.ceil(state.player.hp)}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="nuclear" size={14} color="#00FFFF" />
          <Text style={styles.label}>RIG</Text>
          <SegmentedBar pct={rigPct} color="#00FFFF" testID="rig-health-bar" />
          <Text style={[styles.statText, { color: "#00FFFF" }]} testID="rig-hp-text">
            {Math.ceil(state.rig.hp)}
          </Text>
        </View>
        <View style={[styles.row, { marginTop: 6 }]}>
          <MaterialCommunityIcons name="nut" size={16} color="#F39C12" />
          <Text style={[styles.scrapText]} testID="scrap-count">
            {state.scrap}
          </Text>
          <Text style={styles.scrapSub}>SCRAP</Text>
        </View>
      </View>

      {/* TOP RIGHT - Wave + pause */}
      <View style={styles.topRight} pointerEvents="box-none">
        <View style={styles.waveBox}>
          <Text style={styles.waveLabel}>[ WAVE ]</Text>
          <Text style={styles.waveNum} testID="wave-number">
            {state.wave.toString().padStart(2, "0")}
          </Text>
        </View>
        <Text style={styles.killsText}>
          KILLS · {state.stats.kills.toString().padStart(3, "0")}
        </Text>
        <TouchableOpacity
          testID="pause-btn"
          onPress={onPause}
          style={styles.pauseBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="pause" size={18} color="#EAEAEA" />
        </TouchableOpacity>
      </View>

      {/* Corner brackets - decorative */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
    </View>
  );
}

function SegmentedBar({
  pct,
  color,
  testID,
}: {
  pct: number;
  color: string;
  testID?: string;
}) {
  const segments = 10;
  const filled = Math.round((pct / 100) * segments);
  return (
    <View testID={testID} style={styles.segBar}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.seg,
            {
              backgroundColor: i < filled ? color : "rgba(255,255,255,0.08)",
            },
          ]}
        />
      ))}
    </View>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base: any = { position: "absolute", width: 16, height: 16 };
  const styleByPos: any = {
    tl: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
    tr: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
    bl: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
    br: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },
  };
  return (
    <View
      pointerEvents="none"
      style={[base, styleByPos[pos], { borderColor: "#D35400" }]}
    />
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  topLeft: {
    position: "absolute",
    top: 12,
    left: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    color: "#7A7A7A",
    fontSize: 10,
    letterSpacing: 2,
    marginLeft: 6,
    marginRight: 6,
    fontFamily: "Courier",
  },
  statText: {
    color: "#EAEAEA",
    fontSize: 12,
    marginLeft: 8,
    fontFamily: "Courier",
    minWidth: 32,
  },
  scrapText: {
    color: "#F39C12",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 6,
    fontFamily: "Courier",
  },
  scrapSub: {
    color: "#7A7A7A",
    fontSize: 10,
    letterSpacing: 2,
    marginLeft: 6,
    fontFamily: "Courier",
  },
  segBar: {
    flexDirection: "row",
    gap: 2,
  },
  seg: {
    width: 8,
    height: 8,
  },
  topRight: {
    position: "absolute",
    top: 12,
    right: 16,
    alignItems: "flex-end",
  },
  waveBox: {
    alignItems: "flex-end",
  },
  waveLabel: {
    color: "#D35400",
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: "Courier",
  },
  waveNum: {
    color: "#EAEAEA",
    fontSize: 28,
    fontWeight: "900",
    fontFamily: "Courier",
    letterSpacing: 2,
  },
  killsText: {
    color: "#7A7A7A",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 2,
    fontFamily: "Courier",
  },
  pauseBtn: {
    marginTop: 10,
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#D35400",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,18,16,0.7)",
  },
});
