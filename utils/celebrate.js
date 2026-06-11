import confetti from 'canvas-confetti'

// Coral + cream + soft sky — Aurora Glass palette
const PALETTE = ['#F5664A', '#FF7E5F', '#FFD4B5', '#FFFFFF', '#B8DDFF']

export const celebrate = ({ origin } = {}) => {
  const defaults = {
    particleCount: 60,
    spread: 70,
    startVelocity: 32,
    ticks: 140,
    gravity: 0.9,
    scalar: 0.85,
    colors: PALETTE,
    origin: origin || { x: 0.5, y: 0.7 },
    disableForReducedMotion: true,
  }
  confetti(defaults)
}

export const celebrateBig = () => {
  confetti({
    particleCount: 140,
    spread: 100,
    startVelocity: 40,
    ticks: 200,
    gravity: 0.85,
    colors: PALETTE,
    origin: { x: 0.5, y: 0.65 },
    disableForReducedMotion: true,
  })
}
