import * as Comlink from 'comlink'

const ringWorker = {
  renderRings() {
    const canvas = new OffscreenCanvas(800, 600)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 10 // 1cm thick rings (assuming 96 DPI)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radiusIncrement = 20 // Distance between rings

      for (let i = 1; i <= 8; i++) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, i * radiusIncrement, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }
    console.log('Rendering rings.')
  },
}

Comlink.expose(ringWorker)
