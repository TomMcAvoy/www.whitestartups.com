import * as Comlink from 'comlink'
import * as THREE from 'three'
import { TunnelEffectWorker } from '../types/tunnelEffectWorkerTypes'

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined

const tunnelEffectWorker: TunnelEffectWorker = {
  async initializeCanvas(
    canvas: OffscreenCanvas,
    width: number,
    height: number,
    transfer: Transferable[],
  ): Promise<void> {
    console.log('initializeCanvas called with parameters:', { width, height })

    try {
      renderer = new THREE.WebGLRenderer({ canvas })
      renderer.setSize(width, height)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      camera.position.z = 200 // Move the camera further away

      console.log('Canvas initialized')
    } catch (error) {
      console.error('Error initializing canvas:', error)
    }
  },

  async renderRing(index: number, numRings: number) {
    console.log('renderRing called with parameters:', { index, numRings })

    if (!renderer || !scene || !camera) {
      console.error('Renderer, scene, or camera is not initialized.')
      return
    }

    try {
      const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
      const maxRadius = Math.min(renderer.domElement.width, renderer.domElement.height) / 2
      const ringWidth = maxRadius / numRings
      const color = colors[index % colors.length]
      const radius = maxRadius - index * ringWidth
      const rotation = (index * Math.PI) / 6

      const geometry = new THREE.TorusGeometry(radius, ringWidth / 2, 8, 50)
      const material = new THREE.MeshBasicMaterial({ color })
      const torus = new THREE.Mesh(geometry, material)
      torus.rotation.x = Math.PI / 2
      torus.rotation.z = rotation
      torus.position.z = -index * ringWidth // Position the rings along the z-axis
      scene.add(torus)

      try {
        // Render the scene once
        renderer.render(scene, camera)
      } catch (error) {
        console.error('Error in renderRing:', error)
      }
    } catch (error) {
      console.error('Error in renderRing:', error)
    }
  },
}

Comlink.expose(tunnelEffectWorker)
