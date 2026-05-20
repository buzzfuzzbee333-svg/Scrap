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
- **Player**: white arrow shape, controlled by virtual joystick (bottom-left). Auto-aims at nearest zombie within ~500px
- **Auto-fire**: cyan bullets, fire rate based on upgrade level
- **Zombies**: 3 tiers — Walker (green), Runner (light green, fast/low HP), Brute (olive, slow/heavy HP). HP & speed scale by wave
- **Targeting AI**: zombies path toward RIG unless player is significantly closer
- **Damage flow**: zombies damage player on contact (continuous) and RIG on contact (one-shot then despawn)
- **Wave system**: count = 6 + 2.2·wave, faster spawn intervals over time
- **Scrap economy**: kills drop orange diamonds; magnetized to player based on pickup radius
- **Wave clear bonus**: 8 + 3·wave scrap awarded automatically

## Upgrades (6 paths, each scales 1.55× per level)
- DAMAGE — bullet damage
- FIRE RATE — shots per second
- ARMOR — operator max HP
- RIG PLATING — RIG max HP
- MOBILITY — player movement speed
- MAGNETIZER — scrap pickup radius

Free FIELD REPAIR button between waves restores 15% player HP / 10% RIG HP.

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
