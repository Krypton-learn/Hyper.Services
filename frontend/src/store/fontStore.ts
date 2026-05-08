import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  font: string
  isDarkMode: boolean
  primaryColor: string
  setFont: (font: string) => void
  setDarkMode: (isDarkMode: boolean) => void
  setPrimaryColor: (color: string) => void
}

export const useFontStore = create<ThemeState>()(
  persist(
    (set) => ({
      font: 'Tomorrow',
      isDarkMode: false,
      primaryColor: '#9810fa',
      setFont: (font) => set({ font }),
      setDarkMode: (isDarkMode) => set({ isDarkMode }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
    }),
    {
      name: 'theme-storage',
    }
  )
)