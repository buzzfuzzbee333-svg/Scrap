import React from "react";
import { View, StyleSheet } from "react-native";
import { GameState } from "../game/engine";

type Props = {
  state: GameState;
};

function Arena({ state }: Props) {
  const { arena, rig, player, zombies, bullets, scraps, particles } = state;

  const rigPulse = 0.7 + Math.sin(Date.now() / 280) * 0.3;
  const rigShadow = 18 + rigPulse * 12;
  const rigHpRatio = rig.hp / rig.maxHp;

  return (
    <View
      testID="game-arena"
      pointerEvents="none"
      style={[
        styles.arena,
        { width: arena.width, height: arena.height },
      ]}
    >
      {/* Wasteland scratches: static-ish grid dots */}
      <Grid width={arena.width} height={arena.height} />

      {/* RIG shield ring */}
      <View
        style={[
          styles.rigShield,
          {
            left: rig.pos.x - rig.radius - 22,
            top: rig.pos.y - rig.radius - 22,
            width: (rig.radius + 22) * 2,
            height: (rig.radius + 22) * 2,
            borderColor:
              rig.damageFlash > 0
                ? "rgba(255,42,42,0.85)"
                : "rgba(0,255,255,0.25)",
            opacity: 0.4 + rigPulse * 0.4,
          },
        ]}
      />

      {/* RIG core - hexagonal-ish (use two rotated squares) */}
      <View
        style={[
          styles.rigBase,
          {
            left: rig.pos.x - rig.radius,
            top: rig.pos.y - rig.radius,
            width: rig.radius * 2,
            height: rig.radius * 2,
            shadowColor: rig.damageFlash > 0 ? "#FF2A2A" : "#00FFFF",
            shadowRadius: rigShadow,
            shadowOpacity: 0.9,
            backgroundColor:
              rig.damageFlash > 0 ? "#5b0707" : "#001a1a",
          },
        ]}
      >
        <View
          style={[
            styles.rigHex,
            { transform: [{ rotate: "30deg" }], borderColor: rig.damageFlash > 0 ? "#FF2A2A" : "#00FFFF" },
          ]}
        />
        <View
          style={[
            styles.rigHex,
            { transform: [{ rotate: "-30deg" }], borderColor: rig.damageFlash > 0 ? "#FF2A2A" : "#00FFFF" },
          ]}
        />
        <View
          style={[
            styles.rigInner,
            {
              backgroundColor: rig.damageFlash > 0 ? "#FF2A2A" : "#00FFFF",
              opacity: 0.5 + rigPulse * 0.5,
            },
          ]}
        />
      </View>

      {/* RIG hp ring under */}
      <View
        style={[
          styles.rigHpBar,
          {
            left: rig.pos.x - 38,
            top: rig.pos.y + rig.radius + 10,
            width: 76,
          },
        ]}
      >
        <View
          style={[
            styles.rigHpFill,
            {
              width: `${Math.max(0, rigHpRatio * 100)}%`,
              backgroundColor: rigHpRatio > 0.4 ? "#00FFFF" : "#FF2A2A",
            },
          ]}
        />
      </View>

      {/* Scraps */}
      {scraps.map((s) => (
        <View
          key={s.id}
          style={[
            styles.scrap,
            {
              left: s.pos.x - 5,
              top: s.pos.y - 5,
            },
          ]}
        />
      ))}

      {/* Zombies */}
      {zombies.map((z) => {
        // @ts-ignore custom color
        const col: string = z.color || "#39FF14";
        const flash = z.hitFlash > 0;
        const hpRatio = z.hp / z.maxHp;
        return (
          <View key={z.id}>
            <View
              style={[
                styles.zombie,
                {
                  left: z.pos.x - z.radius,
                  top: z.pos.y - z.radius,
                  width: z.radius * 2,
                  height: z.radius * 2,
                  borderRadius: z.radius,
                  backgroundColor: flash ? "#FFFFFF" : col,
                  borderColor: "#113300",
                },
              ]}
            />
            {hpRatio < 1 && (
              <View
                style={[
                  styles.zHp,
                  {
                    left: z.pos.x - z.radius,
                    top: z.pos.y - z.radius - 6,
                    width: z.radius * 2,
                  },
                ]}
              >
                <View
                  style={[
                    styles.zHpFill,
                    { width: `${hpRatio * 100}%` },
                  ]}
                />
              </View>
            )}
          </View>
        );
      })}

      {/* Bullets */}
      {bullets.map((b) => (
        <View
          key={b.id}
          style={[
            styles.bullet,
            {
              left: b.pos.x - 3,
              top: b.pos.y - 3,
            },
          ]}
        />
      ))}

      {/* Player */}
      <View
        style={[
          styles.player,
          {
            left: player.pos.x - 14,
            top: player.pos.y - 14,
            backgroundColor: player.damageFlash > 0 ? "#FF2A2A" : "transparent",
            borderColor: player.damageFlash > 0 ? "#FF2A2A" : "#FFFFFF",
            transform: [{ rotate: `${player.facing + Math.PI / 2}rad` }],
          },
        ]}
      >
        <View style={styles.playerArrow} />
        <View style={styles.playerCore} />
      </View>

      {/* Particles */}
      {particles.map((p) => (
        <View
          key={p.id}
          style={{
            position: "absolute",
            left: p.pos.x - p.size / 2,
            top: p.pos.y - p.size / 2,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: Math.max(0, p.ttl / p.maxTtl),
          }}
        />
      ))}
    </View>
  );
}

function Grid({ width, height }: { width: number; height: number }) {
  // Sparse static dots for wasteland feel
  const dots: { x: number; y: number; o: number }[] = [];
  const step = 48;
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      // Pseudo-deterministic offset
      const seed = (x * 73856093) ^ (y * 19349663);
      const jx = ((seed % 17) / 17) * 8;
      const jy = (((seed >> 4) % 19) / 19) * 8;
      const o = 0.04 + (((seed >> 8) % 7) / 7) * 0.05;
      dots.push({ x: x + jx, y: y + jy, o });
    }
  }
  return (
    <>
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: 2,
            height: 2,
            backgroundColor: `rgba(234,234,234,${d.o})`,
          }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  arena: {
    position: "absolute",
    backgroundColor: "#141210",
    overflow: "hidden",
  },
  rigBase: {
    position: "absolute",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  rigHex: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#00FFFF",
  },
  rigInner: {
    width: "45%",
    height: "45%",
    backgroundColor: "#00FFFF",
  },
  rigShield: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  rigHpBar: {
    position: "absolute",
    height: 4,
    backgroundColor: "rgba(255,42,42,0.25)",
    borderWidth: 1,
    borderColor: "#333",
  },
  rigHpFill: {
    height: "100%",
  },
  player: {
    position: "absolute",
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  playerArrow: {
    position: "absolute",
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF",
  },
  playerCore: {
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
  },
  zombie: {
    position: "absolute",
    borderWidth: 2,
  },
  zHp: {
    position: "absolute",
    height: 2,
    backgroundColor: "rgba(255,42,42,0.25)",
  },
  zHpFill: {
    height: "100%",
    backgroundColor: "#FF2A2A",
  },
  bullet: {
    position: "absolute",
    width: 6,
    height: 6,
    backgroundColor: "#00FFFF",
  },
  scrap: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#F39C12",
    borderWidth: 1,
    borderColor: "#7a4500",
    transform: [{ rotate: "45deg" }],
  },
});

export default Arena;
