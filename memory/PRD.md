# LAST SCRAP — Product Requirements (PRD)

## Overview
Top-down 2D post-apocalyptic zombie survival/shooter built with Expo (React Native). Player is the sole surviving operator defending **The RIG** — the last fusion reactor on Earth. Zombies are attracted to a coolant chemical and come in waves. Player auto-fires at the nearest zombie. Scrap dropped by enemies is spent on upgrades between waves.

## Master build origin
Combined ideas/best parts from three GitHub repos (Lastscrap, Rigdefence, last-scrap) into one cohesive master build per user request.

## Platform
- Expo SDK 54, React Native 0.81, Expo Router (file-based)
- Local-only (no backend, no auth, no MongoDB usage)
- High scores persisted via `@/src/utils/storage` (AsyncStorage)

## Game design
- **Arena**: full-screen wasteland with sparse dot terrain; RIG (cyan hexagonal core) anchored at center
- **Player**: white arrow shape, controlled by virtual joystick (bottom-left); faces movement direction; soft aim-assist nudges facing to nearest zombie within ~220px when idle
- **Fire button (bottom-right)**: tap = single shot, hold (>160ms) = continuous auto-fire; consumes 1 ammo per shot
- **Aim assist**: bullets snap to nearest zombie inside ±35° cone within 360px of facing; otherwise fire straight
- **Ammo**: starts pre-loaded (12), capped by `ammoCap` upgrade, regenerates passively per `ammoRegen` upgrade (rds/sec)
- **Zombies**: 3 tiers — Walker, Runner, Brute. HP & speed scale by wave
- **Damage flow**: zombies damage player on contact (mitigated by `armor` upgrade %), and RIG on contact (one-shot then despawn)
- **Wave system**: count = 6 + 2.2·wave, faster spawn intervals over time
- **Scrap economy**: kills drop orange diamonds; magnetized to player based on pickup radius
- **Wave clear bonus**: 8 + 3·wave scrap awarded automatically

## Upgrades (8 paths, each scales 1.55× per level)
- ATTACK — bullet damage
- HEALTH — operator max HP
- ARMOR — % damage reduction (capped 65%)
- AMMO CAP — magazine size
- AMMO REGEN — rounds regenerated per second
- RIG PLATING — RIG max HP
- MOBILITY — player movement speed
- MAGNETIZER — scrap pickup radius

> Fire rate is intentionally fixed (~3 shots/s) until the weapon shop is introduced — purchasing new weapons will change fire characteristics.

Free FIELD REPAIR button between waves restores 15% player HP / 10% RIG HP and tops up ammo.

## Screens
- **/** (Main menu): Stencil title, mission brief, best-stats tiles, BOOT THE RIG, HOW TO PLAY toggle
- **/game** (Gameplay): Arena + HUD + joystick + pause/shop/gameover overlays
- **PAUSE overlay**: RESUME / ABORT MISSION
- **UPGRADE TERMINAL** (between waves): 6 upgrade cards, FIELD REPAIR, DEPLOY next wave
- **GAME OVER overlay**: kills/scrap/waves stats with BEST highlighting, REBOOT SYSTEM / MAIN MENU

## Persistence
Local key `lastscrap_best_v1` stores `{ wave, scrap, kills }` highest values, updated on wave clear and game over.

## Visual system (per /app/design_guidelines.json)
- Theme: gritty post-apocalyptic. Charcoal black backgrounds, rust orange (#D35400), tactical cyan (#00FFFF), toxic green zombies (#39FF14), blood red (#FF2A2A), scrap amber (#F39C12). No purple/violet.
- Typography: Heavy uppercase sans for titles, Courier monospace for HUD/stats
- Corner brackets, segmented health bars, sharp angular panels
- Motion: screen-edge red flash on player damage, RIG flash cyan/red on hit, particle bursts on kills

## Files
- `app/_layout.tsx`, `app/index.tsx` (menu), `app/game.tsx` (gameplay)
- `src/game/{types.ts, engine.ts, storage.ts}` — pure logic (no React)
- `src/components/{Arena.tsx, HUD.tsx, Joystick.tsx, UpgradeShop.tsx, Overlays.tsx}`

## Future enhancements (not yet built)
- Special abilities (grenade / EMP / dash)
- Boss waves every 5
- Sound + haptics (expo-haptics already available)
- Daily seed runs / leaderboards (would require backend)
