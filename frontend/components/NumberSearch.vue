<template>
  <div class="relative">
    <input
      :value="modelValue"
      type="tel"
      :placeholder="placeholder"
      maxlength="11"
      :class="inputClass"
      dir="ltr"
      @input="onInput"
      @keyup.enter="$emit('search')"
    />
    <button
      type="button"
      class="absolute left-2 top-1/2 -translate-y-1/2 bg-irancell-yellow hover:bg-irancell-yellow-dark text-irancell-black p-2 rounded-lg transition shadow-sm"
      @click="$emit('search')"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  variant?: 'default' | 'hero'
}>(), {
  variant: 'default',
})

const emit = defineEmits<{ 'update:modelValue': [value: string]; search: [] }>()

const inputClass = computed(() => {
  const base = 'w-full rounded-xl px-4 py-3 pl-12 text-center text-xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-irancell-yellow transition'
  if (props.variant === 'hero') {
    return `${base} bg-white text-irancell-black placeholder:text-gray-400 border-0 shadow-lg`
  }
  return `${base} input-field`
})

const onInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11)
  emit('update:modelValue', val)
}
</script>
