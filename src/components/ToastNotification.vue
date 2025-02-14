<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
          {{ toast.message }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  data() {
    return {
      toasts: [],
    }
  },
  methods: {
    showToast(message, type = 'info') {
      if (type === 'clear') {
        this.toasts = []
        return
      }

      const toast = {
        id: Date.now(),
        message,
        type,
      }
      this.toasts.push(toast)
      setTimeout(() => {
        this.removeToast(toast.id)
      }, 3000)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  border-radius: 50px;
  background: #282828;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  transition: all 0.3s ease;
  border: 1px solid #404040;
}

.toast-message {
  color: #ffffff;
  font-weight: 500;
}

.toast.success {
  background: #1db954;
  color: white;
  border-color: #1ed760;
}

.toast.error {
  background: #e91429;
  color: white;
  border-color: #ff1430;
}

.toast.info {
  background: #2e77d0;
  color: white;
  border-color: #3498db;
}

.toast.warning {
  background: #ff9800;
  color: white;
  border-color: #ffa726;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ffffff;
}

/* Анимации */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Анимация появления */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast {
  animation: slideIn 0.3s ease forwards;
}
</style>
