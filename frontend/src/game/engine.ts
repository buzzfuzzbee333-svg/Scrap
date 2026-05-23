import {
  Bullet,
  GameStatus,
  Particle,
  Scrap,
  Upgrades,
  Vec2,
  Zombie,
} from "./types";

export const BASE_UPGRADES: Upgrades = {
  attack: 1,
  health: 1,
  armor: 1,
  rigPlating: 1,
  ammoCap: 1,
  ammoRegen: 1,
  moveSpeed: 1,
  pickupRadius: 1,
};

// Fire intervals (seconds between shots) until weapon system is added.
// Tap = single shot at semi-auto cadence; Hold = continuous full-auto, faster.
export const BASE_FIRE_INTERVAL = 0.34; // ~3 shots/s for taps
export const AUTO_FIRE_INTERVAL = 0.08; // ~12.5 shots/s when holding

export function upgradeValue(key: keyof Upgrades, level: number): number {
  switch (key) {
    case "attack":
      return 10 + (level - 1) * 6; // bullet damage
    case "health":
      return 100 + (level - 1) * 25;
    case "armor":
      // damage reduction; cap 65%
      return Math.min(0.65, (level - 1) * 0.05);
    case "rigPlating":
      return 300 + (level - 1) * 80;
    case "ammoCap":
      return 12 + (level - 1) * 4;
    case "ammoRegen":
      // ammo per second while reloading
      return 8 + (level - 1) * 2.5;
    case "moveSpeed":
      return 150 + (level - 1) * 15; // px/s
    case "pickupRadius":
      return 60 + (level - 1) * 18;
  }
}

export function upgradeCost(key: keyof Upgrades, level: number): number {
  const base: Record<keyof Upgrades, number> = {
    attack: 18,
    health: 16,
    armor: 22,
    rigPlating: 20,
    ammoCap: 14,
    ammoRegen: 18,
    moveSpeed: 14,
    pickupRadius: 12,
  };
  return Math.round(base[key] * Math.pow(1.55, level - 1));
}

export const UPGRADE_META: Record<
  keyof Upgrades,
  { label: string; sub: string; icon: { family: string; name: string }; color: string }
> = {
  attack: {
    label: "ATTACK",
    sub: "Bullet damage",
    icon: { family: "MaterialCommunityIcons", name: "ammunition" },
    color: "#FF2A2A",
  },
  health: {
    label: "HEALTH",
    sub: "Operator max HP",
    icon: { family: "FontAwesome5", name: "heartbeat" },
    color: "#39FF14",
  },
  armor: {
    label: "ARMOR",
    sub: "Damage reduction",
    icon: { family: "MaterialCommunityIcons", name: "shield-half-full" },
    color: "#9a9a9a",
  },
  rigPlating: {
    label: "RIG PLATING",
    sub: "Reactor integrity",
    icon: { family: "Ionicons", name: "nuclear" },
    color: "#00FFFF",
  },
  ammoCap: {
    label: "AMMO CAP",
    sub: "Magazine size",
    icon: { family: "MaterialCommunityIcons", name: "package-variant" },
    color: "#F39C12",
  },
  ammoRegen: {
    label: "RELOAD SPEED",
    sub: "Rounds per second when empty",
    icon: { family: "MaterialCommunityIcons", name: "autorenew" },
    color: "#D35400",
  },
  moveSpeed: {
    label: "MOBILITY",
    sub: "Boot servos",
    icon: { family: "MaterialCommunityIcons", name: "run-fast" },
    color: "#EAEAEA",
  },
  pickupRadius: {
    label: "MAGNETIZER",
    sub: "Scrap pickup radius",
    icon: { family: "MaterialCommunityIcons", name: "magnet" },
    color: "#F39C12",
  },
};

export type GameState = {
  arena: { width: number; height: number };
  player: {
    pos: Vec2;
    facing: number; // radians
    hp: number;
    maxHp: number;
    fireCd: number;
    damageFlash: number;
    ammo: number;
    maxAmmo: number;
    ammoAcc: number; // fractional ammo accumulator for regen
    reloading: boolean;
  };
  rig: { pos: Vec2; hp: number; maxHp: number; radius: number; damageFlash: number };
  zombies: Zombie[];
  bullets: Bullet[];
  scraps: Scrap[];
  particles: Particle[];
  upgrades: Upgrades;
  scrap: number;
  wave: number;
  spawnQueue: number;
  spawnCd: number;
  status: GameStatus;
  stats: { kills: number; totalScrap: number; wavesCleared: number };
  flash: { screen: number; rig: number };
  input: Vec2; // joystick
  fireHeld: boolean;
  fireQueued: boolean; // for single-tap shot when ammo runs out / cooldown overlap
  nextId: number;
};

export function createState(width: number, height: number): GameState {
  const upgrades = { ...BASE_UPGRADES };
  const playerMaxHp = upgradeValue("health", upgrades.health);
  const rigMaxHp = upgradeValue("rigPlating", upgrades.rigPlating);
  const maxAmmo = upgradeValue("ammoCap", upgrades.ammoCap);
  return {
    arena: { width, height },
    player: {
      pos: { x: width / 2 + 80, y: height / 2 },
      facing: 0,
      hp: playerMaxHp,
      maxHp: playerMaxHp,
      fireCd: 0,
      damageFlash: 0,
      ammo: maxAmmo,
      maxAmmo,
      ammoAcc: 0,
      reloading: false,
    },
    rig: {
      pos: { x: width / 2, y: height / 2 },
      hp: rigMaxHp,
      maxHp: rigMaxHp,
      radius: 38,
      damageFlash: 0,
    },
    zombies: [],
    bullets: [],
    scraps: [],
    particles: [],
    upgrades,
    scrap: 0,
    wave: 0,
    spawnQueue: 0,
    spawnCd: 0,
    status: "playing",
    stats: { kills: 0, totalScrap: 0, wavesCleared: 0 },
    flash: { screen: 0, rig: 0 },
    input: { x: 0, y: 0 },
    fireHeld: false,
    fireQueued: false,
    nextId: 1,
  };
}

export function startWave(s: GameState) {
  s.wave += 1;
  const count = 6 + Math.floor(s.wave * 2.2);
  s.spawnQueue = count;
  // Initial delay so each wave eases in before the first zombie arrives.
  s.spawnCd = 1.2;
  s.status = "playing";
}

function spawnZombie(s: GameState) {
  const { width, height } = s.arena;
  const side = Math.floor(Math.random() * 4);
  let x = 0,
    y = 0;
  const margin = 24;
  if (side === 0) {
    x = Math.random() * width;
    y = -margin;
  } else if (side === 1) {
    x = width + margin;
    y = Math.random() * height;
  } else if (side === 2) {
    x = Math.random() * width;
    y = height + margin;
  } else {
    x = -margin;
    y = Math.random() * height;
  }

  const tier = Math.random();
  const waveScale = 1 + s.wave * 0.06;
  let hp = 18 * waveScale;
  let speed = 50 + s.wave * 2.2;
  let radius = 14;
  let reward = 2;
  let damage = 6;
  let color = "#39FF14";
  if (tier > 0.92) {
    hp = 60 * waveScale;
    speed = 35 + s.wave * 1.5;
    radius = 20;
    reward = 7;
    damage = 14;
    color = "#7DBE00";
  } else if (tier > 0.7) {
    hp = 12 * waveScale;
    speed = 78 + s.wave * 3;
    radius = 11;
    reward = 3;
    damage = 4;
    color = "#A8FF00";
  }
  s.zombies.push({
    id: s.nextId++,
    pos: { x, y },
    vel: { x: 0, y: 0 },
    radius,
    hp,
    maxHp: hp,
    speed,
    damage,
    reward,
    hitFlash: 0,
    // @ts-ignore custom field
    color,
  });
}

function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function spawnParticles(s: GameState, pos: Vec2, color: string, count: number, speed: number) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (0.3 + Math.random() * 0.7) * speed;
    s.particles.push({
      id: s.nextId++,
      pos: { x: pos.x, y: pos.y },
      vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
      ttl: 0.4 + Math.random() * 0.3,
      maxTtl: 0.7,
      color,
      size: 2 + Math.random() * 2,
    });
  }
}

// Aim assist: find best zombie in cone in front of facing.
function findAimTarget(s: GameState): Zombie | null {
  const CONE = Math.PI / 5.1; // ±~35°
  const RANGE = 360;
  let best: Zombie | null = null;
  let bestScore = Infinity;
  for (const z of s.zombies) {
    if (z.hp <= 0) continue;
    const dx = z.pos.x - s.player.pos.x;
    const dy = z.pos.y - s.player.pos.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > RANGE) continue;
    const ang = Math.atan2(dy, dx);
    const diff = Math.abs(angleDiff(ang, s.player.facing));
    if (diff > CONE) continue;
    // Prefer closer + better-aligned
    const score = d + diff * 120;
    if (score < bestScore) {
      bestScore = score;
      best = z;
    }
  }
  return best;
}

// Soft facing rotation when idle: gently face nearest zombie within range.
function applyProximityFacing(s: GameState, dt: number) {
  const NEAR = 220;
  let nearest: Zombie | null = null;
  let nd = Infinity;
  for (const z of s.zombies) {
    if (z.hp <= 0) continue;
    const d = dist(z.pos, s.player.pos);
    if (d < nd) {
      nd = d;
      nearest = z;
    }
  }
  if (!nearest || nd > NEAR) return;
  const target = Math.atan2(
    nearest.pos.y - s.player.pos.y,
    nearest.pos.x - s.player.pos.x,
  );
  const diff = angleDiff(target, s.player.facing);
  // 6 rad/s assist turn
  const max = 6 * dt;
  s.player.facing += clamp(diff, -max, max);
}

function fireOne(s: GameState) {
  if (s.player.ammo < 1) return;
  s.player.ammo -= 1;
  const damage = upgradeValue("attack", s.upgrades.attack);
  // Aim assist: pick a target in cone, otherwise shoot straight ahead.
  const target = findAimTarget(s);
  let angle = s.player.facing;
  if (target) {
    angle = Math.atan2(
      target.pos.y - s.player.pos.y,
      target.pos.x - s.player.pos.x,
    );
    // Don't snap facing fully; nudge toward it for visual feedback.
    s.player.facing = angle;
  }
  const bspeed = 540;
  s.bullets.push({
    id: s.nextId++,
    pos: { x: s.player.pos.x, y: s.player.pos.y },
    vel: {
      x: Math.cos(angle) * bspeed,
      y: Math.sin(angle) * bspeed,
    },
    radius: 4,
    ttl: 1.2,
    damage,
  });
}

export function tick(s: GameState, dt: number) {
  if (s.status !== "playing") return;

  // Spawning
  if (s.spawnQueue > 0) {
    s.spawnCd -= dt;
    if (s.spawnCd <= 0) {
      spawnZombie(s);
      s.spawnQueue -= 1;
      s.spawnCd = Math.max(0.45, 1.4 - s.wave * 0.04);
    }
  }

  // Player movement
  const moveSpeed = upgradeValue("moveSpeed", s.upgrades.moveSpeed);
  const inLen = Math.hypot(s.input.x, s.input.y);
  if (inLen > 0.05) {
    const nx = s.input.x / Math.max(inLen, 1);
    const ny = s.input.y / Math.max(inLen, 1);
    s.player.pos.x += nx * moveSpeed * dt;
    s.player.pos.y += ny * moveSpeed * dt;
    // Face movement direction (input-driven).
    s.player.facing = Math.atan2(ny, nx);
  } else {
    // Idle: apply proximity aim assist
    applyProximityFacing(s, dt);
  }
  s.player.pos.x = clamp(s.player.pos.x, 16, s.arena.width - 16);
  s.player.pos.y = clamp(s.player.pos.y, 16, s.arena.height - 16);

  // Ammo regen — only kicks in when fully empty (acts like a fast auto-reload).
  if (s.player.ammo <= 0 && !s.player.reloading) {
    s.player.reloading = true;
    s.player.ammoAcc = 0;
  }
  if (s.player.reloading) {
    s.player.ammoAcc += upgradeValue("ammoRegen", s.upgrades.ammoRegen) * dt;
    while (s.player.ammoAcc >= 1) {
      s.player.ammoAcc -= 1;
      if (s.player.ammo < s.player.maxAmmo) s.player.ammo += 1;
    }
    if (s.player.ammo >= s.player.maxAmmo) {
      s.player.reloading = false;
      s.player.ammoAcc = 0;
    }
  }

  // Firing
  s.player.fireCd = Math.max(0, s.player.fireCd - dt);
  const wantFire = s.fireHeld || s.fireQueued;
  if (wantFire && s.player.fireCd <= 0 && s.player.ammo > 0) {
    fireOne(s);
    s.player.fireCd = s.fireHeld ? AUTO_FIRE_INTERVAL : BASE_FIRE_INTERVAL;
    s.fireQueued = false; // consumed
  }

  // Bullets
  for (const b of s.bullets) {
    b.pos.x += b.vel.x * dt;
    b.pos.y += b.vel.y * dt;
    b.ttl -= dt;
  }
  s.bullets = s.bullets.filter(
    (b) =>
      b.ttl > 0 &&
      b.pos.x > -10 &&
      b.pos.x < s.arena.width + 10 &&
      b.pos.y > -10 &&
      b.pos.y < s.arena.height + 10,
  );

  // Bullet vs zombie collisions
  for (const b of s.bullets) {
    for (const z of s.zombies) {
      if (z.hp <= 0) continue;
      const d = dist(b.pos, z.pos);
      if (d < z.radius + b.radius) {
        z.hp -= b.damage;
        z.hitFlash = 0.1;
        b.ttl = 0;
        spawnParticles(s, b.pos, "#FFFFFF", 3, 80);
        break;
      }
    }
  }
  s.bullets = s.bullets.filter((b) => b.ttl > 0);

  // Zombie movement & damage
  const armorReduction = upgradeValue("armor", s.upgrades.armor);
  for (const z of s.zombies) {
    if (z.hp <= 0) continue;
    const dToRig = dist(z.pos, s.rig.pos);
    const dToPlayer = dist(z.pos, s.player.pos);
    const target = dToPlayer < dToRig - 60 ? s.player.pos : s.rig.pos;
    const a = Math.atan2(target.y - z.pos.y, target.x - z.pos.x);
    z.vel.x = Math.cos(a) * z.speed;
    z.vel.y = Math.sin(a) * z.speed;
    z.pos.x += z.vel.x * dt;
    z.pos.y += z.vel.y * dt;
    z.hitFlash = Math.max(0, z.hitFlash - dt);

    if (dToRig < z.radius + s.rig.radius) {
      s.rig.hp -= z.damage;
      s.rig.damageFlash = 0.25;
      s.flash.rig = 0.3;
      z.hp = -1;
      spawnParticles(s, z.pos, "#00FFFF", 6, 110);
    }
    if (dToPlayer < z.radius + 14) {
      const dmg = z.damage * dt * 2.4 * (1 - armorReduction);
      s.player.hp -= dmg;
      s.player.damageFlash = 0.18;
      s.flash.screen = 0.25;
    }
  }

  // Kill dead zombies, drop scrap
  for (const z of s.zombies) {
    if (z.hp <= 0) {
      s.stats.kills += 1;
      spawnParticles(s, z.pos, "#39FF14", 10, 120);
      s.scraps.push({
        id: s.nextId++,
        pos: { x: z.pos.x, y: z.pos.y },
        vel: { x: 0, y: 0 },
        radius: 6,
        value: z.reward,
        ttl: 12,
      });
    }
  }
  s.zombies = s.zombies.filter((z) => z.hp > 0);

  // Scrap magnet & pickup
  const pickup = upgradeValue("pickupRadius", s.upgrades.pickupRadius);
  for (const sc of s.scraps) {
    const d = dist(sc.pos, s.player.pos);
    if (d < pickup) {
      const a = Math.atan2(s.player.pos.y - sc.pos.y, s.player.pos.x - sc.pos.x);
      const pull = 220 + (pickup - d) * 3;
      sc.pos.x += Math.cos(a) * pull * dt;
      sc.pos.y += Math.sin(a) * pull * dt;
    }
    sc.ttl -= dt;
    if (d < 16) {
      s.scrap += sc.value;
      s.stats.totalScrap += sc.value;
      sc.ttl = -1;
      spawnParticles(s, sc.pos, "#F39C12", 4, 60);
    }
  }
  s.scraps = s.scraps.filter((sc) => sc.ttl > 0);

  // Particles
  for (const p of s.particles) {
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.vel.x *= 0.92;
    p.vel.y *= 0.92;
    p.ttl -= dt;
  }
  s.particles = s.particles.filter((p) => p.ttl > 0);

  // Flashes
  s.flash.screen = Math.max(0, s.flash.screen - dt);
  s.flash.rig = Math.max(0, s.flash.rig - dt);
  s.player.damageFlash = Math.max(0, s.player.damageFlash - dt);
  s.rig.damageFlash = Math.max(0, s.rig.damageFlash - dt);

  if (s.player.hp <= 0 || s.rig.hp <= 0) {
    s.player.hp = Math.max(0, s.player.hp);
    s.rig.hp = Math.max(0, s.rig.hp);
    s.status = "gameover";
    return;
  }

  if (s.spawnQueue === 0 && s.zombies.length === 0) {
    s.stats.wavesCleared += 1;
    const bonus = 8 + s.wave * 3;
    s.scrap += bonus;
    s.stats.totalScrap += bonus;
    s.status = "waveclear";
  }
}

export function applyUpgrade(s: GameState, key: keyof Upgrades): boolean {
  const cost = upgradeCost(key, s.upgrades[key]);
  if (s.scrap < cost) return false;
  s.scrap -= cost;
  s.upgrades[key] += 1;

  if (key === "health") {
    const newMax = upgradeValue("health", s.upgrades.health);
    const diff = newMax - s.player.maxHp;
    s.player.maxHp = newMax;
    s.player.hp = Math.min(newMax, s.player.hp + Math.max(0, diff));
  }
  if (key === "rigPlating") {
    const newMax = upgradeValue("rigPlating", s.upgrades.rigPlating);
    const diff = newMax - s.rig.maxHp;
    s.rig.maxHp = newMax;
    s.rig.hp = Math.min(newMax, s.rig.hp + Math.max(0, diff));
  }
  if (key === "ammoCap") {
    const newCap = upgradeValue("ammoCap", s.upgrades.ammoCap);
    const diff = newCap - s.player.maxAmmo;
    s.player.maxAmmo = newCap;
    s.player.ammo = Math.min(newCap, s.player.ammo + Math.max(0, diff));
  }
  return true;
}

export function repair(s: GameState) {
  s.player.hp = Math.min(s.player.maxHp, s.player.hp + s.player.maxHp * 0.15);
  s.rig.hp = Math.min(s.rig.maxHp, s.rig.hp + s.rig.maxHp * 0.1);
  s.player.ammo = s.player.maxAmmo;
}
