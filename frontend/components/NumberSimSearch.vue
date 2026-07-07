<template>
  <div class="w-full">
    <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="flex-1 py-3 text-sm font-bold border-b-2 transition -mb-px"
        :class="mode === tab.id
          ? 'border-irancell-yellow text-heading'
          : 'border-transparent text-muted hover:text-heading'"
        @click="mode = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <form @submit.prevent="submit">
      <!-- Simple: single input -->
      <div v-if="mode === 'simple'">
        <input
          v-model="simpleQuery"
          type="tel"
          maxlength="11"
          dir="ltr"
          placeholder="مثال: 09309988235"
          class="w-full rounded-xl px-4 py-3.5 text-center text-xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-irancell-yellow transition"
          :class="inputClass"
          @input="onSimpleInput"
          @keydown.enter.prevent="submit"
        />
      </div>

      <!-- Advanced: 0930 | 998 | 8235 -->
      <div v-else class="flex items-center justify-center gap-2 flex-wrap" dir="ltr">
        <input
          v-model="prefixBox"
          type="tel"
          maxlength="4"
          placeholder="0930"
          dir="ltr"
          class="segment-box segment-prefix"
          :class="segmentClass"
          @input="onSegmentInput('prefix', 4, $event)"
          @keydown.enter.prevent="submit"
        />
        <span class="text-2xl font-light text-muted">-</span>
        <input
          v-model="middleBox"
          type="tel"
          maxlength="3"
          placeholder="998"
          dir="ltr"
          class="segment-box"
          :class="segmentClass"
          @input="onSegmentInput('middle', 3, $event)"
          @keydown.enter.prevent="submit"
        />
        <span class="text-2xl font-light text-muted">-</span>
        <input
          v-model="endBox"
          type="tel"
          maxlength="4"
          placeholder="8235"
          dir="ltr"
          class="segment-box segment-end"
          :class="segmentClass"
          @input="onSegmentInput('end', 4, $event)"
          @keydown.enter.prevent="submit"
        />
      </div>

      <button
        type="submit"
        class="btn-primary w-full py-3 mt-5 flex items-center justify-center gap-2"
        :disabled="loading"
      >
        <span v-if="loading" class="w-5 h-5 border-2 border-irancell-black/30 border-t-irancell-black rounded-full animate-spin" />
        <span>{{ loading ? 'در حال جستجو...' : 'جستجو' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  toAsciiDigits,
  countSearchDigits,
  restDigitsFromSegments,
  type SimSearchMode,
  type SimSearchPayload,
} from '~/utils/numberSearch'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'hero'
  loading?: boolean
  initialMode?: SimSearchMode
  initialQuery?: string
  initialPrefix?: string
  initialMiddle?: string
  initialEnd?: string
}>(), {
  variant: 'default',
  loading: false,
  initialMode: 'simple',
  initialQuery: '',
  initialPrefix: '0930',
  initialMiddle: '',
  initialEnd: '',
})

const emit = defineEmits<{
  search: [payload: SimSearchPayload]
}>()

const tabs = [
  { id: 'simple' as const, label: 'ساده' },
  { id: 'advanced' as const, label: 'پیشرفته' },
]

const mode = ref<SimSearchMode>(props.initialMode)
const simpleQuery = ref(props.initialQuery)
const prefixBox = ref(props.initialPrefix)
const middleBox = ref(props.initialMiddle)
const endBox = ref(props.initialEnd)

const inputClass = computed(() =>
  props.variant === 'hero'
    ? 'bg-white text-irancell-black border-0 shadow-lg'
    : 'input-field'
)

const segmentClass = computed(() =>
  props.variant === 'hero'
    ? 'bg-white text-irancell-black placeholder:text-gray-400 border-0 shadow-lg'
    : 'input-field'
)

const onSimpleInput = (e: Event) => {
  simpleQuery.value = toAsciiDigits((e.target as HTMLInputElement).value).replace(/\D/g, '').slice(0, 11)
  ;(e.target as HTMLInputElement).value = simpleQuery.value
}

const onSegmentInput = (field: 'prefix' | 'middle' | 'end', max: number, e: Event) => {
  const val = toAsciiDigits((e.target as HTMLInputElement).value).replace(/\D/g, '').slice(0, max)
  if (field === 'prefix') prefixBox.value = val
  else if (field === 'middle') middleBox.value = val
  else endBox.value = val
  ;(e.target as HTMLInputElement).value = val
}

const getPayload = (): SimSearchPayload | null => {
  const payload: SimSearchPayload = mode.value === 'simple'
    ? { mode: 'simple', query: simpleQuery.value.trim() }
    : {
        mode: 'advanced',
        prefix: prefixBox.value || '0930',
        middle: middleBox.value,
        end: endBox.value,
        restDigits: restDigitsFromSegments(prefixBox.value, middleBox.value, endBox.value),
      }

  if (countSearchDigits(payload) < 3) return null
  return payload
}

const submit = () => {
  const payload = getPayload()
  if (!payload) return
  emit('search', payload)
}

defineExpose({ getPayload, submit })
</script>

<style scoped>
.segment-box {
  @apply rounded-xl px-3 py-3 text-center text-xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-irancell-yellow transition;
}
.segment-prefix {
  @apply w-[5.5rem] sm:w-24;
}
.segment-end {
  @apply w-[6.5rem] sm:w-28;
}
.segment-box:not(.segment-prefix):not(.segment-end) {
  @apply w-20;
}
</style>
