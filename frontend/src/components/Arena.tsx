import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { GameState } from "../game/engine";

const ARENA_BG = require("../../assets/images/game/arena.jpg");
const RIG_IMG = require("../../assets/images/game/rig.png");
const HERO_IMG = require("../../assets/images/game/hero.png");
const Z_WALKER = require("../../assets/images/game/zombie_walker.png");
const Z_RUNNER = require("../../assets/images/game/zombie_runner.png");
const Z_BRUTE = require("../../assets/images/game/zombie_brute.png");

const HERO_SIZE = 42;
const RIG_SIZE = 110;

type Props = {
  state: GameState;
};

function zombieSprite(radius: number) {
  if (radius >= 18) return Z_BRUTE;
  if (radius <= 12) return Z_RUNNER;
  return Z_WALKER;
}

function zombieRenderSize(radius: number) {
  return radius * 2.6;
}

function Arena({ state }: Props) {
  const { arena, rig, player, zombies, bullets, scraps, particles } = state;

  const pulse = (Math.sin(Date.now() / 320) + 1) / 2;
  const rigFlash = rig.damageFlash > 0;
  const rigSize = RIG_SIZE + pulse * 6;
  const rigShieldSize = rig.radius * 2 + 38;

  return (
    <View
      testID="game-arena"
      pointerEvents="none"
      style={[styles.arena, { width: arena.width, height: arena.height }]}
    >
      {/* Arena floor background */}
      <Image
        source={ARENA_BG}
        resizeMode="cover"
        style={[
          StyleSheet.absoluteFill,
          { width: arena.width, height: arena.height, opacity: 0.85 },
        ]}
      />
      {/* Vignette */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* RIG shield aura */}
      <View
        style={[
          styles.rigShield,
          {
            left: rig.pos.x - rigShieldSize / 2,
            top: rig.pos.y - rigShieldSize / 2,
            width: rigShieldSize,
            height: rigShieldSize,
            borderColor: rigFlash
              ? "rgba(255,42,42,0.85)"
              : "rgba(0,255,255,0.35)",
            opacity: 0.4 + pulse * 0.4,
          },
        ]}
      />

      {/* RIG sprite */}
      <View
        style={{
          position: "absolute",
          left: rig.pos.x - rigSize / 2,
          top: rig.pos.y - rigSize / 2,
          width: rigSize,
          height: rigSize,
        }}
      >
        <Image
          source={RIG_IMG}
          style={{ width: "100%", height: "100%", opacity: 0.95 }}
          resizeMode="contain"
        />
        {rigFlash && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: "#FF2A2A",
                opacity: 0.35,
                borderRadius: rigSize / 2,
              },
            ]}
          />
        )}
      </View>

      {/* RIG HP indicator */}
      <View
        style={[
          styles.rigHpBar,
          {
            left: rig.pos.x - 46,
            top: rig.pos.y + rigSize / 2 + 6,
            width: 92,
          },
        ]}
      >
        <View
          style={[
            styles.rigHpFill,
            {
              width: `${Math.max(0, (rig.hp / rig.maxHp) * 100)}%`,
              backgroundColor:
                rig.hp / rig.maxHp > 0.4 ? "#00FFFF" : "#FF2A2A",
            },
          ]}
        />
      </View>

      {/* Scrap drops */}
      {scraps.map((s) => (
        <View
          key={s.id}
          style={[
            styles.scrap,
            { left: s.pos.x - 5, top: s.pos.y - 5 },
          ]}
        />
      ))}

      {/* Zombies */}
      {zombies.map((z) => {
        const sprite = zombieSprite(z.radius);
        const visSize = zombieRenderSize(z.radius);
        const flash = z.hitFlash > 0;
        const hpRatio = z.hp / z.maxHp;
        return (
          <View key={z.id}>
            <Image
              source={sprite}
              resizeMode="contain"
              style={{
                position: "absolute",
                left: z.pos.x - visSize / 2,
                top: z.pos.y - visSize / 2,
                width: visSize,
                height: visSize,
                opacity: flash ? 0.6 : 1,
              }}
            />
            {flash && (
              <View
                style={{
                  position: "absolute",
                  left: z.pos.x - visSize / 2,
                  top: z.pos.y - visSize / 2,
                  width: visSize,
                  height: visSize,
                  backgroundColor: "#FFFFFF",
                  opacity: 0.35,
                  borderRadius: visSize / 2,
                }}
              />
            )}
            {hpRatio < 1 && (
              <View
                style={[
                  styles.zHp,
                  {
                    left: z.pos.x - z.radius,
                    top: z.pos.y - visSize / 2 - 6,
                    width: z.radius * 2,
                  },
                ]}
              >
                <View style={[styles.zHpFill, { width: `${hpRatio * 100}%` }]} />
              </View>
            )}
          </View>
        );
      })}

      {/* Bullets */}
      {bullets.map((b) => (
        <View
          key={b.id}
          style={[styles.bullet, { left: b.pos.x - 3, top: b.pos.y - 3 }]}
        />
      ))}

      {/* Player hero sprite */}
      <View
        style={{
          position: "absolute",
          left: player.pos.x - HERO_SIZE / 2,
          top: player.pos.y - HERO_SIZE / 2,
          width: HERO_SIZE,
          height: HERO_SIZE,
          transform: [{ rotate: `${player.facing + Math.PI / 2}rad` }],
        }}
      >
        <Image
          source={HERO_IMG}
          resizeMode="contain"
          style={{ width: "100%", height: "100%" }}
        />
        {player.damageFlash > 0 && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: "#FF2A2A",
                opacity: 0.45,
                borderRadius: HERO_SIZE / 2,
              },
            ]}
          />
        )}
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

const styles = StyleSheet.create({
  arena: {
    position: "absolute",
    backgroundColor: "#080808",
    overflow: "hidden",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,8,8,0.35)",
  },
  rigShield: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
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
    backgroundColor: "#FFEFA8",
    borderRadius: 3,
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
