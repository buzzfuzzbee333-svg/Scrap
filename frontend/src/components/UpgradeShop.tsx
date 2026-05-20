import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import { GameState, UPGRADE_META, applyUpgrade, repair, upgradeCost, upgradeValue } from "../game/engine";
import { UPGRADE_KEYS, Upgrades } from "../game/types";

type Props = {
  state: GameState;
  onDeploy: () => void;
  forceTick: () => void;
};

function IconFor({ family, name, color, size = 22 }: any) {
  if (family === "Ionicons") return <Ionicons name={name} size={size} color={color} />;
  if (family === "MaterialCommunityIcons")
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  if (family === "FontAwesome5") return <FontAwesome5 name={name} size={size} color={color} />;
  if (family === "MaterialIcons") return <MaterialIcons name={name} size={size} color={color} />;
  return null;
}

export default function UpgradeShop({ state, onDeploy, forceTick }: Props) {
  const handleBuy = (key: keyof Upgrades) => {
    if (applyUpgrade(state, key)) forceTick();
  };

  return (
    <View style={styles.overlay} testID="upgrade-shop">
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.headerTag}>[ SYSTEM ]</Text>
          <Text style={styles.headerTitle}>UPGRADE TERMINAL</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerSub}>WAVE {state.wave.toString().padStart(2, "0")} CLEARED</Text>
            <View style={styles.scrapPill}>
              <MaterialCommunityIcons name="nut" size={14} color="#F39C12" />
              <Text style={styles.scrapPillText} testID="shop-scrap-count">
                {state.scrap}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={{ paddingVertical: 6 }}>
          {UPGRADE_KEYS.map((key) => {
            const meta = UPGRADE_META[key];
            const lvl = state.upgrades[key];
            const cost = upgradeCost(key, lvl);
            const next = upgradeValue(key, lvl + 1);
            const cur = upgradeValue(key, lvl);
            const canAfford = state.scrap >= cost;
            return (
              <TouchableOpacity
                key={key}
                testID={`upgrade-${key}`}
                style={[styles.card, !canAfford && styles.cardDisabled]}
                onPress={() => handleBuy(key)}
                activeOpacity={0.7}
              >
                <View style={styles.cardIcon}>
                  <IconFor {...meta.icon} color={meta.color} size={24} />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardLabel}>{meta.label}</Text>
                    <Text style={styles.cardLevel}>LV {lvl}</Text>
                  </View>
                  <Text style={styles.cardSub}>{meta.sub}</Text>
                  <Text style={styles.cardDelta}>
                    {formatValue(key, cur)} → {formatValue(key, next)}
                  </Text>
                </View>
                <View style={styles.cardCost}>
                  <MaterialCommunityIcons name="nut" size={12} color="#F39C12" />
                  <Text
                    style={[
                      styles.cardCostText,
                      { color: canAfford ? "#F39C12" : "#5a4a30" },
                    ]}
                  >
                    {cost}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={styles.repairBtn}
          testID="repair-btn"
          activeOpacity={0.8}
          onPress={() => {
            repair(state);
            forceTick();
          }}
        >
          <FontAwesome5 name="wrench" size={14} color="#39FF14" />
          <Text style={styles.repairText}>FIELD REPAIR · FREE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deployBtn}
          testID="deploy-btn"
          onPress={onDeploy}
          activeOpacity={0.85}
        >
          <Text style={styles.deployText}>DEPLOY · WAVE {state.wave + 1}</Text>
          <Ionicons name="arrow-forward" size={18} color="#080808" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatValue(key: keyof Upgrades, v: number) {
  if (key === "fireRate") return `${(1 / v).toFixed(2)}/s`;
  if (key === "moveSpeed") return `${Math.round(v)}u/s`;
  if (key === "pickupRadius") return `${Math.round(v)}px`;
  if (key === "damage") return `${Math.round(v)} dmg`;
  return Math.round(v).toString();
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,8,8,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  panel: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "92%",
    backgroundColor: "rgba(20,18,16,0.97)",
    borderWidth: 1,
    borderColor: "#D35400",
    padding: 16,
  },
  header: {
    borderBottomWidth: 1,
    borderColor: "#333",
    paddingBottom: 10,
    marginBottom: 8,
  },
  headerTag: {
    color: "#D35400",
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: "Courier",
  },
  headerTitle: {
    color: "#EAEAEA",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  headerSub: {
    color: "#7A7A7A",
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "Courier",
  },
  scrapPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(243,156,18,0.1)",
    borderWidth: 1,
    borderColor: "#F39C12",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scrapPillText: {
    color: "#F39C12",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
    fontFamily: "Courier",
  },
  list: { flexGrow: 0 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "rgba(10,9,8,0.7)",
    padding: 10,
    marginVertical: 4,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardIcon: {
    width: 36,
    alignItems: "center",
  },
  cardBody: { flex: 1, marginLeft: 8 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "#EAEAEA",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  cardLevel: {
    color: "#7A7A7A",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Courier",
  },
  cardSub: {
    color: "#7A7A7A",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 1,
  },
  cardDelta: {
    color: "#39FF14",
    fontSize: 11,
    fontFamily: "Courier",
    marginTop: 2,
  },
  cardCost: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    minWidth: 56,
    justifyContent: "flex-end",
  },
  cardCostText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
    fontFamily: "Courier",
  },
  repairBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#39FF14",
    paddingVertical: 8,
    marginTop: 10,
    gap: 8,
  },
  repairText: {
    color: "#39FF14",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "800",
  },
  deployBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D35400",
    paddingVertical: 12,
    marginTop: 10,
    gap: 8,
  },
  deployText: {
    color: "#080808",
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: "900",
  },
});
