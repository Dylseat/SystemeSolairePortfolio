import { EXPLOSION_TIME, WORLD, type GameState } from './engine'

// Dessin du jeu en 2D (canvas) : utilisé par la démo du panneau, et plus tard par la version mobile.
// Les tailles sont en unités du monde, comme dans la logique du jeu.

// Étoiles réparties de façon régulière (pas d'aléatoire : même ciel à chaque image)
const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: ((i * 37) % 100) / 100,
  y: ((i * 61) % 100) / 100,
  size: (i % 3) * 0.5 + 0.5,
}))

export function drawGame(
  ctx: CanvasRenderingContext2D,
  game: GameState,
  width: number,
  height: number,
  time: number,
) {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, width, height)

  // Les étoiles défilent vers le bas : le vaisseau semble avancer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  for (const star of STARS) {
    const y = ((star.y + time * 0.04 * star.size) % 1) * height
    ctx.fillRect(star.x * width, y, star.size, star.size)
  }

  const scale = Math.min(width / (WORLD.width + 1), height / (WORLD.height + 1))
  const toX = (x: number) => width / 2 + x * scale
  const toY = (y: number) => height - (y + 0.5) * scale

  // Bords du terrain
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(toX(-WORLD.width / 2), toY(WORLD.height), WORLD.width * scale, WORLD.height * scale)

  const shape = (x: number, y: number, angle: number, draw: () => void) => {
    ctx.save()
    ctx.translate(toX(x), toY(y))
    ctx.rotate(angle)
    ctx.scale(scale, scale)
    draw()
    ctx.restore()
  }

  for (const enemy of game.enemies) {
    switch (enemy.kind) {
      case 'drone':
        shape(enemy.x, enemy.y, enemy.age * 2, () => {
          ctx.fillStyle = '#f43f5e'
          ctx.beginPath()
          ctx.moveTo(0, -0.5)
          ctx.lineTo(0.4, 0)
          ctx.lineTo(0, 0.5)
          ctx.lineTo(-0.4, 0)
          ctx.closePath()
          ctx.fill()
        })
        break
      case 'zigzag':
        shape(enemy.x, enemy.y, 0, () => {
          ctx.strokeStyle = '#a855f7'
          ctx.lineWidth = 0.14
          ctx.beginPath()
          ctx.arc(0, 0, 0.35, 0, Math.PI * 2)
          ctx.stroke()
        })
        break
      case 'tireur':
        shape(enemy.x, enemy.y, enemy.age, () => {
          const radius = enemy.hp === 1 ? 0.48 : 0.6
          ctx.fillStyle = '#f59e0b'
          ctx.beginPath()
          for (let side = 0; side < 6; side++) {
            const angle = (side * Math.PI) / 3
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
          }
          ctx.closePath()
          ctx.fill()
        })
        break
    }
  }

  ctx.fillStyle = '#a5f3fc'
  for (const bullet of game.bullets) {
    ctx.fillRect(toX(bullet.x) - 0.06 * scale, toY(bullet.y) - 0.2 * scale, 0.12 * scale, 0.4 * scale)
  }
  ctx.fillStyle = '#fb7185'
  for (const bullet of game.enemyBullets) {
    ctx.beginPath()
    ctx.arc(toX(bullet.x), toY(bullet.y), 0.18 * scale, 0, Math.PI * 2)
    ctx.fill()
  }

  // Vaisseau du joueur, qui clignote pendant son invulnérabilité
  const { player } = game
  const blinking = player.invulnerable > 0 && Math.floor(time * 12) % 2 === 0
  if (!game.over && !blinking) {
    shape(player.x, player.y, 0, () => {
      ctx.fillStyle = '#fb923c'
      ctx.beginPath()
      ctx.arc(0, 0.45, 0.14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#22d3ee'
      ctx.beginPath()
      ctx.moveTo(0, -0.6)
      ctx.lineTo(0.5, 0.4)
      ctx.lineTo(-0.5, 0.4)
      ctx.closePath()
      ctx.fill()
    })
  }

  for (const explosion of game.explosions) {
    const progress = explosion.age / EXPLOSION_TIME
    ctx.fillStyle = `rgba(253, 186, 116, ${0.7 * (1 - progress)})`
    ctx.beginPath()
    ctx.arc(toX(explosion.x), toY(explosion.y), (0.2 + progress * 0.8) * scale, 0, Math.PI * 2)
    ctx.fill()
  }
}
