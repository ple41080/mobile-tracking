import { useRoomStore } from '@/stores/roomStore'

export function useAppTheme() {
  const { tabBarColor, surfaceColor } = useRoomStore()

  return {
    bg: tabBarColor,
    surface: surfaceColor,
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,255,255,0.12)',
    accent: '#FFC94D',
  }
}
