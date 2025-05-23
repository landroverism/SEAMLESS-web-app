<template>
  <div class="currency-selector">
    <el-dropdown trigger="click" @command="changeCurrency">
      <span class="currency-dropdown-link">
        {{ currentCurrencySymbol }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-for="currency in currencies" 
            :key="currency.code" 
            :command="currency.code"
            :class="{ 'is-active': currentCurrency === currency.code }"
          >
            <span class="currency-option">
              <span class="currency-symbol">{{ currency.symbol }}</span>
              <span class="currency-name">{{ currency.name }}</span>
              <span class="currency-code">({{ currency.code }})</span>
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import currencyService from '../services/currency.service';

const currencies = ref([]);
const currentCurrency = ref('KES');

const currentCurrencySymbol = computed(() => {
  const config = currencyService.getCurrencyConfig(currentCurrency.value);
  return config.symbol;
});

const changeCurrency = (currencyCode) => {
  currentCurrency.value = currencyCode;
  currencyService.setPreferredCurrency(currencyCode);
  
  // Emit an event so parent components can react to currency changes
  emit('currency-changed', currencyCode);
};

const emit = defineEmits(['currency-changed']);

onMounted(() => {
  // Load available currencies
  currencies.value = currencyService.getAvailableCurrencies();
  
  // Set current currency from user preferences
  currentCurrency.value = currencyService.getPreferredCurrency();
});
</script>

<style scoped>
.currency-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--el-text-color-primary);
}

.currency-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.currency-symbol {
  font-weight: bold;
}

.currency-code {
  color: var(--el-text-color-secondary);
  font-size: 0.85em;
}

.is-active {
  color: var(--el-color-primary);
  font-weight: bold;
}
</style>
