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
  damage: 1,
  fireRate: 1,
  playerMaxHp: 1,
  rigMaxHp: 1,
  moveSpeed: 1,
  pickupRadius: 1,
};

export function upgradeValue(key: keyof Upgrades, level: number): number {
  // Effective magnitude per upgrade.
  switch (key) {
    case "damage":
      return 10 + (level - 1) * 6; // bullet damage
    case "fireRate":
      return 0.45 - Math.min(0.35, (level - 1) * 0.04); // seconds between shots (lower better)
    case "playerMaxHp":
      return 100 + (level - 1) * 25;
    case "rigMaxHp":
      return 300 + (level - 1) * 80;
    case "moveSpeed":
      return 150 + (level - 1) * 15; // px/s
    case "pickupRadius":
      return 60 + (level - 1) * 18;
  }
}

export function upgradeCost(key: keyof Upgrades, level: number): number {
  const base: Record<keyof Upgrades, number> = {
    damage: 18,
    fireRate: 22,
    playerMaxHp: 15,
    rigMaxHp: 20,
    moveSpeed: 14,
    pickupRadius: 12,
  };
  return Math.round(base[key] * Math.pow(1.55, level - 1));
}

export const UPGRADE_META: Record<
  keyof Upgrades,
  { label: string; sub: string; icon: { family: string; name: string }; color: string }
> = {
  damage: {
    label: "DAMAGE",
    sub: "Bullet impact",
    icon: { family: "MaterialCommunityIcons", name: "ammunition" },
    color: "#FF2A2A",
  },
  fireRate: {
    label: "FIRE RATE",
    sub: "Shots per second",
    icon: { family: "MaterialCommunityIcons", name: "fire" },
    color: "#D35400",
  },
  playerMaxHp: {
    label: "ARMOR",
    sub: "Operator HP",
    icon: { family: "FontAwesome5", name: "heartbeat" },
    color: "#39FF14",
  },
  rigMaxHp: {
    label: "RIG PLATING",
    sub: "Reactor integrity",
    icon: { family: "Ionicons", name: "nuclear" },
    color: "#00FFFF",
  },
  moveSpeed: {
    label: "MOBILITY",
    sub: "Boot servos",
    icon: { family: "MaterialCommunityIcons", name: "run-fast" },
    color: "#EAEAEA",
  },
  pickupRadius: {
    label: "MAGNETIZER",
    sub: "Scrap radius",
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
  input: Vec2;
  nextId: number;
};

export function createState(width: number, height: number): GameState {
  const upgrades = { ...BASE_UPGRADES };
  const playerMaxHp = upgradeValue("playerMaxHp", upgrades.playerMaxHp);
  const rigMaxHp = upgradeValue("rigMaxHp", upgrades.rigMaxHp);
  return {
    arena: { width, height },
    player: {
      pos: { x: width / 2 + 80, y: height / 2 },
      facing: 0,
      hp: playerMaxHp,
      maxHp: playerMaxHp,
      fireCd: 0,
      damageFlash: 0,
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
    nextId: 1,
  };
}

export function startWave(s: GameState) {
  s.wave += 1;
  // Zombies per wave
  const count = 6 + Math.floor(s.wave * 2.2);
  s.spawnQueue = count;
  s.spawnCd = 0.6;
  s.status = "playing";
}

function spawnZombie(s: GameState) {
  const { width, height } = s.arena;
  // Spawn from a random edge
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
    // Brute
    hp = 60 * waveScale;
    speed = 35 + s.wave * 1.5;
    radius = 20;
    reward = 7;
    damage = 14;
    color = "#7DBE00";
  } else if (tier > 0.7) {
    // Runner
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
    // hack: attach color via cast below
    // @ts-ignore
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

export function tick(s: GameState, dt: number) {
  if (s.status !== "playing") return;

  // Spawning
  if (s.spawnQueue > 0) {
    s.spawnCd -= dt;
    if (s.spawnCd <= 0) {
      spawnZombie(s);
      s.spawnQueue -= 1;
      // Spawn faster as waves progress
      s.spawnCd = Math.max(0.18, 0.7 - s.wave * 0.025);
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
    s.player.facing = Math.atan2(ny, nx);
  }
  s.player.pos.x = clamp(s.player.pos.x, 16, s.arena.width - 16);
  s.player.pos.y = clamp(s.player.pos.y, 16, s.arena.height - 16);

  // Auto-aim & fire
  const fireRate = upgradeValue("fireRate", s.upgrades.fireRate); // seconds between shots
  const damage = upgradeValue("damage", s.upgrades.damage);
  s.player.fireCd -= dt;
  if (s.zombies.length > 0) {
    let nearest: Zombie | null = null;
    let nd = Infinity;
    for (const z of s.zombies) {
      const d = dist(z.pos, s.player.pos);
      if (d < nd) {
        nd = d;
        nearest = z;
      }
    }
    if (nearest && nd < 500) {
      s.player.facing = Math.atan2(nearest.pos.y - s.player.pos.y, nearest.pos.x - s.player.pos.x);
      if (s.player.fireCd <= 0) {
        s.player.fireCd = fireRate;
        const bspeed = 520;
        s.bullets.push({
          id: s.nextId++,
          pos: { x: s.player.pos.x, y: s.player.pos.y },
          vel: {
            x: Math.cos(s.player.facing) * bspeed,
            y: Math.sin(s.player.facing) * bspeed,
          },
          radius: 4,
          ttl: 1.2,
          damage,
        });
      }
    }
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
  for (const z of s.zombies) {
    if (z.hp <= 0) continue;
    // Target: RIG primarily, but if player closer they may swat player
    const dToRig = dist(z.pos, s.rig.pos);
    const dToPlayer = dist(z.pos, s.player.pos);
    const target = dToPlayer < dToRig - 60 ? s.player.pos : s.rig.pos;
    const a = Math.atan2(target.y - z.pos.y, target.x - z.pos.x);
    z.vel.x = Math.cos(a) * z.speed;
    z.vel.y = Math.sin(a) * z.speed;
    z.pos.x += z.vel.x * dt;
    z.pos.y += z.vel.y * dt;
    z.hitFlash = Math.max(0, z.hitFlash - dt);

    // RIG damage
    if (dToRig < z.radius + s.rig.radius) {
      s.rig.hp -= z.damage;
      s.rig.damageFlash = 0.25;
      s.flash.rig = 0.3;
      z.hp = -1;
      spawnParticles(s, z.pos, "#00FFFF", 6, 110);
    }
    // Player damage
    if (dToPlayer < z.radius + 14) {
      s.player.hp -= z.damage * dt * 2.4; // continuous contact
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

  // Flashes & cooldown decays
  s.flash.screen = Math.max(0, s.flash.screen - dt);
  s.flash.rig = Math.max(0, s.flash.rig - dt);
  s.player.damageFlash = Math.max(0, s.player.damageFlash - dt);
  s.rig.damageFlash = Math.max(0, s.rig.damageFlash - dt);

  // Death check
  if (s.player.hp <= 0 || s.rig.hp <= 0) {
    s.player.hp = Math.max(0, s.player.hp);
    s.rig.hp = Math.max(0, s.rig.hp);
    s.status = "gameover";
    return;
  }

  // Wave clear
  if (s.spawnQueue === 0 && s.zombies.length === 0) {
    s.stats.wavesCleared += 1;
    // Wave bonus
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

  // Apply effects that change current maxima
  if (key === "playerMaxHp") {
    const newMax = upgradeValue("playerMaxHp", s.upgrades.playerMaxHp);
    const diff = newMax - s.player.maxHp;
    s.player.maxHp = newMax;
    s.player.hp = Math.min(newMax, s.player.hp + Math.max(0, diff));
  }
  if (key === "rigMaxHp") {
    const newMax = upgradeValue("rigMaxHp", s.upgrades.rigMaxHp);
    const diff = newMax - s.rig.maxHp;
    s.rig.maxHp = newMax;
    s.rig.hp = Math.min(newMax, s.rig.hp + Math.max(0, diff));
  }
  return true;
}

export function repair(s: GameState) {
  // Free small repair between waves (10% each)
  s.player.hp = Math.min(s.player.maxHp, s.player.hp + s.player.maxHp * 0.15);
  s.rig.hp = Math.min(s.rig.maxHp, s.rig.hp + s.rig.maxHp * 0.1);
}
