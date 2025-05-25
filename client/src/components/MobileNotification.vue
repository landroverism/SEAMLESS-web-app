<template>
  <transition name="mobile-notification">
    <div 
      v-if="visible" 
      class="mobile-notification"
      :class="[`mobile-notification--${type}`, { 'with-action': !!actionText }]"
    >
      <div class="notification-icon">
        <el-icon v-if="type === 'success'"><CircleCheckFilled /></el-icon>
        <el-icon v-else-if="type === 'error'"><CircleCloseFilled /></el-icon>
        <el-icon v-else-if="type === 'warning'"><WarningFilled /></el-icon>
        <el-icon v-else><InfoFilled /></el-icon>
      </div>
      <div class="notification-content">
        <div class="notification-title">{{ title }}</div>
        <div v-if="message" class="notification-message">{{ message }}</div>
      </div>
      <div v-if="actionText" class="notification-action" @click="$emit('action')">
        {{ actionText }}
      </div>
      <div class="notification-close" @click="close">
        <el-icon><Close /></el-icon>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { CircleCheckFilled, CircleCloseFilled, WarningFilled, InfoFilled, Close } from '@element-plus/icons-vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  actionText: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'action']);

const visible = ref(props.show);
let timer = null;

const close = () => {
  visible.value = false;
  emit('close');
};

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
.mobile-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 400px;
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

.mobile-notification--success {
  border-left: 4px solid #10b981;
}

.mobile-notification--error {
  border-left: 4px solid #ef4444;
}

.mobile-notification--warning {
  border-left: 4px solid #f59e0b;
}

.mobile-notification--info {
  border-left: 4px solid #3b82f6;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.mobile-notification--success .notification-icon {
  color: #10b981;
}

.mobile-notification--error .notification-icon {
  color: #ef4444;
}

.mobile-notification--warning .notification-icon {
  color: #f59e0b;
}

.mobile-notification--info .notification-icon {
  color: #3b82f6;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
  color: #333;
}

.notification-message {
  font-size: 12px;
  color: #666;
}

.notification-action {
  margin-left: 12px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  cursor: pointer;
}

.notification-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 8px;
  color: #999;
  cursor: pointer;
}

.with-action .notification-close {
  margin-left: 4px;
}

/* Animation */
.mobile-notification-enter-active,
.mobile-notification-leave-active {
  transition: all 0.3s ease;
}

.mobile-notification-enter-from,
.mobile-notification-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
