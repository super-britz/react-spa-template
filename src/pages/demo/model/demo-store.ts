import { create } from 'zustand'

export type Density = 'comfortable' | 'compact'

interface DemoStore {
  density: Density
  toggleDensity: () => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  density: 'comfortable',
  toggleDensity: () =>
    set((state) => ({ density: state.density === 'comfortable' ? 'compact' : 'comfortable' })),
}))
