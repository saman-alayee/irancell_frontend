<template>
  <div class="card p-6">
    <h3 class="font-bold mb-4">{{ title }}</h3>
    <div class="relative" :style="{ height: `${height}px` }">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  labels: string[]
  data: number[]
  color?: string
  height?: number
}>(), {
  color: '#FFCC00',
  height: 220,
})

const themeStore = useThemeStore()
const canvasRef = ref<HTMLCanvasElement>()

const barColor = computed(() => {
  if (props.color === '#1A1A1A' && themeStore.dark) return '#9ca3af'
  return props.color
})

const labelColor = computed(() => themeStore.dark ? '#9ca3af' : '#666')

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas || !props.data.length) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const w = canvas.parentElement?.clientWidth || 400
  const h = props.height
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, w, h)
  const max = Math.max(...props.data, 1)
  const pad = { t: 20, r: 16, b: 36, l: 16 }
  const chartW = w - pad.l - pad.r
  const chartH = h - pad.t - pad.b
  const barW = chartW / props.data.length * 0.6
  const gap = chartW / props.data.length

  props.data.forEach((val, i) => {
    const barH = (val / max) * chartH
    const x = pad.l + i * gap + (gap - barW) / 2
    const y = pad.t + chartH - barH
    ctx.fillStyle = barColor.value
    ctx.beginPath()
    ctx.roundRect(x, y, barW, barH, 4)
    ctx.fill()

    ctx.fillStyle = labelColor.value
    ctx.font = '10px Vazirmatn, sans-serif'
    ctx.textAlign = 'center'
    const label = props.labels[i] || ''
    ctx.fillText(label.slice(5) || label, x + barW / 2, h - 10)
  })
}

watch(() => [props.data, props.labels, themeStore.dark], draw, { deep: true })
onMounted(() => {
  themeStore.init()
  draw()
  window.addEventListener('resize', draw)
})
onUnmounted(() => window.removeEventListener('resize', draw))
</script>
