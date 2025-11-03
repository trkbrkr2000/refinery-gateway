import { ref, h, render, type VNode } from 'vue'
import Toast from '~/components/molecules/Toast.vue'

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  action?: {
    label: string
    callback: () => void
    dismiss?: boolean
  }
  duration?: number
}

interface ToastInstance {
  id: string
  vnode: VNode
  container: HTMLDivElement
}

const toasts = ref<ToastInstance[]>([])

export const useToast = () => {
  const show = (options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const container = document.createElement('div')
    container.id = id
    document.body.appendChild(container)

    const handleClose = () => {
      // Remove from array
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }

      // Remove from DOM
      setTimeout(() => {
        if (container.parentNode) {
          render(null, container)
          container.parentNode.removeChild(container)
        }
      }, 300)
    }

    const vnode = h(Toast, {
      ...options,
      onClose: handleClose
    })

    render(vnode, container)

    toasts.value.push({ id, vnode, container })

    return {
      close: handleClose
    }
  }

  const success = (title: string, message?: string, duration?: number) => {
    return show({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, action?: ToastOptions['action'], duration?: number) => {
    return show({ type: 'error', title, message, action, duration: duration ?? 0 }) // Errors don't auto-close by default
  }

  const warning = (title: string, message?: string, duration?: number) => {
    return show({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    return show({ type: 'info', title, message, duration })
  }

  const clearAll = () => {
    toasts.value.forEach(toast => {
      if (toast.container.parentNode) {
        render(null, toast.container)
        toast.container.parentNode.removeChild(toast.container)
      }
    })
    toasts.value = []
  }

  return {
    show,
    success,
    error,
    warning,
    info,
    clearAll
  }
}
