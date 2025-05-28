<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-neutral-850 text-neutral-100">
    <h1 class="text-8xl font-black text-sky-500 mb-4">404</h1>
    <h2 class="text-3xl font-semibold mb-6">{{ t('notFoundPage.title') }}</h2>
    <p class="text-neutral-400 mb-8">{{ t('notFoundPage.message') }}</p>
    <RouterLink to="/"
      class="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200">
      {{ t('notFoundPage.backToHome') }}
    </RouterLink>
  </div>
</template>

<style scoped>
.bg-neutral-850 {
  background-color: #222733;
}
</style>