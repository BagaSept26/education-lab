<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const { t } = useI18n();
const router = useRouter();

const featureName = t('dashboard.features.KamusJepang.name');
const searchWord = ref('');
const searchResults = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const initialLoad = ref(true); //tampilan pesan awal

async function submitSearchWord() {
  if(!searchWord.value.trim()){
    errorMessage.value = t('featuresPage.kamusJepang.errorNoWord');
    searchResults.value = null;
    initialLoad.value = false;
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  searchResults.value = null;
  initialLoad.value = false;

  try {
    const response = await api.cariKataJepang({ kata: searchWord.value });
    // Asumsikan backend mengembalikan objek dengan properti 'data' dari Jisho API
    // atau format yang sudah disederhanakan oleh backend kita.
    // Jisho API mengembalikan { meta: {...}, data: [...] }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      if (response.data.data.length > 0) {
        searchResults.value = response.data.data; // Ambil array hasil pencarian
      } else {
        errorMessage.value = t('featuresPage.kamusJepang.errorNotFound', { word: searchWord.value });
      }
    } else if (response.data && response.data.error) { // Jika backend kita mengembalikan error terstruktur
        errorMessage.value = response.data.error;
    }
    else {
      errorMessage.value = t('featuresPage.apiErrorNoData');
      console.warn('Unexpected API response format for kamus Jepang:', response.data);
    }
  } catch (error) {
    console.error('Error searching Japanese word:', error);
    const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message || t('featuresPage.apiErrorNetwork');
    errorMessage.value = `${t('featuresPage.kamusJepang.errorSearchFailed')}: ${errorDetail}`;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="feature-page-container flex flex-col min-h-screen bg-neutral-850 text-neutral-100">
    <!-- Header Fitur -->
    <header class="p-4 shadow-md bg-neutral-900 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center">
        <button
          @click="router.back()"
          class="mr-4 p-2 rounded-full hover:bg-neutral-700 transition-colors"
          :aria-label="t('featuresPage.backToDashboard')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 class="text-xl md:text-2xl font-semibold text-sky-400">
          {{ featureName }}
        </h1>
      </div>
    </header>

    <!-- Konten Utama Fitur -->
    <main class="flex-grow flex flex-col items-center p-4 md:p-8">
      <div class="w-full max-w-2xl bg-neutral-900 p-6 md:p-8 rounded-xl shadow-2xl">
        
        <!-- Input Pencarian -->
        <form @submit.prevent="submitSearchWord" class="flex items-center gap-3 mb-6">
          <input
            type="text"
            v-model="searchWord"
            :placeholder="t('featuresPage.kamusJepang.searchInputPlaceholder')"
            class="flex-grow p-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-sm"
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square"
            :disabled="isLoading || !searchWord.trim()"
            :aria-label="t('featuresPage.kamusJepang.searchButtonLabel')"
          >
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <!-- Pesan Error -->
        <div v-if="errorMessage && !isLoading" class="mb-4 p-3 bg-red-700/30 border border-red-700 text-red-300 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <!-- Area Hasil Pencarian -->
        <div v-if="isLoading" class="text-center py-10">
          <p class="text-neutral-400">{{ t('featuresPage.kamusJepang.loadingMessage') }}</p>
        </div>

        <div v-if="initialLoad && !isLoading && !errorMessage" class="text-center py-10 text-neutral-500">
            {{ t('featuresPage.kamusJepang.initialMessage') }}
        </div>

        <div v-if="searchResults && searchResults.length > 0 && !isLoading" class="space-y-6">
          <div v-for="(result, index) in searchResults" :key="index" class="bg-neutral-800 p-4 rounded-lg shadow">
            <!-- Tampilan Kata dan Bacaan (Slug, Japanese reading) -->
            <div class="mb-2">
              <h2 v-if="result.japanese && result.japanese.length > 0" class="text-2xl font-semibold text-sky-300">
                {{ result.japanese[0].word || result.slug }} 
                <span v-if="result.japanese[0].reading" class="text-lg text-neutral-400 ml-2">({{ result.japanese[0].reading }})</span>
              </h2>
              <p v-else class="text-2xl font-semibold text-sky-300">{{ result.slug }}</p>
            </div>

            <!-- Senses / Makna -->
            <div v-if="result.senses && result.senses.length > 0" class="space-y-3">
              <div v-for="(sense, senseIdx) in result.senses" :key="senseIdx" class="border-l-2 border-sky-500 pl-3">
                <p v-if="sense.parts_of_speech && sense.parts_of_speech.length > 0" class="text-xs text-neutral-400 italic mb-1">
                  {{ sense.parts_of_speech.join(', ') }}
                </p>
                <ul v-if="sense.english_definitions && sense.english_definitions.length > 0" class="list-disc list-inside ml-1">
                  <li v-for="(def, defIdx) in sense.english_definitions" :key="defIdx" class="text-sm text-neutral-200">
                    {{ def }}
                  </li>
                </ul>
                <div v-if="sense.tags && sense.tags.length > 0" class="mt-1">
                    <span v-for="tag in sense.tags" :key="tag" class="text-xs bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded mr-1">{{ tag }}</span>
                </div>
                <div v-if="sense.links && sense.links.length > 0" class="mt-1">
                    <a v-for="link in sense.links" :key="link.text" :href="link.url" target="_blank" rel="noopener noreferrer" class="text-xs text-sky-400 hover:underline mr-2">{{ link.text }}</a>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-neutral-400">{{ t('featuresPage.kamusJepang.noDefinitionsFound') }}</p>
          </div>
        </div>
      </div>
    </main>
     <footer class="p-4 text-center text-xs text-neutral-500">
        <p v-html="t('footerText', { year: new Date().getFullYear() })"></p>
    </footer>
  </div>
</template>

<style scoped>
/* Styling spesifik jika perlu */
.bg-neutral-850 {
  background-color: #1c212e;
}
</style>