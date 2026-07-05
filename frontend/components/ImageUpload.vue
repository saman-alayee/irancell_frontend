<template>
  <div>
    <label v-if="label" class="block text-sm font-bold mb-2">{{ label }}</label>
    <div
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-irancell-yellow transition cursor-pointer"
      @click="inputRef?.click()"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div v-if="preview" class="relative inline-block">
        <img :src="preview" alt="preview" class="max-h-40 rounded-lg mx-auto object-contain" />
        <button
          type="button"
          class="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
          @click.stop="clear"
        >×</button>
      </div>
      <div v-else class="py-6 text-gray-400 dark:text-gray-500">
        <div class="text-3xl mb-2">📷</div>
        <p class="text-sm">کلیک یا فایل را اینجا رها کنید</p>
        <p class="text-xs mt-1">JPG, PNG, WEBP — حداکثر ۵MB</p>
      </div>
    </div>
    <input ref="inputRef" type="file" accept="image/*" class="hidden" @change="onSelect" />
    <p v-if="uploading" class="text-sm text-heading mt-2">در حال آپلود...</p>
    <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { apiUploadImage } = useApi()
const inputRef = ref<HTMLInputElement>()
const preview = ref(props.modelValue || '')
const uploading = ref(false)
const error = ref('')

watch(() => props.modelValue, (v) => { preview.value = v || '' })

const upload = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    error.value = 'فقط فایل تصویری مجاز است'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'حداکثر حجم ۵ مگابایت'
    return
  }
  uploading.value = true
  error.value = ''
  try {
    const url = await apiUploadImage(file)
    preview.value = url
    emit('update:modelValue', url)
  } catch (e: any) {
    error.value = e.message
  } finally {
    uploading.value = false
  }
}

const onSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) upload(file)
}

const onDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) upload(file)
}

const clear = () => {
  preview.value = ''
  emit('update:modelValue', '')
  if (inputRef.value) inputRef.value.value = ''
}
</script>
