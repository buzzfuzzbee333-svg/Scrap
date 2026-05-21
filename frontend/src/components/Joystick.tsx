import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  PanResponderGestureState,
} from "react-native";

type Props = {
  size?: number;
  onMove: (x: number, y: number) => void; // x,y in [-1,1]
  deadzone?: number; // 0..1, fraction ignored near center
  testID?: string;
};

export default function Joystick({
  size = 140,
  onMove,
  deadzone = 0.15,
  testID,
}: Props) {
  const radius = size / 2;
  const knobSize = size * 0.42;
  const max = radius - knobSize / 4;
  const [knob, setKnob] = useState({ dx: 0, dy: 0 });

  const clamp = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy);
    if (len > max && len > 0) {
      return { dx: (dx / len) * max, dy: (dy / len) * max };
    }
    return { dx, dy };
  };

  const emit = (dx: number, dy: number) => {
    let nx = dx / max;
    let ny = dy / max;
    const mag = Math.hypot(nx, ny);
    if (mag < deadzone) {
      onMove(0, 0);
      return;
    }
    // Rescale so output is 0 at deadzone, 1 at edge
    const scaled = Math.min(1, (mag - deadzone) / (1 - deadzone));
    const k = scaled / mag;
    onMove(nx * k, ny * k);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Treat touch-down as the new center; player stays still until drag.
        setKnob({ dx: 0, dy: 0 });
        onMove(0, 0);
      },
      onPanResponderMove: (_e, gs: PanResponderGestureState) => {
        const c = clamp(gs.dx, gs.dy);
        setKnob(c);
        emit(c.dx, c.dy);
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
    backgroundColor: "rgba(20,18,16,0.55)",
    borderWidth: 2,
    borderColor: "rgba(211,84,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  cross: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  knob: {
    backgroundColor: "rgba(0,255,255,0.4)",
    borderWidth: 1,
    borderColor: "#00FFFF",
  },
});
