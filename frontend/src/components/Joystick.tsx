import React, { useRef, useState } from "react";
import { View, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";

type Props = {
  size?: number;
  onMove: (x: number, y: number) => void; // x,y in [-1,1]
  testID?: string;
};

export default function Joystick({ size = 130, onMove, testID }: Props) {
  const radius = size / 2;
  const knobSize = size * 0.42;
  const [knob, setKnob] = useState({ dx: 0, dy: 0 });

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_e: GestureResponderEvent, _gs: PanResponderGestureState) => {
        setKnob({ dx: 0, dy: 0 });
        onMove(0, 0);
      },
      onPanResponderMove: (_e, gs) => {
        let dx = gs.dx;
        let dy = gs.dy;
        const len = Math.hypot(dx, dy);
        const max = radius - knobSize / 4;
        if (len > max) {
          dx = (dx / len) * max;
          dy = (dy / len) * max;
        }
        setKnob({ dx, dy });
        const nx = dx / max;
        const ny = dy / max;
        onMove(nx, ny);
      },
      onPanResponderRelease: () => {
        setKnob({ dx: 0, dy: 0 });
        onMove(0, 0);
      },
      onPanResponderTerminate: () => {
        setKnob({ dx: 0, dy: 0 });
        onMove(0, 0);
      },
    }),
  ).current;

  return (
    <View
      testID={testID ?? "gameplay-joystick"}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      {...responder.panHandlers}
    >
      <View style={[styles.cross, { width: size * 0.7, height: 1 }]} />
      <View style={[styles.cross, { width: 1, height: size * 0.7 }]} />
      <View
        pointerEvents="none"
        style={[
          styles.knob,
          {
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            transform: [{ translateX: knob.dx }, { translateY: knob.dy }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(20,18,16,0.45)",
    borderWidth: 2,
    borderColor: "rgba(211,84,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cross: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  knob: {
    backgroundColor: "rgba(0,255,255,0.35)",
    borderWidth: 1,
    borderColor: "#00FFFF",
  },
});
