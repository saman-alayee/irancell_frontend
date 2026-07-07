<template>
  <div :class="alignClass">
    <p class="text-green-600 dark:text-green-400 mb-1" :class="noteClass">
      هزینه فعالسازی و ارسال: <span class="font-bold">رایگان</span>
    </p>
    <p v-if="label" class="text-muted mb-1" :class="labelClass">{{ label }}</p>
    <p :class="priceClass">{{ formatPrice(price) }}</p>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/composables/useApi'

const props = withDefaults(defineProps<{
  price: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  align?: 'start' | 'center' | 'end'
}>(), {
  size: 'md',
  align: 'center',
})

const alignClass = computed(() => ({
  start: 'text-right',
  center: 'text-center',
  end: 'text-left',
}[props.align]))

const noteClass = computed(() => ({
  sm: 'text-[10px] leading-tight',
  md: 'text-xs',
  lg: 'text-sm',
}[props.size]))

const labelClass = computed(() => ({
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
}[props.size]))

const priceClass = computed(() => ({
  sm: 'font-bold text-base',
  md: 'font-bold text-lg',
  lg: 'text-4xl font-black text-heading',
}[props.size]))
</script>
