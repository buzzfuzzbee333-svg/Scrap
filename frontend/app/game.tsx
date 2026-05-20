import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Arena from "@/src/components/Arena";
import HUD from "@/src/components/HUD";
import Joystick from "@/src/components/Joystick";
import UpgradeShop from "@/src/components/UpgradeShop";
import {
  GameOverOverlay,
  PauseOverlay,
  WaveBanner,
} from "@/src/components/Overlays";
import {
  GameState,
  createState,
  startWave,
  tick,
} from "@/src/game/engine";
import { storage } from "@/src/utils/storage";
import { BEST_KEY } from "@/src/game/storage";

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const stateRef = useRef<GameState | null>(null);
  const [, setRenderTick] = useState(0);
  const [waveBannerVisible, setWaveBannerVisible] = useState(false);
  const lastFrameRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const bestRef = useRef<{ wave: number; scrap: number; kills: number }>({
    wave: 0,
    scrap: 0,
    kills: 0,
  });
  const gameOverSavedRef = useRef(false);

  const arenaSize = useMemo(() => ({ width, height }), [width, height]);

  const forceTick = useCallback(() => setRenderTick((t) => (t + 1) % 1000000), []);

  // Initialize game state
  useEffect(() => {
    const s = createState(arenaSize.width, arenaSize.height);
    stateRef.current = s;
    startWave(s);
    showBanner();

    (async () => {
      const raw = await storage.getItem<string>(BEST_KEY, "");
      if (raw && typeof raw === "string" && raw.length > 0) {
        try {
          bestRef.current = { ...bestRef.current, ...JSON.parse(raw) };
        } catch {}
      }
    })();

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update arena dimensions when screen rotates / resizes
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    s.arena.width = arenaSize.width;
    s.arena.height = arenaSize.height;
    s.rig.pos = { x: arenaSize.width / 2, y: arenaSize.height / 2 };
  }, [arenaSize]);

  // Game loop
  useEffect(() => {
    const loop = (now: number) => {
      const s = stateRef.current;
      if (!s) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (lastFrameRef.current === 0) lastFrameRef.current = now;
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      tick(s, dt);

      // When wave is cleared, advance to shop after a tiny pause
      if (s.status === "waveclear") {
        s.status = "shop";
        saveBestIfNeeded(s);
      }
      if (s.status === "gameover" && !gameOverSavedRef.current) {
        gameOverSavedRef.current = true;
        saveBestIfNeeded(s);
      }
      setRenderTick((t) => (t + 1) % 1000000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = 0;
    };
  }, []);

  const saveBestIfNeeded = useCallback(async (s: GameState) => {
    const b = bestRef.current;
    const next = {
      wave: Math.max(b.wave, s.stats.wavesCleared),
      scrap: Math.max(b.scrap, s.stats.totalScrap),
      kills: Math.max(b.kills, s.stats.kills),
    };
    if (
      next.wave !== b.wave ||
      next.scrap !== b.scrap ||
      next.kills !== b.kills
    ) {
      bestRef.current = next;
      await storage.setItem(BEST_KEY, JSON.stringify(next));
    }
  }, []);

  const showBanner = () => {
    setWaveBannerVisible(true);
    setTimeout(() => setWaveBannerVisible(false), 1100);
  };

  const onJoystickMove = useCallback((x: number, y: number) => {
    const s = stateRef.current;
    if (!s) return;
    s.input.x = x;
    s.input.y = y;
  }, []);

  const handlePause = () => {
    const s = stateRef.current;
    if (!s) return;
    if (s.status === "playing") s.status = "paused";
    forceTick();
  };
  const handleResume = () => {
    const s = stateRef.current;
    if (!s) return;
    if (s.status === "paused") s.status = "playing";
    forceTick();
  };
  const handleAbort = () => {
    router.replace("/");
  };
  const handleDeploy = () => {
    const s = stateRef.current;
    if (!s) return;
    startWave(s);
    showBanner();
    forceTick();
  };
  const handleRestart = () => {
    const s = createState(arenaSize.width, arenaSize.height);
    stateRef.current = s;
    gameOverSavedRef.current = false;
    startWave(s);
    showBanner();
    forceTick();
  };

  const s = stateRef.current;
  const screenFlashOpacity = s ? Math.min(0.5, s.flash.screen) : 0;

  return (
    <View style={styles.root} testID="game-screen">
      {s && <Arena state={s} />}

      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {s && <HUD state={s} onPause={handlePause} />}

        {/* Joystick bottom-left */}
        <View
          pointerEvents="box-none"
          style={[
            styles.joystickWrap,
            { bottom: insets.bottom + 24, left: 24 },
          ]}
        >
          <Joystick onMove={onJoystickMove} />
        </View>

        {waveBannerVisible && s && <WaveBanner wave={s.wave} />}

        {s?.status === "paused" && (
          <PauseOverlay onResume={handleResume} onAbort={handleAbort} />
        )}

        {s?.status === "shop" && (
          <UpgradeShop
            state={s}
            forceTick={forceTick}
            onDeploy={handleDeploy}
          />
        )}

        {s?.status === "gameover" && (
          <GameOverOverlay
            state={s}
            best={bestRef.current}
            onRestart={handleRestart}
            onMenu={handleAbort}
          />
        )}
      </SafeAreaView>

      {/* Screen damage flash overlay */}
      {screenFlashOpacity > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.damageFlash,
            { opacity: screenFlashOpacity },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080808" },
  joystickWrap: { position: "absolute" },
  damageFlash: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "#FF2A2A",
    borderWidth: 8,
  },
});
