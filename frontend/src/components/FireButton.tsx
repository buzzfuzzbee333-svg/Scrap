import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  size?: number;
  onPress: () => void; // tap = single fire
  onHoldStart: () => void; // hold begin = auto fire on
  onHoldEnd: () => void; // hold end = auto fire off
  ammo: number;
  maxAmmo: number;
  testID?: string;
};

export default function FireButton({
  size = 120,
  onPress,
  onHoldStart,
  onHoldEnd,
  ammo,
  maxAmmo,
  testID,
}: Props) {
  const innerRef = useRef<View>(null);
  const holdTimeoutRef = useRef<any>(null);
  const holdingRef = useRef(false);
  const downAtRef = useRef(0);
  const movedRef = useRef(false);
  const HOLD_MS = 160;

  const setPressed = (down: boolean) => {
    innerRef.current?.setNativeProps({
      style: {
        backgroundColor: down ? "#D35400" : "rgba(211,84,0,0.18)",
        borderColor: down ? "#F39C12" : "#D35400",
      },
    });
  };

  const clearHoldTimer = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_e: GestureResponderEvent) => {
        downAtRef.current = Date.now();
        movedRef.current = false;
        setPressed(true);
        // Fire one shot immediately on tap-start for snappy feel
        onPress();
        // Start hold timer
        clearHoldTimer();
        holdTimeoutRef.current = setTimeout(() => {
          holdingRef.current = true;
          onHoldStart();
        }, HOLD_MS);
      },
      onPanResponderMove: (_e, gs) => {
        if (Math.hypot(gs.dx, gs.dy) > 14) movedRef.current = true;
      },
      onPanResponderRelease: () => {
        clearHoldTimer();
        setPressed(false);
        if (holdingRef.current) {
          holdingRef.current = false;
          onHoldEnd();
        }
      },
      onPanResponderTerminate: () => {
        clearHoldTimer();
        setPressed(false);
        if (holdingRef.current) {
          holdingRef.current = false;
          onHoldEnd();
        }
      },
    }),
  ).current;

  const ammoPct = maxAmmo > 0 ? (ammo / maxAmmo) * 100 : 0;
  const empty = ammo <= 0;

  return (
    <View testID={testID ?? "fire-button"} style={{ alignItems: "center" }}>
      {/* Ammo ring/bar above */}
      <View style={styles.ammoRow}>
        <MaterialCommunityIcons
          name="ammunition"
          size={12}
          color={empty ? "#FF2A2A" : "#F39C12"}
        />
        <Text
          style={[styles.ammoText, empty && { color: "#FF2A2A" }]}
          testID="ammo-count"
        >
          {ammo}/{maxAmmo}
        </Text>
      </View>
      <View style={[styles.ammoBar, { width: size * 0.9 }]}>
        <View
          style={[
            styles.ammoFill,
            {
              width: `${ammoPct}%`,
              backgroundColor: empty ? "#FF2A2A" : "#F39C12",
            },
          ]}
        />
      </View>

      <View
        {...responder.panHandlers}
        style={[
          styles.outer,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <View
          ref={innerRef}
          style={[
            styles.inner,
            {
              width: size * 0.78,
              height: size * 0.78,
              borderRadius: (size * 0.78) / 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="pistol"
            size={size * 0.36}
            color={empty ? "#FF2A2A" : "#EAEAEA"}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "rgba(20,18,16,0.35)",
    borderWidth: 2,
    borderColor: "rgba(211,84,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    backgroundColor: "rgba(211,84,0,0.18)",
    borderWidth: 1,
    borderColor: "#D35400",
    alignItems: "center",
    justifyContent: "center",
  },
  ammoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  ammoText: {
    color: "#F39C12",
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "Courier",
    letterSpacing: 1,
  },
  ammoBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  ammoFill: {
    height: "100%",
  },
});
