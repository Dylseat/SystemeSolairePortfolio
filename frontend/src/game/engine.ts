// Logique du mini-jeu, sans affichage : la même pour la 3D et la 2D.
// Le monde est un plan : x de gauche à droite, y du bas (le joueur) vers le haut (les ennemis).

export const WORLD = { width: 12, height: 16 }

const PLAYER_RADIUS = 0.45
const PLAYER_SPEED = 8
const PLAYER_MIN_Y = 0.8
const PLAYER_MAX_Y = 7

const FIRE_COOLDOWN = 0.18
const BULLET_SPEED = 16
const BULLET_RADIUS = 0.15
const ENEMY_BULLET_SPEED = 6
const ENEMY_BULLET_RADIUS = 0.18

const START_LIVES = 3
const INVULNERABLE_TIME = 1.5
const WAVE_PAUSE = 1.5
export const EXPLOSION_TIME = 0.5
// Un tireur qui reste trop longtemps finit par repartir, pour ne pas bloquer la vague
const SHOOTER_HOLD_TIME = 8

export type EnemyKind = 'drone' | 'zigzag' | 'tireur'

const ENEMIES: Record<EnemyKind, { radius: number; hp: number; points: number }> = {
  drone: { radius: 0.5, hp: 1, points: 100 },
  zigzag: { radius: 0.5, hp: 1, points: 150 },
  tireur: { radius: 0.6, hp: 2, points: 250 },
}

export type Enemy = {
  id: number
  kind: EnemyKind
  x: number
  y: number
  baseX: number
  age: number
  hp: number
  speed: number
  stopY: number
  fireTimer: number
}

export type Bullet = { x: number; y: number; vx: number; vy: number }

export type Explosion = { x: number; y: number; age: number }

export type GameState = {
  player: { x: number; y: number; cooldown: number; invulnerable: number }
  bullets: Bullet[]
  enemyBullets: Bullet[]
  enemies: Enemy[]
  explosions: Explosion[]
  score: number
  lives: number
  wave: number
  toSpawn: EnemyKind[]
  spawnTimer: number
  wavePause: number
  over: boolean
  nextId: number
  random: () => number
}

export type GameInput = {
  // Direction au clavier, de -1 à 1
  dx: number
  dy: number
  fire: boolean
}

export const NO_INPUT: GameInput = { dx: 0, dy: 0, fire: false }

// Générateur pseudo-aléatoire avec graine (mulberry32) : des parties reproductibles dans les tests
function seededRandom(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createGame(seed = Date.now()): GameState {
  const state: GameState = {
    player: { x: 0, y: 2, cooldown: 0, invulnerable: 0 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    explosions: [],
    score: 0,
    lives: START_LIVES,
    wave: 0,
    toSpawn: [],
    spawnTimer: 0,
    wavePause: 0,
    over: false,
    nextId: 1,
    random: seededRandom(seed),
  }
  startWave(state)
  return state
}

// Composition d'une vague : plus nombreuse et plus variée à chaque fois
export function waveEnemies(wave: number, random: () => number): EnemyKind[] {
  const count = 5 + wave * 2
  const kinds: EnemyKind[] = []
  for (let i = 0; i < count; i++) {
    const roll = random()
    if (wave >= 3 && roll < 0.2) kinds.push('tireur')
    else if (wave >= 2 && roll < 0.55) kinds.push('zigzag')
    else kinds.push('drone')
  }
  return kinds
}

function startWave(state: GameState) {
  state.wave += 1
  state.toSpawn = waveEnemies(state.wave, state.random)
  state.spawnTimer = 0
  state.wavePause = WAVE_PAUSE
}

function waveSpeed(wave: number) {
  return 1 + (wave - 1) * 0.12
}

function spawnInterval(wave: number) {
  return Math.max(0.35, 1 - wave * 0.06)
}

function spawnEnemy(state: GameState, kind: EnemyKind) {
  const margin = 1
  const x = (state.random() * 2 - 1) * (WORLD.width / 2 - margin)
  state.enemies.push({
    id: state.nextId++,
    kind,
    x,
    y: WORLD.height + 1,
    baseX: x,
    age: 0,
    hp: ENEMIES[kind].hp,
    speed: waveSpeed(state.wave),
    stopY: 10 + state.random() * 3,
    fireTimer: 1 + state.random(),
  })
}

function moveEnemy(state: GameState, enemy: Enemy, dt: number) {
  enemy.age += dt
  switch (enemy.kind) {
    case 'drone':
      enemy.y -= 2.2 * enemy.speed * dt
      break
    case 'zigzag':
      enemy.y -= 1.8 * enemy.speed * dt
      enemy.x = enemy.baseX + Math.sin(enemy.age * 2.5) * 2
      break
    case 'tireur': {
      const holding = enemy.y <= enemy.stopY && enemy.age < SHOOTER_HOLD_TIME
      if (!holding) enemy.y -= 1.6 * enemy.speed * dt
      // Il vise le joueur
      enemy.fireTimer -= dt
      if (enemy.fireTimer <= 0 && enemy.y < WORLD.height) {
        const dx = state.player.x - enemy.x
        const dy = state.player.y - enemy.y
        const length = Math.hypot(dx, dy) || 1
        const speed = ENEMY_BULLET_SPEED * enemy.speed
        state.enemyBullets.push({
          x: enemy.x,
          y: enemy.y - 0.5,
          vx: (dx / length) * speed,
          vy: (dy / length) * speed,
        })
        enemy.fireTimer = 1.6 / enemy.speed
      }
      break
    }
  }
}

function touches(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  return Math.hypot(ax - bx, ay - by) < ar + br
}

function hitPlayer(state: GameState) {
  if (state.player.invulnerable > 0) return
  state.lives -= 1
  state.player.invulnerable = INVULNERABLE_TIME
  state.explosions.push({ x: state.player.x, y: state.player.y, age: 0 })
  if (state.lives <= 0) state.over = true
}

function movePlayer(state: GameState, input: GameInput, dt: number) {
  const { player } = state
  // En diagonale, ne pas aller plus vite qu'en ligne droite
  const length = Math.hypot(input.dx, input.dy)
  const scale = length > 1 ? 1 / length : 1
  player.x += input.dx * scale * PLAYER_SPEED * dt
  player.y += input.dy * scale * PLAYER_SPEED * dt

  const halfWidth = WORLD.width / 2 - PLAYER_RADIUS
  player.x = Math.min(halfWidth, Math.max(-halfWidth, player.x))
  player.y = Math.min(PLAYER_MAX_Y, Math.max(PLAYER_MIN_Y, player.y))
}

// Avance le jeu de `dt` secondes. L'état est modifié sur place (plus léger à chaque image)
export function step(state: GameState, input: GameInput, dt: number): GameState {
  if (state.over) return state
  // Onglet en arrière-plan : ne pas rattraper d'un coup tout le temps écoulé
  dt = Math.min(dt, 0.05)

  const { player } = state
  movePlayer(state, input, dt)
  player.cooldown = Math.max(0, player.cooldown - dt)
  player.invulnerable = Math.max(0, player.invulnerable - dt)

  if (input.fire && player.cooldown === 0) {
    state.bullets.push({ x: player.x, y: player.y + 0.6, vx: 0, vy: BULLET_SPEED })
    player.cooldown = FIRE_COOLDOWN
  }

  // Apparition des ennemis de la vague, après la pause d'annonce
  if (state.wavePause > 0) {
    state.wavePause = Math.max(0, state.wavePause - dt)
  } else if (state.toSpawn.length > 0) {
    state.spawnTimer -= dt
    if (state.spawnTimer <= 0) {
      spawnEnemy(state, state.toSpawn.shift()!)
      state.spawnTimer = spawnInterval(state.wave)
    }
  }

  for (const bullet of [...state.bullets, ...state.enemyBullets]) {
    bullet.x += bullet.vx * dt
    bullet.y += bullet.vy * dt
  }
  for (const enemy of state.enemies) moveEnemy(state, enemy, dt)

  // Tirs du joueur contre les ennemis
  for (const bullet of state.bullets) {
    const enemy = state.enemies.find(
      (enemy) =>
        enemy.hp > 0 &&
        touches(bullet.x, bullet.y, BULLET_RADIUS, enemy.x, enemy.y, ENEMIES[enemy.kind].radius),
    )
    if (!enemy) continue
    bullet.y = Infinity
    enemy.hp -= 1
    if (enemy.hp === 0) {
      state.score += ENEMIES[enemy.kind].points
      state.explosions.push({ x: enemy.x, y: enemy.y, age: 0 })
    }
  }

  // Ennemis et tirs ennemis contre le joueur
  for (const enemy of state.enemies) {
    if (enemy.hp > 0 && touches(player.x, player.y, PLAYER_RADIUS, enemy.x, enemy.y, ENEMIES[enemy.kind].radius)) {
      enemy.hp = 0
      state.explosions.push({ x: enemy.x, y: enemy.y, age: 0 })
      hitPlayer(state)
    }
  }
  for (const bullet of state.enemyBullets) {
    if (touches(player.x, player.y, PLAYER_RADIUS, bullet.x, bullet.y, ENEMY_BULLET_RADIUS)) {
      bullet.y = -Infinity
      hitPlayer(state)
    }
  }

  for (const explosion of state.explosions) explosion.age += dt

  // Ménage : tout ce qui est détruit ou sorti de l'écran
  const inside = (bullet: Bullet) =>
    bullet.y > -1 && bullet.y < WORLD.height + 2 && Math.abs(bullet.x) < WORLD.width
  state.bullets = state.bullets.filter(inside)
  state.enemyBullets = state.enemyBullets.filter(inside)
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.y > -1.5)
  state.explosions = state.explosions.filter((explosion) => explosion.age < EXPLOSION_TIME)

  if (!state.over && state.toSpawn.length === 0 && state.enemies.length === 0) startWave(state)

  return state
}
