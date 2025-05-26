<script setup>
// frontend/src/views/features/GrammarCheckerView.vue
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

// Pastikan path i18n ini ('dashboard.features.grammarChecker.name') ada di file locale Anda
const featureName = t('dashboard.features.KamusJepangView.name');
</script>

<template>
  <div class="feature-page-container min-h-screen flex flex-col items-center justify-center p-8 text-center">
    <h1 class="text-5xl font-bold mb-6 text-sky-400">
      {{ t('featuresPage.title', { featureName: featureName }) }}
    </h1>
    <p class="text-xl text-neutral-300 mb-8">
      {{ t('featuresPage.comingSoon') }}
    </p>
    <button
      @click="router.back()"
      class="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200"
    >
      Kembali ke Dashboard <!-- Anda bisa juga mentranslasikan teks tombol ini -->
    </button>
  </div>
</template>

<style scoped>
/* Styling spesifik jika perlu */
</style>