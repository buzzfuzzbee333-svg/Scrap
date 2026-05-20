import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";

type Props = {
  size?: number;
  onMove: (x: number, y: number) => void; // x,y in [-1,1]
  deadzone?: number; // 0..1, fraction of max radius ignored
  testID?: string;
};

export default function Joystick({
  size = 130,
  onMove,
  deadzone = 0.12,
  testID,
}: Props) {
  const radius = size / 2;
  const knobSize = size * 0.42;
  const max = radius - knobSize / 4;
  const [knob, setKnob] = useState({ dx: 0, dy: 0 });
  // Touch offset within the joystick view at the moment of touch-down.
  const grantOffsetRef = useRef({ x: 0, y: 0 });

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
      nx = 0;
      ny = 0;
    } else {
      // Rescale so output is 0 at deadzone edge, 1 at max
      const scaled = (mag - deadzone) / (1 - deadzone);
      const k = scaled / mag;
      nx *= k;
      ny *= k;
    }
    onMove(nx, ny);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        // locationX/Y is the touch position inside the joystick view.
        const lx = e.nativeEvent.locationX ?? 0;
        const ly = e.nativeEvent.locationY ?? 0;
        const offX = lx - radius;
        const offY = ly - radius;
        grantOffsetRef.current = { x: offX, y: offY };
        const c = clamp(offX, offY);
        setKnob(c);
        emit(c.dx, c.dy);
      },
      onPanResponderMove: (_e, gs: PanResponderGestureState) => {
        const dx = gs.dx + grantOffsetRef.current.x;
        const dy = gs.dy + grantOffsetRef.current.y;
        const c = clamp(dx, dy);
        setKnob(c);
        emit(c.dx, c.dy);
      },
      onPanResponderRelease: () => {
        grantOffsetRef.current = { x: 0, y: 0 };
        setKnob({ dx: 0, dy: 0 });
        onMove(0, 0);
      },
      onPanResponderTerminate: () => {
        grantOffsetRef.current = { x: 0, y: 0 };
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
