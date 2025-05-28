<template>
  <transition name="alert-fade">
    <div 
      v-if="isVisible" 
      class="auto-dismiss-alert"
      :class="[`alert-${type}`]"
    >
      <div class="alert-icon">
        <el-icon v-if="type === 'success'"><CircleCheckFilled /></el-icon>
        <el-icon v-else-if="type === 'error'"><CircleCloseFilled /></el-icon>
        <el-icon v-else-if="type === 'warning'"><WarningFilled /></el-icon>
        <el-icon v-else><InfoFilled /></el-icon>
      </div>
      <div class="alert-content">
        <div class="alert-message">{{ message }}</div>
      </div>
      <div class="alert-close" @click="close">
        <el-icon><Close /></el-icon>
      </div>
      <div class="alert-progress">
        <div 
          class="alert-progress-bar" 
          :style="{ animationDuration: `${duration}ms` }"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  CircleCheckFilled, 
  CircleCloseFilled, 
  WarningFilled, 
  InfoFilled, 
  Close 
} from '@element-plus/icons-vue';

const props = defineProps({
  message: {
    type: String,
    required: true
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
  show: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const isVisible = ref(props.show);
let timer = null;

const close = () => {
  isVisible.value = false;
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
.auto-dismiss-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  min-width: 300px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--color-card);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--color-shadow);
  z-index: 9999;
  overflow: hidden;
}

.alert-success {
  border-left: 4px solid var(--color-success);
}

.alert-error {
  border-left: 4px solid #ef4444;
}

.alert-warning {
  border-left: 4px solid #f59e0b;
}

.alert-info {
  border-left: 4px solid var(--color-accent);
}

.alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.alert-success .alert-icon {
  color: var(--color-success);
}

.alert-error .alert-icon {
  color: #ef4444;
}

.alert-warning .alert-icon {
  color: #f59e0b;
}

.alert-info .alert-icon {
  color: var(--color-accent);
}

.alert-content {
  flex: 1;
}

.alert-message {
  font-size: 14px;
  color: var(--color-text);
}

.alert-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.alert-close:hover {
  color: var(--color-text);
}

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.1);
}

.alert-progress-bar {
  height: 100%;
  width: 100%;
  background-color: currentColor;
  transform-origin: left;
  animation: progress-shrink linear forwards;
}

.alert-success .alert-progress-bar {
  background-color: var(--color-success);
}

.alert-error .alert-progress-bar {
  background-color: #ef4444;
}

.alert-warning .alert-progress-bar {
  background-color: #f59e0b;
}

.alert-info .alert-progress-bar {
  background-color: var(--color-accent);
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Animation */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.3s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
