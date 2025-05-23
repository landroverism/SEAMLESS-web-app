<template>
  <span>{{ formattedAmount }}</span>
</template>

<script setup>
import { computed } from 'vue';
import currencyService from '../services/currency.service';

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: () => currencyService.getPreferredCurrency()
  }
});

const formattedAmount = computed(() => {
  return currencyService.format(props.amount, props.currency);
});
</script>
