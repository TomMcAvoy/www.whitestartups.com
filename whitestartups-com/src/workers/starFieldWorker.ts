import * as Comlink from 'comlink'

// Define constellation patterns for the northern sky
const constellations = [
  // Ursa Major (Big Dipper)
  {
    name: 'Ursa Major',
    stars: [
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 200, y: 100 },
      { x: 250, y: 150 },
      { x: 300, y: 100 },
      { x: 350, y: 150 },
      { x: 400, y: 100 },
    ],
  },
  // Ursa Minor (Little Dipper) with Polaris (North Star)
  {
    name: 'Ursa Minor',
    stars: [
      { x: 500, y: 500 },
      { x: 550, y: 550 },
      { x: 600, y: 500 },
      { x: 650, y: 550 },
      { x: 700, y: 500 },
      { x: 750, y: 550 },
      { x: 800, y: 500 },
    ],
  },
]

// Function to draw a galaxy
function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  stars: number,
) {
  ctx.fillStyle = 'white'
  for (let i = 0; i < stars; i++) {
    const angle = Math.random() * 2 * Math.PI
    const radius = Math.random() * size
    const starX = x + radius * Math.cos(angle)
    const starY = y + radius * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(starX, starY, 1, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// Worker function to draw the star field
function drawStarField(canvas: OffscreenCanvas) {
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D
  if (!ctx) return

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw constellation stars
  const starSize = 4 // Assuming original size is 1
  constellations.forEach((constellation) => {
    constellation.stars.forEach((star) => {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(star.x, star.y, starSize, 0, 2 * Math.PI)
      ctx.fill()
    })
  })

  // Draw background galaxies
  drawGalaxy(ctx, 200, 200, 500, 50) // Example galaxy 1
  drawGalaxy(ctx, 600, 400, 500, 50) // Example galaxy 2

  // Draw additional stars with random colors
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 2
    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 80%)`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// Expose the drawStarField function to the main thread
Comlink.expose(drawStarField)
