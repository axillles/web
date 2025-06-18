import { inject } from 'vue'

export function useToast() {
  const showToast = inject('showToast')

  if (!showToast) {
    throw new Error('useToast() must be used within a component that provides showToast')
  }

  return {
    showToast
  }
}
