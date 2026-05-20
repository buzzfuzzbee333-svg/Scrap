export type Vec2 = { x: number; y: number };

export type Entity = {
  id: number;
  pos: Vec2;
  vel: Vec2;
  radius: number;
};

export type Zombie = Entity & {
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  reward: number;
  hitFlash: number;
};

export type Bullet = Entity & {
  ttl: number;
  damage: number;
};

export type Scrap = Entity & {
  value: number;
  ttl: number;
};

export type Particle = {
  id: number;
  pos: Vec2;
  vel: Vec2;
  ttl: number;
  maxTtl: number;
  color: string;
  size: number;
};

export type Upgrades = {
  attack: number;
  health: number;
  armor: number;
  rigPlating: number;
  ammoCap: number;
  ammoRegen: number;
  moveSpeed: number;
  pickupRadius: number;
};

export const UPGRADE_KEYS: (keyof Upgrades)[] = [
  "attack",
  "health",
  "armor",
  "ammoCap",
  "ammoRegen",
  "rigPlating",
  "moveSpeed",
  "pickupRadius",
];

export type GameStatus = "playing" | "paused" | "shop" | "gameover" | "waveclear";
