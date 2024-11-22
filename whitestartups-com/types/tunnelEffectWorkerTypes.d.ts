// types/tunnelEffectWorkerTypes.ts
export interface TunnelEffectWorker {
  initializeCanvas: (
    canvas: OffscreenCanvas,
    width: number,
    height: number,
    transfer: Transferable[],
  ) => Promise<void>
  renderRing: (index: number, numRings: number) => void
}
